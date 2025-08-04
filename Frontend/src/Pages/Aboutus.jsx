import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/General/Navbar";
import Footer from "../components/General/Footer";
import { ImageSlider } from "../components/General/ImageSlider";
import HeroSection from "../components/Aboutus/HeroSection";
import PlatformStats from "../components/Aboutus/PlatformStats";
import MissionVision from "../components/Aboutus/MissionVision";
import DevelopmentTeam from "../components/Aboutus/DevelopmentTeam";
import EventCategories from "../components/Aboutus/EventCategories";
import CallToAction from "../components/Aboutus/CallToAction";
import "../components/Aboutus/styles.css";

const About = () => {
  const [username, setUsername] = useState("");
  const [stats, setStats] = useState({ totalEvents: 0, totalTickets: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) {
      navigate("/about");
    } else {
      setUsername(loggedInUser);
    }
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Get the access token for authentication
      const token = localStorage.getItem("accessToken");
      const headers = {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }),
      };

      // Fetch events with authentication
      const eventsResponse = await fetch("http://localhost:3000/api/events", {
        method: "GET",
        headers: headers,
      });

      let eventsData = {};
      if (eventsResponse.ok) {
        eventsData = await eventsResponse.json();
      } else {
        console.warn("Events API failed:", eventsResponse.status, eventsResponse.statusText);
      }

      // Fetch tickets with authentication
      const ticketsResponse = await fetch("http://localhost:3000/api/tickets", {
        method: "GET",
        headers: headers,
      });

      let ticketsData = {};
      if (ticketsResponse.ok) {
        ticketsData = await ticketsResponse.json();
      } else {
        console.warn("Tickets API failed:", ticketsResponse.status, ticketsResponse.statusText);
      }

      setStats({
        totalEvents: eventsData.events ? eventsData.events.length : 0,
        totalTickets: ticketsData.tickets ? ticketsData.tickets.length : 0,
      });

      console.log("Stats fetched successfully:", {
        events: eventsData.events ? eventsData.events.length : 0,
        tickets: ticketsData.tickets ? ticketsData.tickets.length : 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Set default values if API fails
      setStats({ totalEvents: 0, totalTickets: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("accessToken");
    navigate("/about");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: "4s" }}></div>
      </div>

      <div className="relative z-10">
        <Navbar username={username} onLogout={handleLogout} />
        <ImageSlider />
        <main className="flex-1 py-8">
          <HeroSection />
          <PlatformStats stats={stats} loading={loading} />
          <MissionVision />
          <DevelopmentTeam />
          <EventCategories />
          <CallToAction />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default About;