import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { base44 } from "@/api/base44Client";
import { isUsingMockClient } from "@/api/clientSelector";
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
import Billing from "./Billing";
import Product from "./Product";
import Spaces from "./Spaces";
import SpaceDetail from "./SpaceDetail";
import Health from "./Health";
import CreateOrganization from "./CreateOrganization";

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

    Billing: Billing,

    Product: Product,

    Spaces: Spaces,

    Health: Health,

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

    // Get Clerk user if using HTTP client
    const { isLoaded: clerkLoaded, isSignedIn, user: clerkUser } = useUser();
    const usingMock = isUsingMockClient();

    useEffect(() => {
        // If using HTTP client, wait for Clerk to load
        if (!usingMock) {
            if (clerkLoaded) {
                // Only set user if actually signed in with valid Clerk session
                if (isSignedIn && clerkUser && window.Clerk && window.Clerk.user) {
                    // Convert Clerk user to our format
                    setCurrentUser({
                        id: clerkUser.id,
                        email: clerkUser.primaryEmailAddress?.emailAddress,
                        full_name: clerkUser.fullName || clerkUser.firstName || 'User',
                        avatar_url: clerkUser.imageUrl,
                        role: 'member', // Will be fetched from backend
                    });
                } else {
                    // Not signed in - clear user
                    setCurrentUser(null);
                }
                setIsLoading(false);
            }
        } else {
            // Using mock client - check base44 auth
            base44.auth.me()
                .then(user => {
                    setCurrentUser(user);
                    setIsLoading(false);
                })
                .catch(() => {
                    setCurrentUser(null);
                    setIsLoading(false);
                });
        }
    }, [clerkLoaded, isSignedIn, clerkUser, usingMock]);

    const handleLoginSuccess = () => {
        // Reload to get current user
        window.location.reload();
    };

    const handleOrganizationCreated = (org) => {
        // Reload to refresh with new organization
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

    // Check if user has an organization (only for HTTP client mode)
    if (!usingMock && currentUser) {
        const currentOrgId = localStorage.getItem('current_org_id');
        if (!currentOrgId) {
            return <CreateOrganization onSuccess={handleOrganizationCreated} />;
        }
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
                <Route path="/announcements" element={
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
                <Route path="/decisions" element={
                    <ProtectedRoute pageName="Decisions" currentUser={currentUser}>
                        <Decisions />
                    </ProtectedRoute>
                } />

                <Route path="/Home" element={
                    <ProtectedRoute pageName="Home" currentUser={currentUser}>
                        <Home />
                    </ProtectedRoute>
                } />
                <Route path="/home" element={
                    <ProtectedRoute pageName="Home" currentUser={currentUser}>
                        <Home />
                    </ProtectedRoute>
                } />

                <Route path="/People" element={
                    <ProtectedRoute pageName="People" currentUser={currentUser}>
                        <People />
                    </ProtectedRoute>
                } />

                <Route path="/people" element={
                    <ProtectedRoute pageName="People" currentUser={currentUser}>
                        <People />
                    </ProtectedRoute>
                } />

                <Route path="/Tasks" element={
                    <ProtectedRoute pageName="Tasks" currentUser={currentUser}>
                        <Tasks />
                    </ProtectedRoute>
                } />
                <Route path="/tasks" element={
                    <ProtectedRoute pageName="Tasks" currentUser={currentUser}>
                        <Tasks />
                    </ProtectedRoute>
                } />

                <Route path="/Settings" element={
                    <ProtectedRoute pageName="Settings" currentUser={currentUser}>
                        <Settings />
                    </ProtectedRoute>
                } />
                <Route path="/settings" element={
                    <ProtectedRoute pageName="Settings" currentUser={currentUser}>
                        <Settings />
                    </ProtectedRoute>
                } />

                <Route path="/Calendar" element={
                    <ProtectedRoute pageName="Calendar" currentUser={currentUser}>
                        <Calendar />
                    </ProtectedRoute>
                } />
                <Route path="/calendar" element={
                    <ProtectedRoute pageName="Calendar" currentUser={currentUser}>
                        <Calendar />
                    </ProtectedRoute>
                } />

                <Route path="/Billing" element={
                    <ProtectedRoute pageName="Billing" currentUser={currentUser}>
                        <Billing />
                    </ProtectedRoute>
                } />
                <Route path="/billing" element={
                    <ProtectedRoute pageName="Billing" currentUser={currentUser}>
                        <Billing />
                    </ProtectedRoute>
                } />

                <Route path="/Product" element={
                    <ProtectedRoute pageName="Product" currentUser={currentUser}>
                        <Product />
                    </ProtectedRoute>
                } />
                <Route path="/product" element={
                    <ProtectedRoute pageName="Product" currentUser={currentUser}>
                        <Product />
                    </ProtectedRoute>
                } />

                <Route path="/Spaces" element={
                    <ProtectedRoute pageName="Spaces" currentUser={currentUser}>
                        <Spaces />
                    </ProtectedRoute>
                } />
                <Route path="/spaces" element={
                    <ProtectedRoute pageName="Spaces" currentUser={currentUser}>
                        <Spaces />
                    </ProtectedRoute>
                } />

                <Route path="/Health" element={
                    <ProtectedRoute pageName="Health" currentUser={currentUser}>
                        <Health />
                    </ProtectedRoute>
                } />
                <Route path="/health" element={
                    <ProtectedRoute pageName="Health" currentUser={currentUser}>
                        <Health />
                    </ProtectedRoute>
                } />

                {/* Space detail route - opens in new tab, no layout wrapper needed */}
                <Route path="/space/:spaceId" element={<SpaceDetail />} />
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