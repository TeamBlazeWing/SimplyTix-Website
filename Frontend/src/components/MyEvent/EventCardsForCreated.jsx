import React, { useState } from 'react';
import { FaBell, FaEdit, FaTrash, FaQrcode } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const EventCardsForCreated = ({
  events,
  onEventClick,
  currentUserId,
  onEditEvent,
  onDeleteEvent,
  onNotifyAttendees
}) => {
  const navigate = useNavigate();

  const handleTicketValidation = (event) => {
    navigate(`/validate-ticket/${event._id || event.id}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-10 px-4">
      {events.map((event, idx) => {
        const isCreator = event.creator?._id === currentUserId || event.creator === currentUserId ||
          event.createdBy?._id === currentUserId || event.createdBy === currentUserId;
        const enrollmentCount = event.attendees?.length || event.enrollmentCount || 0;

        return (
          <div
            key={idx}
            className="relative group bg-gradient-to-br from-black/80 via-gray-800/80 to-gray-900/80 rounded-2xl shadow-2xl overflow-hidden border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300"
          >
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs px-3 py-1 rounded-full shadow-lg font-bold">
                {enrollmentCount} Attending
              </div>
            </div>
            <div className="p-5 flex flex-col gap-2">
              <h2 className="text-white text-lg font-bold truncate mb-1">{event.title}</h2>
              <p className="text-purple-300 text-xs font-medium mb-2 truncate">{event.location}</p>

              {isCreator && (
                <div className="flex flex-col gap-2 mt-2">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onNotifyAttendees && onNotifyAttendees(event);
                    }}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-gray-900 font-semibold py-2 rounded-lg shadow-md transition-all duration-300"
                  >
                    <FaBell className="text-lg" /> Notify All
                  </button>
                  <div className="flex gap-2">
                    <button
                      disabled={enrollmentCount > 0}
                      onClick={e => {
                        e.stopPropagation();
                        if (enrollmentCount > 0) {
                          alert(`Cannot edit event with ${enrollmentCount} enrolled attendee${enrollmentCount > 1 ? 's' : ''}.`);
                          return;
                        }
                        onEditEvent && onEditEvent(event);
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-all duration-300 ${
                        enrollmentCount > 0
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:scale-105'
                      }`}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      disabled={enrollmentCount > 0}
                      onClick={e => {
                        e.stopPropagation();
                        if (enrollmentCount > 0) {
                          alert(`Cannot delete event with ${enrollmentCount} enrolled attendee${enrollmentCount > 1 ? 's' : ''}.`);
                          return;
                        }
                        onDeleteEvent && onDeleteEvent(event);
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-all duration-300 ${
                        enrollmentCount > 0
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-md hover:scale-105'
                      }`}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTicketValidation(event);
                    }}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 rounded-lg shadow-md transition-all duration-300"
                  >
                    <FaQrcode className="text-lg" /> Ticket Validate
                  </button>
                </div>
              )}

              <button
                onClick={e => {
                  e.stopPropagation();
                  onEventClick && onEventClick(event);
                }}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-2 rounded-lg shadow-lg transition-all duration-300 hover:scale-105"
              >
                View Details
              </button>
            </div>
            {/* Subtle hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/0 via-purple-900/10 to-blue-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        );
      })}
    </div>
  );
};

export default EventCardsForCreated;