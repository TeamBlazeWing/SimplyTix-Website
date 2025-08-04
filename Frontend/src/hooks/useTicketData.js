import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { processTickets, generateQRCodes, isTokenValid } from "../utils/ticketUtils";

const useTicketData = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [qrCodes, setQrCodes] = useState({});
  const navigate = useNavigate();

  const clearAuthData = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
  };

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      
      if (!token || !isTokenValid(token)) {
        console.log("Token missing or invalid during fetchTickets");
        clearAuthData();
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:3000/api/tickets/my", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        console.log("Unauthorized: Token rejected by server");
        setError("Your session has expired. Please log in again.");
        clearAuthData();
        navigate("/login", { state: { message: "Your session has expired. Please log in again." } });
        return;
      }

      if (response.ok) {
        let ticketsData = [];
        if (Array.isArray(data)) {
          ticketsData = data;
        } else if (data.tickets && Array.isArray(data.tickets)) {
          ticketsData = data.tickets;
        } else if (data.success && data.tickets && Array.isArray(data.tickets)) {
          ticketsData = data.tickets;
        } else {
          for (const key in data) {
            if (Array.isArray(data[key])) {
              ticketsData = data[key];
              break;
            }
          }
        }
        
        const processedTickets = processTickets(ticketsData);
        setTickets(processedTickets);
        const qrCodeMap = await generateQRCodes(processedTickets);
        setQrCodes(qrCodeMap);
      } else {
        setError(data.message || "Failed to fetch tickets");
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [navigate]);

  const getTicketStats = () => {
    return {
      total: tickets.length,
      active: tickets.filter(t => t.status?.toLowerCase() === "active").length,
      cancelled: tickets.filter(t => t.status?.toLowerCase() === "cancelled").length,
      expired: tickets.filter(t => t.status?.toLowerCase() === "expired").length,
      used: tickets.filter(t => t.status?.toLowerCase() === "used" || t.checkedIn).length,
    };
  };

  const filterTickets = () => {
    let filtered = tickets;

    if (selectedStatus !== "all") {
      filtered = filtered.filter(ticket => 
        ticket.status?.toLowerCase() === selectedStatus.toLowerCase()
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.eventId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ticketType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.eventId?.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.purchaseDate) - new Date(a.purchaseDate);
        case "oldest":
          return new Date(a.purchaseDate) - new Date(b.purchaseDate);
        case "event-date":
          return new Date(a.eventId?.date) - new Date(b.eventId?.date);
        case "price-high":
          return 0;
        case "price-low":
          return 0;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const handleCancelTicket = async (ticketId) => {
    if (!window.confirm("Are you sure you want to cancel this ticket?")) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      
      if (!token || !isTokenValid(token)) {
        console.log("Token missing or invalid during cancelTicket");
        clearAuthData();
        navigate("/login");
        return;
      }
      
      const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}/cancel`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        console.log("Unauthorized: Token rejected by server during cancel ticket");
        clearAuthData();
        navigate("/login", { state: { message: "Your session has expired. Please log in again." } });
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setTickets(prev => 
          prev.map(ticket => 
            ticket._id === ticketId 
              ? { ...ticket, status: 'cancelled' } 
              : ticket
          )
        );
        alert("Ticket cancelled successfully!");
      } else {
        alert(data.message || "Failed to cancel ticket");
      }
    } catch (error) {
      console.error("Error cancelling ticket:", error);
      alert("Network error occurred");
    }
  };

  const stats = getTicketStats();
  const filteredTickets = filterTickets();

  return {
    tickets,
    filteredTickets,
    loading,
    error,
    fetchTickets,
    selectedStatus,
    setSelectedStatus,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    qrCodes,
    handleCancelTicket,
    stats,
  };
};

export default useTicketData;