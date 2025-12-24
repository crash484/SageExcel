import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import excelChartAnim from "./animations/Animation - 1749185585484.json";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/authSlice";
import { toast } from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";

/* ---------- password rule ---------- */
const isValidPassword = (password) =>
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z\d]).{8,}$/.test(password);

export default function RegisterPage() {
  const [googleUser, setGoogleUser] = useState(null);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* ---------- GOOGLE OAUTH INIT ---------- */
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google && document.getElementById("google-register-btn")) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleRegister,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-register-btn"),
          {
            theme: "outline",
            size: "large",
            text: "signup_with",
            width: 320,
          }
        );

        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  /* ---------- GOOGLE VERIFY ---------- */
  const handleGoogleRegister = async (response) => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/googleVerify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: response.credential }),
        }
      );

      const data = await res.json();
          console.log("googleVerify response:", data);

      if (data.success) {
        // existing user → login
        dispatch(setCredentials(data));
        toast.success("Logged in successfully");
        navigate("/dashboard");
        return;
      }

      if (data.needsRegistration) {
        // new user → set password
        setGoogleUser({
          email: data.email,
          name: data.name,
          googleId: data.googleId,
        });
        toast.success("Google verified. Set your password.");
      }
    } catch (err) {
      toast.error("Google verification failed");
    }
  };

  /* ---------- FORM HANDLERS ---------- */
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!googleUser) {
      toast.error("Please register using Google");
      return;
    }

    const { password, confirmPassword } = formData;

    if (!isValidPassword(password)) {
      toast.error(
        "Password must be at least 8 characters, with upper, lower & symbol"
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/googleRegister",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: googleUser.email,
            name: googleUser.name,
            googleId: googleUser.googleId,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      dispatch(setCredentials(data));
      toast.success("Registration complete");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <motion.div
        className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-green-600 to-emerald-800 text-white p-10"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Lottie animationData={excelChartAnim} loop className="w-80 mb-6" />
        <h1 className="text-4xl font-bold mb-4">Join SageExcel</h1>
        <p className="text-lg text-center">
          Unlock powerful Excel analytics tools.
        </p>
      </motion.div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <motion.div
          className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl w-full max-w-md"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-6 text-center">
            Register with Google
          </h2>

          {/* Google Button */}
          <div className="flex justify-center mb-6">
            <div id="google-register-btn"></div>
          </div>

          {/* Password Setup */}
          {googleUser && (
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={googleUser.name}
                disabled
                className="w-full p-3 mb-4 rounded-lg border opacity-70"
              />

              <input
                type="email"
                value={googleUser.email}
                disabled
                className="w-full p-3 mb-4 rounded-lg border opacity-70"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Set Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-3 mb-4 rounded-lg border pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 mb-6 rounded-lg border"
                required
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg"
              >
                {isLoading ? "Registering..." : "Complete Registration"}
              </motion.button>
            </form>
          )}

          <p className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-600">
              Login here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
