import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/Login/LoginForm";
import BackgroundDecorations from "../components/Login/BackgroundDecorations";
import LogoHeader from "../components/Login/LogoHeader";
import { clearAuthData } from "../utils/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormFocused, setIsFormFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const validate = () => {
    let tempErrors = {};

    // Email validation with better regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      tempErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      tempErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password) {
      tempErrors.password = "Password is required";
    } else if (password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsLoading(true);
      setErrors({});
      console.log('Attempting login with:', { email, password: '***' });

      const response = await fetch('http://167.71.220.214:3000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response:', { status: response.status, data });

      if (response.ok && (data.accessToken || data.token)) {
        // Store the token directly (not as JSON string)
        const token = data.accessToken || data.token;
        localStorage.setItem("accessToken", token);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("loggedInUser", data.user?.name || data.user?.email || email);
        localStorage.setItem("userId", data.user?._id || data.user?.id);

        console.log('Stored in localStorage:', {
          accessToken: localStorage.getItem("accessToken"),
          isLoggedIn: localStorage.getItem("isLoggedIn"),
          loggedInUser: localStorage.getItem("loggedInUser"),
          userId: localStorage.getItem("userId"),
        });

        // Fetch subscription status and update it in the backend
        try {
           const maskedMobile = data.user.maskedMobile;
          const statusResponse = await fetch("http://167.71.220.214:3000/api/subscription/get-status", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
              maskedMobile: maskedMobile,
              }),
            });

          const statusData = await statusResponse.json();
          console.log('External subscription status response:', statusData);

          if (statusData.success) {
            const subscriptionStatus = statusData.isActive ? 'active' : 'inactive';
            console.log('Mapped subscription status:', subscriptionStatus);

            // Update subscription status in the backend database
          } else {
            console.error('Failed to fetch external subscription status:', statusData.message || 'External API error');
          }
        } catch (error) {
          console.error('Error fetching or updating subscription status:', error);
        }

        // Success animation before redirect
        setErrors({ general: "✅ Login successful! Redirecting..." });
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        // Handle login failure (e.g., wrong email/password)
        console.error('Login failed:', data);
        setErrors({ general: data.message || "❌ Invalid email or password" });
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ general: "🔌 Network error. Please check your connection and try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgetPassword = () => {
    navigate("/forgetpassword");
  };

  const handleSignupNavigate = () => {
    navigate("/signup");
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 dark:from-black dark:via-gray-900 dark:to-black flex items-center justify-center relative overflow-hidden">
      <BackgroundDecorations />
      <div className={`flex flex-col items-center justify-center px-6 py-8 mx-auto w-full max-w-md relative z-10 transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <LogoHeader />
        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          errors={errors}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          isLoading={isLoading}
          isFormFocused={isFormFocused}
          setIsFormFocused={setIsFormFocused}
          emailFocused={emailFocused}
          setEmailFocused={setEmailFocused}
          passwordFocused={passwordFocused}
          setPasswordFocused={setPasswordFocused}
          handleLogin={handleLogin}
          handleForgetPassword={handleForgetPassword}
          handleSignupNavigate={handleSignupNavigate}
        />
      </div>
    </section>
  );
};

export default Login;