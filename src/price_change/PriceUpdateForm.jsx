import React, { useState, useEffect, useCallback } from 'react';

// ⭐ FEATURE: Define the API URL from environment variables
// This variable must be set in your deployment environment (e.g., Vercel)
// to point to your backend (e.g., Render) URL, like https://your-backend-api.onrender.com.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const PriceUpdateForm = () => {
    // State for form inputs
    const [prices, setPrices] = useState({
        petrolPrice: '',
        dieselPrice: '',
        oilPrice: '',
    });

    // State for the notification message box
    const [message, setMessage] = useState({
        text: '',
        type: '', // 'success' or 'error'
        isVisible: false,
    });

    /**
     * Shows the message box with the given text and type.
     */
    const showMessageBox = useCallback((text, type) => {
        setMessage({
            text,
            type,
            isVisible: true,
        });
    }, []);

    /**
     * Hides the message box.
     */
    const hideMessageBox = useCallback(() => {
        setMessage(prev => ({ ...prev, isVisible: false }));
    }, []);

    /**
     * Fetches the current prices from the backend and populates the form fields.
     */
    const loadCurrentPrices = useCallback(async () => {
        try {
            // ⭐ Updated: Use BASE_URL for the API call
            const response = await fetch(`${BASE_URL}/api/prices/current`);
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setPrices({
                        // Convert to string to properly populate the input value
                        petrolPrice: data.petrolPrice !== undefined ? String(data.petrolPrice) : '',
                        dieselPrice: data.dieselPrice !== undefined ? String(data.dieselPrice) : '',
                        oilPrice: data.oilPrice !== undefined ? String(data.oilPrice) : '',
                    });
                }
            } else {
                console.error('Failed to fetch current prices:', await response.json());
                showMessageBox('Failed to load current prices. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error fetching current prices:', error);
            showMessageBox('An error occurred while fetching current prices.', 'error');
        }
    }, [showMessageBox]);

    // Load current prices on component mount
    useEffect(() => {
        loadCurrentPrices();
    }, [loadCurrentPrices]);


    /**
     * Handles changes in the input fields.
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPrices(prevPrices => ({
            ...prevPrices,
            [name]: value,
        }));
    };

    /**
     * Handles the form submission to update the prices.
     */
    const updatePrices = async (event) => {
        event.preventDefault();

        // Convert values to float and perform validation
        const petrolPrice = parseFloat(prices.petrolPrice);
        const dieselPrice = parseFloat(prices.dieselPrice);
        const oilPrice = parseFloat(prices.oilPrice);

        if (isNaN(petrolPrice) || isNaN(dieselPrice) || isNaN(oilPrice)) {
            showMessageBox('Please enter valid numeric values for all prices.', 'error');
            return;
        }

        const data = {
            petrolPrice: petrolPrice,
            dieselPrice: dieselPrice,
            oilPrice: oilPrice,
        };

        try {
            // ⭐ Updated: Use BASE_URL for the API call
            const response = await fetch(`${BASE_URL}/api/prices/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                showMessageBox('Prices updated successfully!', 'success');
            } else {
                const errorData = await response.json();
                showMessageBox(`Failed to update prices: ${errorData.message || response.statusText}`, 'error');
                console.error('Server error:', errorData);
            }
        } catch (error) {
            console.error('Error updating prices:', error);
            showMessageBox('An error occurred while updating prices.', 'error');
        }
    };

    /**
     * Dynamically generates the Tailwind CSS classes for the message box.
     */
    const messageBoxClasses = () => {
        let classes = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 rounded-xl shadow-2xl z-50 text-center font-bold transition-all duration-300 w-80';

        if (message.isVisible) {
            classes += ' block';
        } else {
            // Use 'hidden' when not visible
            classes += ' hidden'; 
        }

        if (message.type === 'success') {
            // Tailwind equivalent of the original success styles
            classes += ' bg-green-100 text-green-800 border border-green-400';
        } else if (message.type === 'error') {
            // Tailwind equivalent of the original error styles
            classes += ' bg-red-100 text-red-800 border border-red-400';
        }

        return classes;
    };


    return (
        <div className="antialiased flex justify-center items-center min-h-screen bg-indigo-100"> 
            
            {/* Message Box for notifications */}
            <div className={messageBoxClasses()}>
                <p className="mb-4">{message.text}</p>
                <button 
                    onClick={hideMessageBox} 
                    className="mt-4 px-5 py-2 border-none rounded-md cursor-pointer bg-blue-600 text-white font-bold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    OK
                </button>
            </div>

            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-lg w-full max-w-lg md:max-w-xl mx-auto my-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 text-center">Update Fuel & Oil Prices</h1>

                <form onSubmit={updatePrices} id="priceUpdateForm" className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        {/* Petrol Price Input */}
                        <div>
                            <label htmlFor="petrolPrice" className="block text-lg font-semibold text-gray-700 mb-2 text-center">Petrol Price (₹)</label>
                            <input
                                type="number"
                                id="petrolPrice"
                                name="petrolPrice"
                                value={prices.petrolPrice}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm text-gray-800 text-center custom-number-input"
                                placeholder="Enter petrol price"
                                step="0.01"
                            />
                        </div>
                        {/* Diesel Price Input */}
                        <div>
                            <label htmlFor="dieselPrice" className="block text-lg font-semibold text-gray-700 mb-2 text-center">Diesel Price (₹)</label>
                            <input
                                type="number"
                                id="dieselPrice"
                                name="dieselPrice"
                                value={prices.dieselPrice}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm text-gray-800 text-center custom-number-input"
                                placeholder="Enter diesel price"
                                step="0.01"
                            />
                        </div>
                        {/* Oil Price Input */}
                        <div>
                            <label htmlFor="oilPrice" className="block text-lg font-semibold text-gray-700 mb-2 text-center">Oil Price (₹)</label>
                            <input
                                type="number"
                                id="oilPrice"
                                name="oilPrice"
                                value={prices.oilPrice}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm text-gray-800 text-center custom-number-input"
                                placeholder="Enter oil price"
                                step="0.01"
                            />
                        </div>
                    </div>

                    <div className="flex justify-center space-x-4 mt-8">
                        <button
                            type="submit"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Update Prices
                        </button>
                        <button
                            type="button"
                            onClick={() => window.location.href='/hbvheiwbvhebnjhfrbvhjdbhvbfxjkbkdbhadmin'}
                            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Back to Admin
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PriceUpdateForm;