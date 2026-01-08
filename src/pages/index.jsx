import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { base44 } from "@/api/base44Client";
import { isUsingMockClient } from "@/api/clientSelector";
import { API_BASE_URL } from "@/config";
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
import SystemHealth from "./SystemHealth";
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

    SystemHealth: SystemHealth,

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
    const [userOrgs, setUserOrgs] = useState(null);
    const [checkingOrgs, setCheckingOrgs] = useState(false);
    // Initialize currentOrgId from localStorage immediately
    const [currentOrgId, setCurrentOrgId] = useState(() => localStorage.getItem('current_org_id'));

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

    // Check user's organizations (only for HTTP client mode)
    useEffect(() => {
        async function checkOrganizations() {
            if (!usingMock && currentUser && window.Clerk) {
                setCheckingOrgs(true);
                try {
                    const token = await window.Clerk.session.getToken();
                    console.log('Fetching user organizations...');
                    const response = await fetch(`${API_BASE_URL}/api/users/orgs`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const orgs = data.data || [];
                        console.log('User organizations:', orgs);
                        setUserOrgs(orgs);

                        // If user has orgs, set the first one as current (or keep existing if valid)
                        if (orgs.length > 0) {
                            const storedOrgId = localStorage.getItem('current_org_id');
                            const currentOrgStillValid = orgs.find(o => o.id === storedOrgId);

                            let selectedOrgId;
                            if (currentOrgStillValid) {
                                // Keep existing valid org
                                selectedOrgId = storedOrgId;
                                setCurrentOrgId(storedOrgId);
                            } else {
                                // Set to first org if current is invalid
                                selectedOrgId = orgs[0].id;
                                localStorage.setItem('current_org_id', selectedOrgId);
                                setCurrentOrgId(selectedOrgId);
                            }

                            // Fetch user's role in the organization
                            try {
                                const membersResponse = await fetch(`${API_BASE_URL}/api/orgs/${selectedOrgId}/members`, {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                });
                                if (membersResponse.ok) {
                                    const membersData = await membersResponse.json();
                                    const members = membersData.data || [];
                                    const currentMember = members.find(m => m.email === currentUser.email);
                                    if (currentMember && currentMember.role) {
                                        localStorage.setItem('current_user_role', currentMember.role);
                                        console.log('User role set to:', currentMember.role);
                                    }
                                }
                            } catch (err) {
                                console.error('Failed to fetch user role:', err);
                            }
                        } else {
                            // No orgs - clear localStorage
                            localStorage.removeItem('current_org_id');
                            localStorage.removeItem('current_user_role');
                            setCurrentOrgId(null);
                        }
                    } else {
                        console.log('Failed to fetch organizations:', response.status);
                        setUserOrgs([]);
                    }
                } catch (err) {
                    console.error('Failed to check organizations:', err);
                    setUserOrgs([]);
                } finally {
                    setCheckingOrgs(false);
                }
            }
        }

        // Only run once when currentUser is available
        if (currentUser && !usingMock && userOrgs === null) {
            console.log('Running organization check...');
            checkOrganizations();
        }
    }, [currentUser, usingMock]);

    const handleLoginSuccess = () => {
        // Reload to get current user
        window.location.reload();
    };

    const handleOrganizationCreated = (org) => {
        // Update state directly instead of reloading
        setUserOrgs([org]);
        setCurrentOrgId(org.id);
        // localStorage already set by CreateOrganization component
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

    // For HTTP client mode: check organizations before rendering any pages
    if (!usingMock && currentUser) {
        // Still checking organizations
        if (userOrgs === null || checkingOrgs) {
            return (
                <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-zinc-600 dark:text-zinc-400">Loading organizations...</p>
                    </div>
                </div>
            );
        }

        // No organizations - show create org screen
        if (userOrgs.length === 0) {
            return <CreateOrganization onSuccess={handleOrganizationCreated} currentUser={currentUser} />;
        }

        // Has orgs but org ID not set yet (should rarely happen with localStorage init)
        if (!currentOrgId && userOrgs.length > 0) {
            // Set to first org
            const newOrgId = userOrgs[0].id;
            localStorage.setItem('current_org_id', newOrgId);
            setCurrentOrgId(newOrgId);
            return (
                <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-zinc-600 dark:text-zinc-400">Setting up organization...</p>
                    </div>
                </div>
            );
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

                <Route path="/SystemHealth" element={
                    <ProtectedRoute pageName="SystemHealth" currentUser={currentUser}>
                        <SystemHealth />
                    </ProtectedRoute>
                } />
                <Route path="/systemhealth" element={
                    <ProtectedRoute pageName="SystemHealth" currentUser={currentUser}>
                        <SystemHealth />
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