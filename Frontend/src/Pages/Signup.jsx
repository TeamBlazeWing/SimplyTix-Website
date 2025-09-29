import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignupForm from "../components/Signup/SignupForm";
import BackgroundDecorations from "../components/Signup/BackgroundDecorations";
import LogoHeader from "../components/Signup/LogoHeader";

const Signup = () => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isNameValid, setIsNameValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculatePasswordStrength = (pwd) => {
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasSpecial = /[!@#$%^&*]/.test(pwd);
    const length = pwd.length >= 8;

    if (hasLower && hasUpper && hasSpecial && length) return "Strong";
    if ((hasLower || hasUpper) && length) return "Medium";
    if (length) return "Weak";
    if (pwd.length === 0) return "";
    return "Very Weak";
  };

  const getPasswordStrengthColor = (strength) => {
    switch (strength) {
      case "Strong": return "text-green-400";
      case "Medium": return "text-yellow-400";
      case "Weak": return "text-orange-400";
      case "Very Weak": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  useEffect(() => {
    const newErrors = {};

    if (name && name.length < 8) {
      newErrors.name = "Name must be at least 8 characters";
      setIsNameValid(false);
    } else {
      setIsNameValid(true);
    }

    if (phoneNumber && !/^94\d{9}$/.test(phoneNumber)) {
      newErrors.phoneNumber = "Phone number must start with 94 followed by 9 digits";
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (password) {
      if (
        !/[a-z]/.test(password) ||
        !/[A-Z]/.test(password) ||
        !/[!@#$%^&*]/.test(password)
      ) {
        newErrors.password =
          "Must include lowercase, uppercase, and special character";
      }
    }

    if (confirmPassword && confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords must match";
    }

    setErrors(newErrors);
    setPasswordStrength(calculatePasswordStrength(password));
  }, [name, phoneNumber, email, password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const newErrors = {};
    if (!name) newErrors.name = "Name is required";
    if (!phoneNumber) newErrors.phoneNumber = "Phone number is required";
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (!confirmPassword)
      newErrors.confirmPassword = "Confirm Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://167.71.220.214:3000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          mobileNumber: phoneNumber,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      setErrors({ general: "✅ Signup successful! Redirecting to login..." });
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setErrors({ general: `❌ ${error.message || "Signup failed"}` });
      console.error("Signup failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-black dark:via-gray-900 dark:to-black flex items-center justify-center relative overflow-hidden">
      <BackgroundDecorations />
      <div className={`w-full max-w-2xl mx-auto p-6 relative z-10 transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <LogoHeader />
        <SignupForm
          name={name}
          setName={setName}
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          errors={errors}
          passwordStrength={passwordStrength}
          getPasswordStrengthColor={getPasswordStrengthColor}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showConfirmPassword={showConfirmPassword}
          setShowConfirmPassword={setShowConfirmPassword}
          isNameValid={isNameValid}
          isLoading={isLoading}
          focusedField={focusedField}
          setFocusedField={setFocusedField}
          handleSubmit={handleSubmit}
          navigate={navigate}
        />
      </div>
    </section>
  );
};

export default Signup;