import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUser, FaBell, FaRss } from "react-icons/fa6";
import { TiThMenu } from "react-icons/ti";
import { IoClose } from "react-icons/io5";
import MenuItems from "./Navbar/MenuItems";
import ProfileDropdown from "./Navbar/ProfileDropdown";
import NotificationsDropdown from "./Navbar/NotificationsDropdown";
import SubscriptionDropdown from "./Navbar/SubscriptionDropdown";
import PointsButton from "./Navbar/PointsButton";
import { isTokenValid } from "./Navbar/utils";
import "./Navbar/styles.css";

const Navbar = ({ username, onLogout }) => {
  const [isPointsPopupOpen, setIsPointsPopupOpen] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpData, setOtpData] = useState(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [userPhoneNumber, setUserPhoneNumber] = useState("");
  const [userPoints, setUserPoints] = useState(0); // <-- Add state for points
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const subscriptionRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    if (typeof onLogout === "function") {
      onLogout();
    }
    navigate("/login");
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token || !isTokenValid(token)) {
        handleLogout();
        return;
      }
      const response = await fetch("http://167.71.220.214:3000/api/notifications/my", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 401) {
        handleLogout();
        return;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token || !isTokenValid(token)) {
        console.log("No access token found or token is invalid");
        if (token && !isTokenValid(token)) {
          handleLogout();
        }
        return;
      }
      const response = await fetch(`http://167.71.220.214:3000/api/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        throw new Error(`Failed to mark notification as read: ${response.status}`);
      }
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getSubscriptionStatus = async () => {
    try {
      setSubscriptionLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token || !isTokenValid(token)) {
        console.log("No access token found or token is invalid");
        setSubscriptionStatus({
          status: "inactive",
          message: "Please log in to check subscription status",
          isActive: false,
        });
        if (token && !isTokenValid(token)) {
          handleLogout();
        }
        return;
      }
      const response = await fetch("http://167.71.220.214:3000/api/users/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const userData = await response.json();
      localStorage.setItem("userData", JSON.stringify(userData)); // Store user data in localStorage
      console.log("User profile data:", userData);
       // <-- Set points from profile
      const isActive = userData.subscriptionStatus === "active";
      setSubscriptionStatus({
        status: userData.subscriptionStatus || "inactive",
        message: isActive
          ? "You are subscribed to event notifications"
          : "Subscribe to get notifications about new events",
        isActive: isActive,
        userProfile: userData,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setSubscriptionStatus({
        status: "inactive",
        message: "Unable to check subscription status. Please try again.",
        isActive: false,
      });
    } finally {
      setSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && isTokenValid(token)) {
      fetchUserPoints();
      getSubscriptionStatus();
    } else {
      setUserPoints(0); // Default to 0 if no valid token
      setSubscriptionStatus({
        status: "inactive",
        message: "Please log in to check subscription status",
        isActive: false,
      });
    }
  }, []);
  const fetchUserPoints = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token || !isTokenValid(token)) {
        console.log("No access token found or token is invalid");
        if (token && !isTokenValid(token)) {
          handleLogout();
        }
        return;
      }
      const response = await fetch("http://167.71.220.214:3000/api/users/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const userData = await response.json();
      console.log("User profile data:", userData);
      setUserPoints(userData.points || 0); // <-- Set points from profile
    } catch (error) {
      console.error("Error fetching user points:", error);
      setUserPoints(0); // Default to 0 if there's an error
    }
  };


  const closeOTPModal = () => {
    setOtpModalOpen(false);
    setOtpInput("");
    setOtpError("");
    setOtpData(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
      if (subscriptionRef.current && !subscriptionRef.current.contains(event.target)) {
        setIsSubscriptionOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && isTokenValid(token)) {
      fetchNotifications();
      const notificationInterval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(notificationInterval);
    }
    if (token) {
      getSubscriptionStatus();
    }
  }, []);

  return (
    <nav className="w-full min-w-[400px] bg-gradient-to-r from-black/20 via-purple-900/20 to-black/20 backdrop-blur-xl shadow-2xl relative z-[1000] border-b border-white/10">
      <div className="flex items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center space-x-3 mr-10 group cursor-pointer" onClick={() => navigate("/dashboard")}> 
          <div className="relative">
            <img
              src="/simplytix.svg"
              alt="SimplyTix Logo"
              className="w-12 h-12 rounded-full bg-gradient-to-br from-black to-white-600 p-2 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 shadow-lg"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-black to-white-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300 animate-pulse"></div>
          </div>
          <h1 className="text-white text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-blue-300 transition-all duration-300">
            SimplyTix
          </h1>
        </div>
        <MenuItems isOpen={isOpen} setIsOpen={setIsOpen} location={location} username={username} handleLogout={handleLogout} />
        <div className="flex items-center gap-2">
        {/* Show user points in the navbar with interactive PointsButton */}
        <PointsButton
          userPoints={userPoints}
          setUserPoints={setUserPoints}
          isPointsPopupOpen={isPointsPopupOpen}
          setIsPointsPopupOpen={setIsPointsPopupOpen}
        />

          <SubscriptionDropdown
            subscriptionRef={subscriptionRef}
            isSubscriptionOpen={isSubscriptionOpen}
            setIsSubscriptionOpen={setIsSubscriptionOpen}
            subscriptionStatus={subscriptionStatus}
            subscriptionLoading={subscriptionLoading}
            otpModalOpen={otpModalOpen}
            setOtpModalOpen={setOtpModalOpen}
            otpData={otpData}
            setOtpData={setOtpData}
            otpInput={otpInput}
            setOtpInput={setOtpInput}
            otpLoading={otpLoading}
            setOtpLoading={setOtpLoading}
            otpError={otpError}
            setOtpError={setOtpError}
            userPhoneNumber={userPhoneNumber}
            setUserPhoneNumber={setUserPhoneNumber}
            getSubscriptionStatus={getSubscriptionStatus}
            closeOTPModal={closeOTPModal}
            handleLogout={handleLogout}
          />
          <NotificationsDropdown
            notificationRef={notificationRef}
            isNotificationOpen={isNotificationOpen}
            setIsNotificationOpen={setIsNotificationOpen}
            notifications={notifications}
            loading={loading}
            markAsRead={markAsRead}
            navigate={navigate}
          />
          <ProfileDropdown
            profileRef={profileRef}
            isProfileOpen={isProfileOpen}
            setIsProfileOpen={setIsProfileOpen}
            username={username}
            navigate={navigate}
            handleLogout={handleLogout}
          />
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white text-2xl hover:text-purple-300 p-3 rounded-full hover:bg-white/10 transition-all duration-300 transform hover:scale-110 active:scale-95"
            >
              {isOpen ? (
                <IoClose className="transition-transform duration-300 rotate-180" />
              ) : (
                <TiThMenu className="transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;