import React, { useState, useEffect, useCallback } from 'react';

// --- Configuration and Utilities ---
// Access the environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const getApiUrl = (path) => `${API_BASE_URL}${path}`;

// Assumed API endpoints for price management
const PRICE_UPDATE_ENDPOINT = '/api/prices/update';
const PRICE_FETCH_ENDPOINT = '/api/prices/current'; 

function PriceChange() {
    // State for form inputs (prices)
    const [prices, setPrices] = useState({
        petrolPrice: '',
        dieselPrice: '',
        oilPrice: '',
    });

    // State for process control and messages
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({
        text: '',
        type: '', // 'success' or 'error'
        isVisible: false,
    });

    // --- Message Management ---

    const showMessageBox = useCallback((text, type) => {
        setMessage({ text, type, isVisible: true });
        // Auto-hide message after 5 seconds
        setTimeout(() => {
            setMessage(prev => ({ ...prev, isVisible: false }));
        }, 5000);
    }, []);

    // --- Handlers ---

    // Input change handler with validation for decimal numbers
    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        // Allows only numbers and a single optional decimal point
        if (/^\d*\.?\d*$/.test(value) || value === '') {
            setPrices(prev => ({ ...prev, [name]: value }));
        }
    };
    
    // 1. Fetch Current Prices on Load
    const fetchCurrentPrices = useCallback(async () => {
        try {
            setLoading(true);
            const url = getApiUrl(PRICE_FETCH_ENDPOINT);
            const response = await fetch(url);
            
            if (!response.ok) {
                // Throwing an error ensures the catch block executes
                throw new Error(`Failed to fetch current prices. Status: ${response.status}`);
            }
            
            // Assuming API returns an object like: { petrolPrice: 98.50, dieselPrice: 89.25, oilPrice: 1200.00 }
            const data = await response.json();
            
            setPrices({
                // Convert numbers to strings for input fields
                petrolPrice: data.petrolPrice ? String(data.petrolPrice) : '',
                dieselPrice: data.dieselPrice ? String(data.dieselPrice) : '',
                oilPrice: data.oilPrice ? String(data.oilPrice) : '',
            });

        } catch (err) {
            console.error('Error fetching prices:', err);
            showMessageBox('Could not load current prices. Check the API server.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showMessageBox]);

    useEffect(() => {
        fetchCurrentPrices();
    }, [fetchCurrentPrices]);


    // 2. Handle Form Submission (Update Prices)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '', isVisible: false }); // Clear previous message

        // Simple validation
        const priceValues = [prices.petrolPrice, prices.dieselPrice, prices.oilPrice];
        if (priceValues.some(p => p === '' || isNaN(parseFloat(p)))) {
            showMessageBox('All price fields must be valid numbers.', 'error');
            setLoading(false);
            return;
        }

        try {
            const url = getApiUrl(PRICE_UPDATE_ENDPOINT);
            const response = await fetch(url, {
                method: 'POST', // Use POST or PUT based on your API
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(prices),
            });

            if (!response.ok) {
                throw new Error(`Price update failed. Status: ${response.status}`);
            }

            // Success message
            showMessageBox('Prices updated successfully!', 'success');

        } catch (err) {
            console.error('Price update error:', err);
            showMessageBox(`Failed to update prices: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // --- JSX Render ---

    const inputClasses = "w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm text-gray-800 text-center";

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Price Change</h2>
            
            {/* Message Box */}
            {message.isVisible && (
                <div 
                    className={`p-4 mb-6 rounded-lg font-medium ${
                        message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-400' : 
                        'bg-red-100 text-red-700 border border-red-400'
                    }`}
                    role="alert"
                >
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <p className="text-gray-600 mb-6 text-center">
                    {loading ? "Loading current prices..." : "Enter the new prices below and click Update to save them."}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Petrol Price */}
                    <div className="flex flex-col items-center">
                        <label className="text-lg font-semibold text-gray-800 mb-2">Petrol Price (₹)</label>
                        <input
                            type="text" 
                            name="petrolPrice"
                            value={prices.petrolPrice}
                            onChange={handlePriceChange}
                            className={inputClasses}
                            placeholder="e.g., 105.50"
                            inputMode="decimal"
                            disabled={loading}
                        />
                    </div>

                    {/* Diesel Price */}
                    <div className="flex flex-col items-center">
                        <label className="text-lg font-semibold text-gray-800 mb-2">Diesel Price (₹)</label>
                        <input
                            type="text"
                            name="dieselPrice"
                            value={prices.dieselPrice}
                            onChange={handlePriceChange}
                            className={inputClasses}
                            placeholder="e.g., 94.75"
                            inputMode="decimal"
                            disabled={loading}
                        />
                    </div>

                    {/* Oil Price */}
                    <div className="flex flex-col items-center">
                        <label className="text-lg font-semibold text-gray-800 mb-2">Oil Price (₹)</label>
                        <input
                            type="text"
                            name="oilPrice"
                            value={prices.oilPrice}
                            onChange={handlePriceChange}
                            className={inputClasses}
                            placeholder="e.g., 1250.00"
                            inputMode="decimal"
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="flex justify-center mt-8">
                    <button
                        type="submit"
                        className={`px-8 py-3 rounded-lg font-bold text-white transition duration-200 shadow-md ${
                            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Prices'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default PriceChange;