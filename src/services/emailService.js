/**
 * Email Service for sending notifications
 * Integrates with backend email API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Get auth token from Clerk
 */
async function getAuthToken() {
  if (window.Clerk && window.Clerk.session) {
    try {
      const token = await window.Clerk.session.getToken();
      return token;
    } catch (error) {
      console.error('Failed to get Clerk token:', error);
      return null;
    }
  }
  return null;
}

/**
 * Send invitation email
 */
export async function sendInvitationEmail(invitationData) {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/emails/invitation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(invitationData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send invitation email');
  }

  return response.json();
}

/**
 * Send welcome email to new member
 */
export async function sendWelcomeEmail(memberData) {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/emails/welcome`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(memberData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send welcome email');
  }

  return response.json();
}

/**
 * Send role change notification
 */
export async function sendRoleChangeEmail(memberData) {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/emails/role-change`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(memberData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send role change email');
  }

  return response.json();
}

/**
 * Send invitation reminder
 */
export async function sendInvitationReminder(invitationId) {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/emails/invitation-reminder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify({ invitationId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send reminder');
  }

  return response.json();
}

/**
 * Send onboarding checklist email
 */
export async function sendOnboardingChecklistEmail(memberData) {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/emails/onboarding-checklist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(memberData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send onboarding checklist');
  }

  return response.json();
}
