import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import excelChartAnim from './animations/Animation - 1749184199071.json';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';
import { toast } from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* ---------------- GOOGLE LOGIN ---------------- */
  useEffect(() => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: handleGoogleLogin,
    });

    window.google.accounts.id.renderButton(
      document.getElementById('google-btn'),
      {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        width: 320,
      }
    );
  }, []);

  const handleGoogleLogin = async (response) => {
    try {
      const res = await fetch('https://sageexcelbackend-production.up.railway.app/api/auth/googleVerify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Google login failed');
      }

      // Existing user -> LOGIN
      if (data.type === 'LOGIN') {
        dispatch(setCredentials(data));
        toast.success('Logged in successfully');
        navigate('/dashboard');
        return;
      }

      // New user -> REGISTER
      if (data.type === 'REGISTER') {
        navigate('/set-password', { state: data });
      }

    } catch (err) {
      toast.error(err.message);
    }
  };

  /* ---------------- EMAIL LOGIN ---------------- */
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('https://sageexcelbackend-production.up.railway.app/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      dispatch(setCredentials(data));
      toast.success('Login successful');
      navigate('/dashboard');

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
        className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-10"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Lottie animationData={excelChartAnim} loop className="w-80 mb-6" />
        <h1 className="text-4xl font-bold mb-4">SageExcel</h1>
        <p className="text-lg text-center">
          Visualize and analyze your Excel data effortlessly.
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
          <h2 className="text-3xl font-bold mb-6 text-center">Welcome</h2>

          {/* Email Login */}
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 mb-4 rounded-lg border"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
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

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-sm text-gray-500">OR</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Google Login Button */}
          <div className="flex justify-center">
            <div id="google-btn"></div>
          </div>

          <p className="mt-6 text-center text-sm">
            Don’t have an account?{' '}
            <Link to="/register" className="text-indigo-600">
              Register here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
