/**
 * Application Configuration
 * Centralizes environment variables and config constants
 */

// Backend API Base URL (without /api suffix for direct fetch calls)
export const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

// Backend API URL with /api suffix (for httpClient)
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Clerk Configuration
export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Environment
export const IS_PRODUCTION = import.meta.env.VITE_ENV === 'production';
export const IS_DEVELOPMENT = import.meta.env.VITE_ENV === 'development' || !import.meta.env.VITE_ENV;
