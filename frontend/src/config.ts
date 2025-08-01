const DEVELOPMENT_API_URL = 'http://127.0.0.1:5001';

// For production (deployed) - Replace with your actual deployed backend URL
const PRODUCTION_API_URL = 'https://osint-1-r7m0.onrender.com'; // or render.com, heroku.com, etc.

// Automatically detect environment
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? PRODUCTION_API_URL 
  : DEVELOPMENT_API_URL;
