const axios = require('axios');
const User = require('../models/user.model');
const Enrollment = require('../models/enrollment.model');
const Event = require('../models/event.model');
const ApiError = require('../utils/ApiError');

const MSPACE_APP_ID = process.env.MSPACE_APP_ID;
const MSPACE_PASSWORD = process.env.MSPACE_PASSWORD;
const API_VERSION = '1.0';
const SEND_SMS_URL = 'https://api.mspace.lk/sms/send';
const RETRIEVE_SMS_URL = 'https://api.mspace.lk/sms/receive';

exports.sendEventUpdate = async (eventId, createdBy, notificationMessage) => {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        return next(new ApiError(404, 'Event not found'));
      }
      
      // Check if user is the event creator or has admin rights
      if (event.createdBy.toString() !== createdBy && req.user.role !== 'admin') {
        return next(new ApiError(403, 'You are not authorized to create notifications for this event'));
      } 

      const enrolledUserIds = await Enrollment.find({ eventId }).populate('userId');
      const enrolledUsers = await User.find({ 
        _id: { $in: enrolledUserIds.map(enrollment => enrollment.userId._id) },
        subscriptionStatus: 'active',
        maskedMobile: { $ne: null }
      });

      const maskedMobileNumbers = enrolledUsers.map(user => user.maskedMobile);

      if (maskedMobileNumbers.length === 0) {
        throw new Error('No attendees with active subscriptions found for this event');
      }

      // Send SMS to all attendees
      const message = `Update for "${event.title}"!\n\n${notificationMessage}\n\nEvent Date: ${event.date ? event.date.toLocaleString() : 'TBA'}\nLocation: ${event.location || 'TBA'}\n\n- SimplyTix Team`;

      const response = await this.sendSMS(maskedMobileNumbers, message);

      return response;
    }
    catch (error) {
      console.error('Failed to send event update SMS:', error.message);
      throw new Error('Failed to send event update SMS');
    }
  }

exports.sendConfirmationMessage = async (userId, confirmationMessage) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      if (!user.maskedMobile) {
        throw new Error('User does not have a masked mobile number');
      }
      const response = await this.sendSMS([user.maskedMobile], confirmationMessage);
      return response;
    } catch (error) {
      console.error('Failed to send confirmation SMS:', error.message);
      throw new Error('Failed to send confirmation SMS');
    }
};

exports.sendSMS = async (maskedMobileNumbers, message) => {
    try {
      const payload = {
        version: API_VERSION,
        applicationId: MSPACE_APP_ID,
        password: MSPACE_PASSWORD,
        message: message,
        destinationAddresses: maskedMobileNumbers,
        destinationAddresses: maskedMobileNumbers,
      };

      console.log(payload);

      const response = await axios.post(SEND_SMS_URL, payload);

      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('SMS sending failed:', error.message);
      throw new Error('Failed to send SMS notification');
    }
  }

exports.retrieveSMS = async () => {
    try {
      const payload = {
        version: API_VERSION,
        applicationId: MSPACE_APP_ID,
        password: MSPACE_PASSWORD,
      };
      const response = await axios.post(RETRIEVE_SMS_URL, payload);
      console.log('Retrieved SMS:', response.data);
      return response.data;
    }
    catch (error) {
      console.error('Failed to retrieve SMS:', error.message);
      throw new Error('Failed to retrieve SMS');
    }
  }