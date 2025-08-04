import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/General/Navbar';
import Footer from "../components/General/Footer";
import EventModal from '../components/MyEvent/EventModal';
import EventCardsForCreated from '../components/MyEvent/EventCardsForCreated';
import EventCardsForEnroll from '../components/MyEvent/EventCardsForEnroll';
import NoEnrolledEventsMessage from '../components/MyEvent/NoEnrolledEventsMessage';
import EnrollmentStats from '../components/MyEvent/EnrollmentStats';
import CreateEventForm from '../components/MyEvent/CreateEventForm';
import NotifyAttendeesModal from '../components/MyEvent/NotifyAttendeesModal';
import { isTokenValid, clearAuthData } from '../utils/auth';
import { FaPlus, FaCalendarPlus } from "react-icons/fa6";

const Myevents = () => {
  const [username, setUsername] = useState("");
  const [events, setEvents] = useState([]);
  const [rawEvents, setRawEvents] = useState([]);
  const [userEnrollments, setUserEnrollments] = useState([]);
  const [enrolledEventsData, setEnrolledEventsData] = useState([]);
  const [transformedEnrolledEvents, setTransformedEnrolledEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationEvent, setNotificationEvent] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [sendingNotification, setSendingNotification] = useState(false);
  const navigate = useNavigate();

  const transformEventData = (backendEvent) => {
    const isEnrolled = userEnrollments.some(enrollment => {
      const enrollmentEventId = enrollment.event?._id || enrollment.event?.id || enrollment.eventId;
      return enrollmentEventId === backendEvent._id;
    });

    return {
      id: backendEvent._id,
      title: backendEvent.title,
      description: backendEvent.description,
      eventCode: backendEvent.eventCode,
      type: backendEvent.type,
      date: backendEvent.date,
      time: backendEvent.time || 'Time TBA',
      location: backendEvent.location || 'Location TBA',
      imageUrl: backendEvent.imageUrl || '/simplytix.svg',
      district: backendEvent.district || 'General',
      createdBy: backendEvent.createdBy,
      createdByName: typeof backendEvent.createdBy === 'object' && backendEvent.createdBy?.name
        ? backendEvent.createdBy.name
        : backendEvent.createdBy || 'Unknown',
      maxAttendees: backendEvent.maxAttendees || 100,
      attendees: backendEvent.attendees || [],
      enrollmentCount: Array.isArray(backendEvent.attendees) ? backendEvent.attendees.length : 0,
      tags: backendEvent.tags || [],
      isEnrolled: isEnrolled,
      tickets: backendEvent.tickets && backendEvent.tickets.length > 0
        ? backendEvent.tickets.map(ticket => ({
            id: ticket._id || ticket.id,
            name: ticket.name,
            price: ticket.price,
            totalQuantity: ticket.totalQuantity || ticket.quantity || 100,
            availableQuantity: ticket.availableQuantity || ticket.quantity || 100,
            soldQuantity: ticket.soldQuantity || 0,
            quantity: ticket.totalQuantity || ticket.quantity || 100,
            isAvailable: (ticket.availableQuantity || ticket.quantity || 100) > 0,
            percentageSold: ticket.totalQuantity ? ((ticket.soldQuantity || 0) / ticket.totalQuantity * 100).toFixed(1) : 0
          }))
        : [{
            id: 'default',
            name: 'General Admission',
            price: 0,
            totalQuantity: 100,
            availableQuantity: 100,
            soldQuantity: 0,
            quantity: 100,
            isAvailable: true,
            percentageSold: 0
          }],
      price: backendEvent.tickets && backendEvent.tickets.length > 0 ? backendEvent.tickets[0].price : 0,
      ticketTypes: backendEvent.tickets && backendEvent.tickets.length > 0
        ? backendEvent.tickets.map(ticket => ({
            id: ticket._id || ticket.id,
            name: ticket.name,
            price: ticket.price,
            totalQuantity: ticket.totalQuantity || ticket.quantity || 100,
            availableQuantity: ticket.availableQuantity || ticket.quantity || 100,
            soldQuantity: ticket.soldQuantity || 0,
            quantity: ticket.totalQuantity || ticket.quantity || 100,
            isAvailable: (ticket.availableQuantity || ticket.quantity || 100) > 0,
            percentageSold: ticket.totalQuantity ? ((ticket.soldQuantity || 0) / ticket.totalQuantity * 100).toFixed(1) : 0
          }))
        : [{
            id: 'default',
            name: 'General Admission',
            price: 0,
            totalQuantity: 100,
            availableQuantity: 100,
            soldQuantity: 0,
            quantity: 100,
            isAvailable: true,
            percentageSold: 0
          }],
      formattedDate: backendEvent.date ? new Date(backendEvent.date).toLocaleDateString() : '',
      formattedTime: backendEvent.time || 'Time TBA',
      category: backendEvent.category || backendEvent.type,
      isFree: backendEvent.tickets ? backendEvent.tickets.every(ticket => ticket.price === 0) : true,
      totalSoldTickets: backendEvent.totalSoldTickets || 0,
      totalAvailableTickets: backendEvent.totalAvailableTickets || 0,
      totalTickets: backendEvent.totalTickets || (backendEvent.totalSoldTickets || 0) + (backendEvent.totalAvailableTickets || 0) ||
        (backendEvent.tickets && backendEvent.tickets.length > 0
          ? backendEvent.tickets.reduce((sum, ticket) => sum + (ticket.totalQuantity || ticket.quantity || 0), 0)
          : 100),
      isSoldOut: backendEvent.totalAvailableTickets === 0,
      createdAt: backendEvent.createdAt,
      updatedAt: backendEvent.updatedAt
    };
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken || !isTokenValid(accessToken)) {
        console.error("No access token found or token is invalid. User needs to log in.");
        clearAuthData();
        navigate("/login", { state: { message: "Your session has expired. Please log in again." } });
        return;
      }

      await fetchUserEnrollments();

      const response = await fetch('/api/events', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        console.error("Access token expired or invalid. Redirecting to login...");
        clearAuthData();
        navigate("/login", { state: { message: "Your session has expired. Please log in again." } });
        return;
      }

      if (!response.ok) {
        throw new Error(`Backend API error! status: ${response.status}`);
      }

      const data = await response.json();
      let eventsArray = [];
      if (Array.isArray(data)) {
        eventsArray = data;
      } else if (data && data.success && Array.isArray(data.data)) {
        eventsArray = data.data;
      } else if (data && Array.isArray(data.events)) {
        eventsArray = data.events;
      } else {
        console.warn('API response format not recognized:', data);
        eventsArray = [];
      }

      setRawEvents(eventsArray);
      setError(null);
    } catch (error) {
      console.error("Backend API failed:", error);
      setRawEvents([]);
      setError("Failed to load events. Please check your connection and ensure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEnrollments = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");

      if (!token || !userId || !isTokenValid(token)) {
        console.log("No access token found or token is invalid.");
        setUserEnrollments([]);
        setEnrolledEventsData([]);
        return [];
      }

      const response = await fetch('/api/enrollments/my', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        console.error("Access token expired or invalid. Redirecting to login...");
        clearAuthData();
        navigate("/login", { state: { message: "Your session has expired. Please log in again." } });
        return [];
      }

      if (!response.ok) {
        console.log('Failed to fetch user enrollments');
        setUserEnrollments([]);
        setEnrolledEventsData([]);
        return [];
      }

      const data = await response.json();

      if (data && data.success && Array.isArray(data.data)) {
        setUserEnrollments(data.data.map(enrollment => ({
          event: enrollment.event,
          eventId: enrollment.event._id || enrollment.event.id,
          userId: enrollment.userId || userId
        })));

        const enrolledEvents = data.data.map(enrollment => {
          const event = enrollment.event;
          return {
            ...event,
            enrollmentId: enrollment._id,
            enrolledAt: enrollment.enrolledAt,
            _id: event._id || event.id
          };
        });

        setEnrolledEventsData(enrolledEvents);
        return enrolledEvents;
      } else {
        setUserEnrollments([]);
        setEnrolledEventsData([]);
        return [];
      }
    } catch (error) {
      console.error('Error fetching user enrollments:', error);
      setUserEnrollments([]);
      setEnrolledEventsData([]);
      return [];
    }
  };

  const fetchEnrollmentCounts = async (eventIds) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token || !isTokenValid(token)) {
        return {};
      }

      const enrollmentCounts = {};

      for (const eventId of eventIds) {
        try {
          const response = await fetch(`/api/enrollments/event/${eventId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            const enrollments = data.data || data || [];
            enrollmentCounts[eventId] = enrollments.length;
          } else {
            enrollmentCounts[eventId] = 0;
          }
        } catch (error) {
          console.error(`Error fetching enrollment count for event ${eventId}:`, error);
          enrollmentCounts[eventId] = 0;
        }
      }

      return enrollmentCounts;
    } catch (error) {
      console.error('Error fetching enrollment counts:', error);
      return {};
    }
  };

  useEffect(() => {
    const transformAndFetchCounts = async () => {
      if (rawEvents.length > 0) {
        const transformedEvents = rawEvents.map(transformEventData);
        const currentUserId = localStorage.getItem("userId");
        const createdEventIds = transformedEvents
          .filter(event => {
            const eventCreatorId = event.creator?._id || event.creator || event.createdBy?._id || event.createdBy;
            return eventCreatorId === currentUserId;
          })
          .map(event => event.id);

        if (createdEventIds.length > 0) {
          const enrollmentCounts = await fetchEnrollmentCounts(createdEventIds);
          const eventsWithCounts = transformedEvents.map(event => {
            if (createdEventIds.includes(event.id)) {
              return {
                ...event,
                enrollmentCount: enrollmentCounts[event.id] || 0
              };
            }
            return event;
          });

          setEvents(eventsWithCounts);
        } else {
          setEvents(transformedEvents);
        }
      }
    };

    transformAndFetchCounts();
  }, [userEnrollments, rawEvents]);

  useEffect(() => {
    if (enrolledEventsData.length > 0) {
      const transformedEnrolled = enrolledEventsData.map(event => {
        const transformed = transformEventData(event);
        return { ...transformed, isEnrolled: true };
      });
      setTransformedEnrolledEvents(transformedEnrolled);
    } else {
      setTransformedEnrolledEvents([]);
    }
  }, [enrolledEventsData, userEnrollments]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchEvents();
        await fetchUserEnrollments();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    const token = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");

    if (!loggedInUser || !token) {
      console.log("No user logged in or token missing, redirecting to login");
      clearAuthData();
      navigate("/login");
      return;
    }

    if (!isTokenValid(token)) {
      console.log("Token expired or invalid, redirecting to login");
      clearAuthData();
      navigate("/login", { state: { message: "Your session has expired. Please log in again." } });
      return;
    }

    setUsername(loggedInUser);
  }, [navigate]);

  const handleLogout = () => {
    clearAuthData();
    navigate("/login");
  };

  const handleEnroll = async (eventId, isCurrentlyEnrolled = false) => {
    const event = events.find(e => e.id === eventId);
    const actuallyEnrolled = event ? event.isEnrolled : false;

    try {
      setEnrolling(true);
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        alert("Please log in to enroll in events");
        navigate("/login");
        return;
      }

      const endpoint = `/api/enrollments/event/${eventId}`;
      const method = actuallyEnrolled ? 'DELETE' : 'POST';

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert("Session expired. Please log in again.");
          localStorage.clear();
          navigate("/login");
          return;
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `${actuallyEnrolled ? 'Unenrollment' : 'Enrollment'} failed`);
      }

      const data = await response.json();

      if (actuallyEnrolled) {
        setUserEnrollments(prev => {
          const updated = prev.filter(enrollment => {
            const enrollmentEventId = enrollment.event?._id || enrollment.event?.id || enrollment.eventId;
            return enrollmentEventId !== eventId;
          });
          return updated;
        });
      } else {
        setUserEnrollments(prev => {
          const updated = [...prev, {
            eventId: eventId,
            userId: userId,
            event: { _id: eventId, id: eventId }
          }];
          return updated;
        });
      }

      if (selectedEvent && (selectedEvent.id === eventId || selectedEvent._id === eventId)) {
        setSelectedEvent({ ...selectedEvent, isEnrolled: !actuallyEnrolled });
      }

      await fetchUserEnrollments();
      await fetchEvents();

      const successMessage = actuallyEnrolled
        ? '✅ Successfully unenrolled from the event!'
        : '🎉 Successfully enrolled in the event!';
      alert(successMessage);

    } catch (error) {
      console.error(`${actuallyEnrolled ? 'Unenrollment' : 'Enrollment'} failed:`, error);
      alert(`❌ ${error.message}`);
    } finally {
      setEnrolling(false);
    }
  };

  const handleDeleteEvent = async (event) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token || !isTokenValid(token)) {
        alert("Your session has expired. Please log in again.");
        clearAuthData();
        navigate("/login", { state: { message: "Your session has expired. Please log in again." } });
        return;
      }

      const eventResponse = await fetch(`http://localhost:3000/api/events/${event._id || event.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!eventResponse.ok) {
        if (eventResponse.status === 401) {
          alert("Session expired. Please log in again.");
          localStorage.clear();
          navigate("/login");
          return;
        } else if (eventResponse.status === 404) {
          alert("Event not found.");
          return;
        }

        const errorData = await eventResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch event details');
      }

      const eventData = await eventResponse.json();
      const currentEvent = eventData.event || eventData;

      if (currentEvent.attendees && currentEvent.attendees.length > 0) {
        const attendeeCount = currentEvent.attendees.length;
        const confirmMessage = `⚠️ This event has ${attendeeCount} attendee${attendeeCount > 1 ? 's' : ''} enrolled. Deleting this event will affect all enrolled users. Are you sure you want to continue?`;

        if (!window.confirm(confirmMessage)) {
          return;
        }
      } else {
        if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
          return;
        }
      }

      const response = await fetch(`http://localhost:3000/api/events/${event._id || event.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert("Your session has expired. Please log in again.");
          clearAuthData();
          navigate("/login", { state: { message: "Your session has expired. Please log in again." } });
          return;
        } else if (response.status === 403) {
          alert("You don't have permission to delete this event.");
          return;
        } else if (response.status === 404) {
          alert("Event not found.");
          return;
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete event');
      }

      alert('✅ Event deleted successfully!');
      fetchEvents();

      if (selectedEvent && (selectedEvent.id === (event._id || event.id) || selectedEvent._id === (event._id || event.id))) {
        setSelectedEvent(null);
      }

    } catch (error) {
      console.error('Failed to delete event:', error);
      alert(`❌ Failed to delete event: ${error.message}`);
    }
  };

  const handleEditEvent = async (event) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token || !isTokenValid(token)) {
        alert("Your session has expired. Please log in again.");
        clearAuthData();
        navigate("/login", { state: { message: "Your session has expired. Please log in again." } });
        return;
      }

      const eventResponse = await fetch(`http://localhost:3000/api/events/${event._id || event.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!eventResponse.ok) {
        if (eventResponse.status === 401) {
          alert("Session expired. Please log in again.");
          localStorage.clear();
          navigate("/login");
          return;
        } else if (eventResponse.status === 404) {
          alert("Event not found.");
          return;
        }

        const errorData = await eventResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch event details');
      }
      
      const eventData = await eventResponse.json();
      const currentEvent = eventData.event || eventData;

      if (currentEvent.attendees && currentEvent.attendees.length > 0) {
        const attendeeCount = currentEvent.attendees.length;
        const confirmMessage = `⚠️ This event has ${attendeeCount} attendee${attendeeCount > 1 ? 's' : ''} enrolled. Editing this event may affect all enrolled users. Are you sure you want to continue?`;

        if (!window.confirm(confirmMessage)) {
          return;
        }
      }
      console.log('Editing event:', currentEvent);
      setEditingEvent(currentEvent);
      setShowCreateForm(true);

    } catch (error) {
      console.error('Failed to edit event:', error);
      alert(`❌ Failed to fetch event for editing: ${error.message}`);
    }
  };

  const handleNotifyAttendees = (event) => {
    setNotificationEvent(event);
    setShowNotificationModal(true);
    setNotificationMessage('');
  };

  const currentUserId = localStorage.getItem("userId");
  const safeEvents = Array.isArray(events) ? events : [];
  const createdEvents = loading ? [] : safeEvents.filter(event => {
    const eventCreatorId = event.creator?._id || event.creator || event.createdBy?._id || event.createdBy;
    const isMatch = eventCreatorId === currentUserId;
    return isMatch;
  });

  const totalPrice = transformedEnrolledEvents.reduce((sum, event) => sum + (parseFloat(event.price) || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col">
      <Navbar username={username} onLogout={handleLogout} />
      <main className="flex-1 py-8 bg-gradient-to-br from-black via-gray-900/80 to-gray-950 min-h-screen">
        <div className="w-full max-w-6xl mx-auto mb-8 px-4">
          <div className="text-center relative">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 drop-shadow-lg tracking-tight animate-fade-in">
              <span className="inline-block animate-gradient-x">My Events</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-2 animate-fade-in delay-100">
              View and manage all the events you've enrolled in. Keep track of your upcoming events and buy tickets when needed.
            </p>
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-lg animate-fade-in"
              >
                <FaPlus className="text-xl" />
                Create Event
              </button>
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full mt-4 animate-pulse"></div>
            <div className="absolute top-0 right-0 flex gap-2">
              <span className="inline-block w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
              <span className="inline-block w-3 h-3 bg-blue-400 rounded-full animate-pulse"></span>
              <span className="inline-block w-3 h-3 bg-purple-400 rounded-full animate-pulse"></span>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            <span className="ml-3 text-white text-lg">Loading your enrolled events...</span>
          </div>
        )}

        {error && (
          <div className="max-w-6xl mx-auto px-4 mb-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
                </div>
                <div className="ml-auto">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
            <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12 animate-fade-in">
                {/* Created Events Card */}
                <div className="relative group bg-gradient-to-br from-purple-700/80 via-blue-700/60 to-purple-900/80 rounded-2xl px-10 py-8 shadow-2xl border border-purple-400/30 text-center transition-transform duration-300 hover:scale-105 hover:shadow-purple-500/30">
                  <div className="absolute -top-4 -right-4 bg-gradient-to-tr from-purple-400 to-blue-400 rounded-full w-10 h-10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform animate-pulse">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-blue-300 to-purple-400 mb-2 drop-shadow-lg animate-gradient-x">
                    {createdEvents.length}
                  </div>
                  <div className="text-white text-lg font-semibold tracking-wide uppercase opacity-90">Created Events</div>
                </div>
                {/* Enrolled Events Card */}
                <div className="relative group bg-gradient-to-br from-green-700/80 via-blue-700/60 to-green-900/80 rounded-2xl px-10 py-8 shadow-2xl border border-green-400/30 text-center transition-transform duration-300 hover:scale-105 hover:shadow-green-500/30">
                  <div className="absolute -top-4 -right-4 bg-gradient-to-tr from-green-400 to-blue-400 rounded-full w-10 h-10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform animate-pulse">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12l2 2 4-4" /></svg>
                  </div>
                  <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-blue-300 to-green-400 mb-2 drop-shadow-lg animate-gradient-x">
                    {transformedEnrolledEvents.length}
                  </div>
                  <div className="text-white text-lg font-semibold tracking-wide uppercase opacity-90">Enrolled Events</div>
                </div>
              </div>

            <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">Your Created Events</h2>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              ) : createdEvents.length > 0 ? (
                <EventCardsForCreated
                  events={createdEvents}
                  onEventClick={setSelectedEvent}
                  currentUserId={currentUserId}
                  onEditEvent={handleEditEvent}
                  onDeleteEvent={handleDeleteEvent}
                  onNotifyAttendees={handleNotifyAttendees}
                />
              ) : (
                <div className="text-center py-12 bg-gradient-to-br from-black/80 via-purple-900/40 to-blue-900/40 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl animate-fade-in">
                  <FaCalendarPlus className="text-6xl text-purple-400 mx-auto mb-4 animate-bounce" />
                  <h3 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">No Created Events</h3>
                  <p className="text-gray-400 mb-2">
                    You haven't created any events yet. Click the Create Event button to get started!
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="mt-4 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-base animate-fade-in"
                  >
                    Create Your First Event
                  </button>
                </div>
              )}
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">Your Enrolled Events</h2>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              ) : transformedEnrolledEvents.length > 0 ? (
                <EventCardsForEnroll
                  events={transformedEnrolledEvents}
                  onEventClick={setSelectedEvent}
                  currentUserId={currentUserId}
                />
              ) : (
                <NoEnrolledEventsMessage />
              )}
            </div>

            {showCreateForm && (
              <CreateEventForm
                isOpen={showCreateForm}
                onClose={() => {
                  setShowCreateForm(false);
                  setEditingEvent(null);
                }}
                onEventCreated={() => {
                  fetchEvents();
                  fetchUserEnrollments();
                }}
                editingEvent={editingEvent}
              />
            )}

            {selectedEvent && (
              <EventModal
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onEnroll={handleEnroll}
                enrolling={enrolling}
                currentUserId={currentUserId}
              />
            )}

            {showNotificationModal && notificationEvent && (
              <NotifyAttendeesModal
                event={notificationEvent}
                notificationMessage={notificationMessage}
                setNotificationMessage={setNotificationMessage}
                sendingNotification={sendingNotification}
                onClose={() => {
                  setShowNotificationModal(false);
                  setNotificationEvent(null);
                  setNotificationMessage('');
                }}
                onSendNotification={async () => {
                  if (!notificationMessage.trim()) {
                    alert('Please enter a message to send to attendees');
                    return;
                  }

                  try {
                    setSendingNotification(true);
                    const token = localStorage.getItem("accessToken");
                    if (!token) {
                      alert("Please log in to send notifications");
                      navigate("/login");
                      return;
                    }

                    if (!notificationEvent) {
                      alert('Error: Event data is missing. Please try again.');
                      return;
                    }

                    const eventId = notificationEvent._id || notificationEvent.id;
                    if (!eventId) {
                      alert('Error: Event ID is missing. Please try again.');
                      return;
                    }

                    const notificationData = {
                      title: `Event Update: ${notificationEvent.title}`,
                      message: notificationMessage,
                      type: 'info'
                    };

                    const response = await fetch(`/api/events/${eventId}/notifications`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify(notificationData)
                    });

                    if (!response.ok) {
                      if (response.status === 401) {
                        alert("Session expired. Please log in again.");
                        localStorage.clear();
                        navigate("/login");
                        return;
                      } else if (response.status === 403) {
                        alert("You don't have permission to send notifications for this event.");
                        return;
                      } else if (response.status === 404) {
                        alert("Event not found.");
                        return;
                      }

                      const errorData = await response.json().catch(() => ({}));
                      throw new Error(errorData.message || `Failed to send notification (Status: ${response.status})`);
                    }

                    const data = await response.json();
                    const enrollmentCount = notificationEvent.enrollmentCount || notificationEvent.attendees?.length || 0;
                    alert(`✅ Notification sent successfully to all ${enrollmentCount} enrolled attendee${enrollmentCount !== 1 ? 's' : ''}!`);

                    setShowNotificationModal(false);
                    setNotificationEvent(null);
                    setNotificationMessage('');

                  } catch (error) {
                    console.error('Failed to send notification:', error);
                    alert(`❌ Failed to send notification: ${error.message}`);
                  } finally {
                    setSendingNotification(false);
                  }
                }}
              />
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Myevents;