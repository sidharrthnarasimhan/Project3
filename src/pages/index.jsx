import { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import Layout from "./Layout.jsx";
import Login from "./Login";
import ProtectedRoute from "@/components/common/ProtectedRoute";

import Announcements from "./Announcements";
import DecisionDetail from "./DecisionDetail";
import Decisions from "./Decisions";
import Home from "./Home";
import People from "./People";
import Tasks from "./Tasks";
import Settings from "./Settings";
import Calendar from "./Calendar";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {

    Announcements: Announcements,

    DecisionDetail: DecisionDetail,

    Decisions: Decisions,

    Home: Home,

    People: People,

    Tasks: Tasks,

    Settings: Settings,

    Calendar: Calendar,

}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is authenticated
        base44.auth.me()
            .then(user => {
                setCurrentUser(user);
                setIsLoading(false);
            })
            .catch(() => {
                setCurrentUser(null);
                setIsLoading(false);
            });
    }, []);

    const handleLoginSuccess = () => {
        // Reload to get current user
        window.location.reload();
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
                </div>
            </div>
        );
    }

    // Show login if not authenticated
    if (!currentUser) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <Layout currentPageName={currentPage}>
            <Routes>
                <Route path="/" element={
                    <ProtectedRoute pageName="Home" currentUser={currentUser}>
                        <Home />
                    </ProtectedRoute>
                } />

                <Route path="/Announcements" element={
                    <ProtectedRoute pageName="Announcements" currentUser={currentUser}>
                        <Announcements />
                    </ProtectedRoute>
                } />

                <Route path="/DecisionDetail" element={
                    <ProtectedRoute pageName="Decisions" currentUser={currentUser}>
                        <DecisionDetail />
                    </ProtectedRoute>
                } />

                <Route path="/Decisions" element={
                    <ProtectedRoute pageName="Decisions" currentUser={currentUser}>
                        <Decisions />
                    </ProtectedRoute>
                } />

                <Route path="/Home" element={
                    <ProtectedRoute pageName="Home" currentUser={currentUser}>
                        <Home />
                    </ProtectedRoute>
                } />

                <Route path="/People" element={
                    <ProtectedRoute pageName="People" currentUser={currentUser}>
                        <People />
                    </ProtectedRoute>
                } />

                <Route path="/Tasks" element={
                    <ProtectedRoute pageName="Tasks" currentUser={currentUser}>
                        <Tasks />
                    </ProtectedRoute>
                } />

                <Route path="/Settings" element={
                    <ProtectedRoute pageName="Settings" currentUser={currentUser}>
                        <Settings />
                    </ProtectedRoute>
                } />

                <Route path="/Calendar" element={
                    <ProtectedRoute pageName="Calendar" currentUser={currentUser}>
                        <Calendar />
                    </ProtectedRoute>
                } />
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}