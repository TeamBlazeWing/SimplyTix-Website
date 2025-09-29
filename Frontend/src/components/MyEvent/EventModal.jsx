import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaTimes,
  FaDollarSign,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaTicketAlt,
  FaUserCheck,
  FaUsers
} from 'react-icons/fa';

const EventModal = ({ event, onClose, onEnroll, enrolling, currentUserId }) => {
  const navigate = useNavigate();
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    setIsEnrolled(event?.isEnrolled || false);
  }, [event?.isEnrolled]);

  useEffect(() => {
    const fetchEnrollmentCount = async () => {
      if (!event?.id && !event?._id) return;

      try {
        setLoadingEnrollments(true);
        const token = localStorage.getItem("accessToken");
        const headers = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const eventId = event._id || event.id;
        const response = await fetch(`http://167.71.220.214:3000/api/enrollments/event/${eventId}`, {
          method: 'GET',
          headers
        });

        if (response.ok) {
          const data = await response.json();
          const enrollments = data.data || data || [];
          setEnrollmentCount(enrollments.length);
        } else {
          if (response.status === 401) {
            console.log('Unauthorized - enrollment count may require authentication');
          } else {
            console.log('Failed to fetch enrollment count');
          }
          setEnrollmentCount(0);
        }
      } catch (error) {
        console.error('Error fetching enrollment count:', error);
        setEnrollmentCount(0);
      } finally {
        setLoadingEnrollments(false);
      }
    };

    fetchEnrollmentCount();
  }, [event?.id, event?._id]);

  if (!event) return null;

  const handleBuyTicket = () => {
    localStorage.setItem('selectedEvent', JSON.stringify(event));
    navigate('/payment');
  };

  const handleEnroll = () => {
    const eventId = event._id || event.id;
    onEnroll(eventId, isEnrolled);
    setIsEnrolled(!isEnrolled);
    if (isEnrolled) {
      setEnrollmentCount(prev => Math.max(0, prev - 1));
    } else {
      setEnrollmentCount(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="absolute inset-0 bg-gradient-to-br from-black/80 via-gray-900/90 to-black/80 backdrop-blur-xl"
        onClick={onClose}
      />
      <div className="relative bg-gradient-to-br from-black/90 via-gray-900/95 to-black/90 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slideUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[10000] p-2 bg-black/50 hover:bg-red-600/80 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 backdrop-blur-sm border border-white/20"
        >
          <FaTimes className="text-white text-lg" />
        </button>

        <div className="overflow-y-auto max-h-[90vh] custom-scrollbar">
          <div className="relative h-64 overflow-hidden">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm border border-white/20">
              <FaDollarSign className="inline mr-1" />
              {event.price}
            </div>
            {isEnrolled && (
              <div className="absolute top-4 right-16 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold px-4 py-2 rounded-full shadow-lg animate-pulse backdrop-blur-sm border border-white/20">
                <FaUserCheck className="inline mr-1" />
                Enrolled
              </div>
            )}
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
                {event.title}
              </h2>
              <p className="text-gray-200 text-sm md:text-base drop-shadow-md line-clamp-2">
                {event.description}
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-600/30 rounded-lg">
                    <FaCalendarAlt className="text-purple-400" />
                  </div>
                  <h3 className="text-white font-semibold">Date & Time</h3>
                </div>
                <p className="text-gray-300 text-sm">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  <FaClock className="inline mr-1" />
                  {new Date(event.date).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-600/30 rounded-lg">
                    <FaMapMarkerAlt className="text-blue-400" />
                  </div>
                  <h3 className="text-white font-semibold">Location</h3>
                </div>
                <p className="text-gray-300 text-sm">{event.location}</p>
                <p className="text-gray-400 text-xs mt-1">
                  📍 {event.district}
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-600/30 rounded-lg">
                    <FaTicketAlt className="text-green-400" />
                  </div>
                  <h3 className="text-white font-semibold">Event Details</h3>
                </div>
                <p className="text-gray-300 text-sm">{event.type}</p>
                {event.createdByName && (
                  <p className="text-gray-400 text-xs mt-1">
                    👤 Created by: {event.createdByName}
                  </p>
                )}
                {event.eventCode && (
                  <p className="text-gray-400 text-xs mt-1">
                    🏷️ Code: {event.eventCode}
                  </p>
                )}
              </div>

              <div className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 backdrop-blur-sm rounded-xl p-4 border border-emerald-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-600/30 rounded-lg">
                    <FaUsers className="text-emerald-400" />
                  </div>
                  <h3 className="text-white font-semibold">Enrollments</h3>
                </div>
                <div className="space-y-2">
                  {loadingEnrollments ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-400"></div>
                      <span className="text-gray-300 text-sm">Loading...</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Total Enrolled:</span>
                      <span className="text-emerald-400 text-lg font-bold">{enrollmentCount}</span>
                    </div>
                  )}
                  {isEnrolled && (
                    <div className="text-emerald-400 text-xs font-semibold bg-emerald-600/20 rounded px-2 py-1 text-center">
                      ✓ YOU ARE ENROLLED
                    </div>
                  )}
                </div>
              </div>
            </div>

            {event.tickets && event.tickets.length > 0 && (
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-3">
                  <div className="p-2 bg-purple-600/30 rounded-lg">
                    <FaTicketAlt className="text-purple-400" />
                  </div>
                  Ticket Types & Availability
                </h3>
                {event.totalSoldTickets > 0 && (
                  <div className="mb-4 p-3 bg-orange-600/20 rounded-lg border border-orange-500/30">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">Total Sold:</span>
                      <span className="text-orange-400 font-semibold">{event.totalSoldTickets} tickets</span>
                    </div>
                    {event.totalAvailableTickets > 0 && (
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-gray-300">Remaining:</span>
                        <span className="text-green-400 font-semibold">{event.totalAvailableTickets} tickets</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {event.tickets.map((ticket, index) => (
                    <div key={index} className="bg-gradient-to-r from-gray-700/30 to-gray-800/30 rounded-lg p-4 border border-gray-600/20">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-white font-semibold text-lg">{ticket.name}</h4>
                          <p className="text-gray-400 text-sm">Event ticket</p>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold text-lg">${ticket.price}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Available:</span>
                          <span className="text-blue-400 font-medium">{ticket.availableQuantity}</span>
                        </div>
                        {ticket.soldQuantity > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Sold:</span>
                            <span className="text-orange-400 font-medium">{ticket.soldQuantity}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Total:</span>
                          <span className="text-gray-300 font-medium">{ticket.totalQuantity}</span>
                        </div>
                        {ticket.totalQuantity > 0 && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${(ticket.soldQuantity / ticket.totalQuantity) * 100}%` }}
                              />
                            </div>
                            <div className="text-right mt-1">
                              <span className="text-xs text-gray-400">
                                {((ticket.soldQuantity / ticket.totalQuantity) * 100).toFixed(0)}% sold
                              </span>
                            </div>
                          </div>
                        )}
                        {ticket.availableQuantity === 0 ? (
                          <div className="text-red-400 text-xs font-semibold bg-red-600/20 rounded px-2 py-1 text-center">
                            SOLD OUT
                          </div>
                        ) : ticket.availableQuantity < 10 ? (
                          <div className="text-orange-400 text-xs font-semibold bg-orange-600/20 rounded px-2 py-1 text-center">
                            LIMITED AVAILABILITY
                          </div>
                        ) : (
                          <div className="text-green-400 text-xs font-semibold bg-green-600/20 rounded px-2 py-1 text-center">
                            AVAILABLE
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className={`flex-1 font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg backdrop-blur-sm border ${
                  isEnrolled
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-red-500/30 shadow-red-500/25'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-blue-500/30 shadow-blue-500/25'
                } ${enrolling ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl'}`}
              >
                {enrolling ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    {isEnrolled ? 'Unenrolling...' : 'Enrolling...'}
                  </>
                ) : (
                  <>
                    <FaUserCheck className="mr-3" />
                    {isEnrolled ? 'Unenroll' : 'Enroll Now'}
                  </>
                )}
              </button>
              <button
                onClick={handleBuyTicket}
                disabled={enrolling}
                className={`flex-1 font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white backdrop-blur-sm border border-purple-500/30 shadow-purple-500/25 ${
                  enrolling ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl'
                }`}
              >
                <FaTicketAlt className="mr-3" />
                Buy Ticket
              </button>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(50px) scale(0.95);
            }
            to { 
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
          
          .animate-slideUp {
            animation: slideUp 0.4s ease-out;
          }
          
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(147, 51, 234, 0.6);
            border-radius: 3px;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(147, 51, 234, 0.8);
          }
          
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </div>
    </div>
  );
};

export default EventModal;