import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';

// This is the standard entry point file that mounts the App component 
// to the 'root' element defined in public/index.html.

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);