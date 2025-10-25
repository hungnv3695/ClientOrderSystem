// Centralized frontend configuration
// Prefer environment variables (VITE_*) with sensible fallbacks

// API base URL configuration - environment variable hoặc fallback
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.11.12:3000/api';

// Socket service configuration - environment variable hoặc fallback
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://192.168.11.12:3000';

// Print service configuration - environment variable hoặc fallback
export const PRINT_SERVICE_URL = import.meta.env.VITE_PRINT_SERVICE_URL || 'http://192.168.11.12:3003/api/print';
