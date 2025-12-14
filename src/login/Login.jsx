import React, { useState } from 'react';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// --- Message Box Component (Using Tailwind for most styling) ---
const MessageBox = ({ message, type, onClose }) => {
 if (!message) return null;

 // Base classes applied to both success and error
 const baseClasses = "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 rounded-xl shadow-2xl z-50 text-center font-bold max-w-sm";
 
 // Type-specific classes (using Tailwind color palettes)
 const typeClasses = type === 'success'
  ? "bg-green-100 text-green-800 border border-green-300" // Corresponds to original success colors
   : "bg-red-100 text-red-800 border border-red-300";   // Corresponds to original error colors

 return (
  <div className={`${baseClasses} ${typeClasses}`}>
   <p>{message}</p>
   <button 
    onClick={onClose} 
    className="mt-4 px-5 py-2 border border-transparent rounded-md cursor-pointer bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
      >
        OK
      </button>
    </div>
  );
};

// --- Main Login Component ---
const Login = () => {
  // State for form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // State for the message box
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('error');

  // Convert original <body> style to React inline style object (only for non-tailwind properties like font-family and background-color)
  const bodyStyle = {
    fontFamily: "'Inter', sans-serif",
    backgroundColor: '#f0f4f8', // Retaining the specific background color
  };

  const showMessageBox = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
  };

  const hideMessageBox = () => {
    setMessage(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
        // ⭐ Updated: Use BASE_URL for the API call
        const response = await fetch(`${BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

      const data = await response.json();

      if (response.ok) {
        showMessageBox(data.message || 'Login successful!', 'success');
        // Redirect logic (This remains a relative path for the frontend routing)
        setTimeout(() => {
          window.location.href = 'hbvheiwbvhebnjhfrbvhjdbhvbfxjkbkdbhadmin';
        }, 1500);
      } else {
        showMessageBox(data.message || 'Login failed. Please check your credentials.', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showMessageBox('An error occurred during login. Please try again.', 'error');
    }
  };

  return (
    // Outer div mimics the <body> layout using Tailwind classes and minimal inline style
    <div 
        className="antialiased flex justify-center items-center min-h-screen m-0 box-border" 
        style={bodyStyle}
    >
      <MessageBox
        message={message}
        type={messageType}
        onClose={hideMessageBox}
      />

      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;