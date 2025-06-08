import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import RocketAnimation from '../components/Auth/animations/Animation - 1749401836325.json'; // Add an Excel chart-like Lottie animation
export default function LandingPage() {
  return (
   <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-4 py-8">
      <motion.div
        className="max-w-2xl w-full flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Top Brand Title */}
        <h1 className="text-5xl font-bold text-indigo-700 dark:text-white mb-2">SageExcel</h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Excel to new heights with SageExcel
        </p>

        {/* Animation */}
        <div className="w-80 mb-8">
          <Lottie animationData={RocketAnimation} loop />
        </div>

        {/* Tagline */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Analyze Smarter, Not Harder
        </h2>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          Sign in or register to start uploading your Excel files and building beautiful dashboards.
        </p>

        {/* Buttons */}
        <div className="flex space-x-4">
          <Link
            to="/login"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition"
          >
            Register
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
