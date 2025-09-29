import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { transformEventData } from "../utils/eventUtils";

const useEventData = () => {
  const [events, setEvents] = useState([]);
  const [rawEvents, setRawEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filters, setFilters] = useState({
    district: "All",
    type: "All",
    createdBy: "All",
    dateRange: "All",
    priceRange: "All"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [userEnrollments, setUserEnrollments] = useState([]);
  const navigate = useNavigate();

  const fetchUserEnrollments = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");
      
      if (!token || !userId) {
        setUserEnrollments([]);
        return;
      }
      
      const response = await fetch('http://167.71.220.214:3000/api/enrollments/my', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserEnrollments(data.data || data || []);
      } else {
        setUserEnrollments([]);
      }
    } catch (error) {
      setUserEnrollments([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        await fetchUserEnrollments();
        
        const token = localStorage.getItem("accessToken");
        const headers = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch('http://167.71.220.214:3000/api/events', {
          method: 'GET',
          headers
        });
        
        if (!response.ok) {
          if (response.status === 401 && token) {
            const publicResponse = await fetch('http://167.71.220.214:3000/api/events', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              }
            });
            
            if (!publicResponse.ok) {
              throw new Error(`Failed to fetch events: ${publicResponse.status} ${publicResponse.statusText}`);
            }
            
            const publicData = await publicResponse.json();
            let eventsArray = publicData.data || publicData.events || publicData;
            if (!Array.isArray(eventsArray)) {
              throw new Error('Invalid response format: events array not found');
            }
            
            setRawEvents(eventsArray);
            return;
          }
          
          throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        let eventsArray = data.data || data.events || data;
        if (!Array.isArray(eventsArray)) {
          throw new Error('Invalid response format: events array not found');
        }
        
        setRawEvents(eventsArray);
        
      } catch (error) {
        setError(`Failed to load events: ${error.message}`);
        setRawEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (rawEvents.length > 0) {
      const transformedEvents = rawEvents.map(event => transformEventData(event, userEnrollments));
      setEvents(transformedEvents);
    }
  }, [userEnrollments, rawEvents]);

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
      
      const endpoint = `http://167.71.220.214:3000/api/enrollments/event/${eventId}`;
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
        setUserEnrollments(prev => prev.filter(enrollment => {
          const enrollmentEventId = enrollment.event?._id || enrollment.event?.id || enrollment.eventId;
          return enrollmentEventId !== eventId;
        }));
      } else {
        setUserEnrollments(prev => [...prev, {
          eventId: eventId,
          userId: userId,
          event: { _id: eventId, id: eventId }
        }]);
      }
      
      alert(actuallyEnrolled 
        ? '✅ Successfully unenrolled from the event!' 
        : '🎉 Successfully enrolled in the event!');
      
    } catch (error) {
      alert(`❌ ${error.message}`);
    } finally {
      setEnrolling(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  useEffect(() => {
    const filtered = events.filter((event) => {
      const matchesDistrict = filters.district === "All" || event.district === filters.district;
      const matchesType = filters.type === "All" || event.type === filters.type;
      const matchesCreatedBy = filters.createdBy === "All" || event.createdByName === filters.createdBy;
      
      let matchesDateRange = true;
      if (filters.dateRange !== "All") {
        const eventDate = new Date(event.date);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (filters.dateRange) {
          case "today":
            const todayEnd = new Date(today);
            todayEnd.setDate(todayEnd.getDate() + 1);
            matchesDateRange = eventDate >= today && eventDate < todayEnd;
            break;
          case "this-week":
            const weekEnd = new Date(today);
            weekEnd.setDate(weekEnd.getDate() + 7);
            matchesDateRange = eventDate >= today && eventDate < weekEnd;
            break;
          case "this-month":
            const monthEnd = new Date(today.getFullYear(), now.getMonth() + 1, 1);
            matchesDateRange = eventDate >= today && eventDate < monthEnd;
            break;
          case "next-month":
            const nextMonthStart = new Date(today.getFullYear(), now.getMonth() + 1, 1);
            const nextMonthEnd = new Date(today.getFullYear(), now.getMonth() + 2, 1);
            matchesDateRange = eventDate >= nextMonthStart && eventDate < nextMonthEnd;
            break;
          default:
            matchesDateRange = true;
        }
      }
      
      let matchesPriceRange = true;
      if (filters.priceRange !== "All") {
        const price = event.price;
        
        switch (filters.priceRange) {
          case "free":
            matchesPriceRange = price === 0;
            break;
          case "0-50":
            matchesPriceRange = price >= 0 && price <= 50;
            break;
          case "50-100":
            matchesPriceRange = price > 50 && price <= 100;
            break;
          case "100-200":
            matchesPriceRange = price > 100 && price <= 200;
            break;
          case "200+":
            matchesPriceRange = price > 200;
            break;
          default:
            matchesPriceRange = true;
        }
      }
      
      return matchesDistrict && matchesType && matchesCreatedBy && matchesDateRange && matchesPriceRange;
    });
    
    setFilteredEvents(filtered);
  }, [events, filters]);

  return {
    events,
    filteredEvents,
    selectedEvent,
    setSelectedEvent,
    filters,
    handleFilterChange,
    loading,
    error,
    setError,
    enrolling,
    handleEnroll,
    userEnrollments,
  };
};

export default useEventData;