// Copy this file to public/config.js (which git ignores) and fill in your values.
window.FLAGSMITH_CONFIG = {
  // Client-side environment key: `flagsmith environment list --project <project>`
  environmentID: 'YOUR_CLIENT_SIDE_ENVIRONMENT_KEY',
  // Self-hosted Flagsmith API
  apiUrl: 'http://localhost:8000/api/v1/',
  // Events URL. With the Flagsmith database as the warehouse, this is the API URL ending in /api/
  eventsApiUrl: 'http://localhost:8000/api/',
};
