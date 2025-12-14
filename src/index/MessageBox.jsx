// src/components/MessageBox.jsx

import React from 'react';

/**
 * Custom Message Box Component (Modal/Popup)
 */
const MessageBox = ({ message, type, onClose }) => {
    if (!message) return null;

    const textColor = type === 'success' ? 'text-green-600' : 'text-red-600';

    return (
        <>
            <div className="message-box-overlay" />
            <div className="message-box">
                <p className={`text-lg font-semibold mb-4 ${textColor}`}>
                    {message}
                </p>
                <button
                    onClick={onClose}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                >
                    OK
                </button>
            </div>
        </>
    );
};

export default MessageBox;