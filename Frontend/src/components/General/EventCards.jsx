
const EventCards = ({ events, onEventClick, currentUserId }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8 px-4">
    {events.map((event, idx) => {
      // Use the isEnrolled property from the event data
      const isEnrolled = event.isEnrolled || false;
      
      // Format creation date
      const creationDate = event.createdAt ? new Date(event.createdAt).toLocaleDateString() : 'N/A';
      
      // Get ticket information with prices and availability
      const ticketInfo = event.tickets && event.tickets.length > 0 
        ? event.tickets.map(ticket => {
            const soldInfo = ticket.soldQuantity > 0 ? ` (${ticket.soldQuantity} sold)` : '';
            const availableInfo = ticket.availableQuantity < ticket.totalQuantity ? ` - ${ticket.availableQuantity} left` : '';
            return `${ticket.name}: $${ticket.price}${soldInfo}${availableInfo}`;
          }).join(', ')
        : 'No tickets available';
      
      return (
        <div
          key={idx}
          className="group relative bg-gradient-to-br from-black/40 via-gray-900/30 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105 hover:rotate-1 hover:shadow-2xl hover:shadow-gray-500/25"
          onClick={() => onEventClick(event)}
        >
          {/* Gradient overlay for better visual depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-600/5 via-transparent to-gray-500/5 transition-opacity duration-500" />
          
          {/* Image container with overlay effects */}
          <div className="relative overflow-hidden">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Image overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent transition-opacity duration-500" />
            
            {/* Price badge */}
            <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg transform transition-transform duration-300 group-hover:scale-110">
            ${event.price}
            </div>
            
            {/* Sold tickets badge */}
            {event.totalSoldTickets > 0 && (
              <div className="absolute top-3 left-20 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg transform transition-transform duration-300 group-hover:scale-110">
                {event.totalSoldTickets} sold
              </div>
            )}
            
            {/* Sold out badge */}
            {event.isSoldOut && (
              <div className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg transform transition-transform duration-300 group-hover:scale-110 animate-pulse">
                SOLD OUT
              </div>
            )}
            
            {/* Enrollment status badge */}
            {isEnrolled && (
              <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-semibold px-3 py-1 rounded-full shadow-lg transform transition-all duration-300 group-hover:scale-110 animate-pulse">
                ✓ Enrolled
              </div>
            )}
            
            {/* Type badge */}
            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg border border-white/20">
              {event.type}
            </div>
          </div>
          
          {/* Content section */}
          <div className="p-5 space-y-3">
            {/* Title */}
            <h2 className="text-lg font-bold text-white mb-2 line-clamp-2 transition-colors duration-300">
              {event.title}
            </h2>
            
            {/* Location with icon */}
            <div className="flex items-center gap-2 text-gray-300">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium truncate">{event.location}</span>
            </div>
            
            {/* District */}
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <span className="text-sm">{event.district}</span>
            </div>
            
            {/* Event Creation Date */}
            <div className="flex items-center gap-2 text-gray-300">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-sm font-medium">Created: {creationDate}</span>
            </div>
            

            
            {/* Created By info */}
            {event.createdBy && (
              <div className="flex items-center gap-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-sm">Created by: {typeof event.createdBy === 'object' ? event.createdBy.name : event.createdBy}</span>
              </div>
            )}
            
            {/* Ticket Information with Prices and Availability */}
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full" />
                <span className="text-sm text-gray-300 font-medium">Ticket Availability</span>
              </div>
              
              {/* Overall ticket stats summary */}
              {event.tickets && event.tickets.length > 0 ? (
                <div className="mb-2 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Total Tickets:</span>
                    <span className="text-white font-medium">{event.totalTickets || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Sold:</span>
                    <span className="text-orange-400 font-medium">{event.totalSoldTickets || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Available:</span>
                    <span className="text-green-400 font-medium">{event.totalAvailableTickets || 0}</span>
                  </div>
                  
                  {/* Progress bar */}
                  {event.totalTickets > 0 && (
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((event.totalSoldTickets || 0) / event.totalTickets) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-400">No tickets available</div>
              )}
              
              {/* Individual ticket types */}
              <div className="space-y-1 mt-2 pt-2 border-t border-gray-700/50">
                {event.tickets && event.tickets.length > 0 ? (
                  event.tickets.map((ticket, index) => (
                    <div key={index} className="text-xs text-white flex justify-between items-center">
                      <div>
                        <span className="font-medium">{ticket.name}</span>
                        <span className="text-gray-400 ml-1">${ticket.price}</span>
                      </div>
                      <div className="text-right">
                        {ticket.soldQuantity > 0 && (
                          <span className="text-orange-400">{ticket.soldQuantity} sold</span>
                        )}
                        {ticket.availableQuantity >= 0 && (
                          <span className="text-green-400 ml-1">• {ticket.availableQuantity} left</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No ticket types defined</p>
                )}
              </div>
            </div>
            
            {/* Action button */}
            <div className="pt-2">
              <button 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick(event);
                }}
              >
                {isEnrolled ? 'View Details' : 'See more'}
              </button>
            </div>
          </div>
          
        </div>
      );
    })}
  </div>
);

export default EventCards;