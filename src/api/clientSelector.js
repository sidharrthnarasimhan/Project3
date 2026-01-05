/**
 * Client Selector - Switches between mock and HTTP client
 *
 * Set USE_MOCK_CLIENT=true in localStorage to use mock client
 * Set USE_MOCK_CLIENT=false to use real HTTP client
 */

import { localClient } from './localClient.js';
import { httpClient } from './httpClient.js';

/**
 * Determine which client to use
 */
function selectClient() {
  // Check if we should use mock client
  const useMock = localStorage.getItem('USE_MOCK_CLIENT');

  // Default to mock client for now (easier development)
  // Change to 'false' to use HTTP client
  if (useMock === null) {
    localStorage.setItem('USE_MOCK_CLIENT', 'true');
    return localClient;
  }

  return useMock === 'true' ? localClient : httpClient;
}

/**
 * Get current client
 */
export const getCurrentClient = () => selectClient();

/**
 * Switch to HTTP client
 */
export const useHttpClient = async () => {
  // Sign out from Clerk if there's an active session
  if (window.Clerk) {
    try {
      await window.Clerk.signOut();
    } catch (e) {
      // Ignore errors
    }
  }

  localStorage.setItem('USE_MOCK_CLIENT', 'false');
  // Clear any stale organization context
  localStorage.removeItem('current_org_id');
  window.location.reload();
};

/**
 * Switch to mock client
 */
export const useMockClient = () => {
  localStorage.setItem('USE_MOCK_CLIENT', 'true');
  window.location.reload();
};

/**
 * Check which client is active
 */
export const isUsingMockClient = () => {
  return localStorage.getItem('USE_MOCK_CLIENT') === 'true';
};
