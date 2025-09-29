const axios = require('axios');
const User = require('../models/user.model');

const MSPACE_APP_ID = process.env.MSPACE_APP_ID;
const MSPACE_PASSWORD = process.env.MSPACE_PASSWORD;
const API_VERSION = '1.0';
const SEND_SMS_URL = 'https://api.mspace.lk/sms/send';
const RETRIEVE_SMS_URL = 'https://api.mspace.lk/sms/receive';


exports.sendSMS = async (mobileNumbers, message) => {
    try {
      const payload = {
        version: API_VERSION,
        applicationId: MSPACE_APP_ID,
        password: MSPACE_PASSWORD,
        message: message,
        destinationAddresses: ['tel:' + mobileNumbers.join(',tel:')],
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