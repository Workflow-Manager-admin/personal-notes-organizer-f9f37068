import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// PUBLIC_INTERFACE
// If you use create-react-app, the .env file is loaded automatically
// For cloud backend with Supabase, you must supply REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY in .env

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
