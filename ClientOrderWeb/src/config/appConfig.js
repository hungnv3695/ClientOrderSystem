// Centralized frontend configuration
// Prefer environment variables (VITE_*) with sensible fallbacks

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://127.0.0.1:3000';

// Print service configuration - environment variable hoặc fallback
export const PRINT_SERVICE_URL = import.meta.env.VITE_PRINT_SERVICE_URL || 'http://localhost:3003/api/print';


