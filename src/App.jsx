import React from 'react'
import { useSelector } from 'react-redux'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './components/Layout/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import Upload from './pages/Upload';
import History from './pages/History';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { Toaster } from 'react-hot-toast'

function App() {
    const { token } = useSelector((state) => state.auth)

    // DEVELOPMENT SETTING - SET TO false WHEN READY FOR AUTH
    const DEV_BYPASS_AUTH = false

    return (
        <BrowserRouter>
            <Toaster position="top-right" />
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Development-only direct dashboard access */}
                {DEV_BYPASS_AUTH && (
                    <Route path="/dev" element={<DashboardLayout />}>
                        <Route index element={<Dashboard />} />
                    </Route>
                )}

                {/* Protected routes */}
                <Route
                    path="/"
                    element={DEV_BYPASS_AUTH || token ? <DashboardLayout /> : <Navigate to="/login" replace />}
                >
                    <Route index element={<Dashboard />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="upload" element={<Upload />} />
                    <Route path="history" element={<History />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="settings" element={<Settings />} />
                    {/* Add other protected routes here */}
                </Route>

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App