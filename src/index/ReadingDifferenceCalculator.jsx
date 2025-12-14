// src/components/ReadingDifferenceCalculator.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MessageBox from './MessageBox';
import ReadingInputs from './ReadingInputs';
import DynamicEntrySection from './DynamicEntrySection';

// Custom CSS for global application styles
const customStyles = `
    /* Custom styles for the Inter font and overall body */
    body {
        font-family: 'Inter', sans-serif;
        background-color: #2563eb; /* Blue background for the entire page */
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        min-height: 100vh; /* Ensure body takes full viewport height */
        display: flex;
        justify-content: center; /* Center horizontally */
        align-items: center; /* Center vertically */
    }
    /* Ensure input type="number" does not show spin buttons */
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    input[type="number"] {
        -moz-appearance: textfield; /* Firefox specific */
    }

    /* Custom message box styles */
    .message-box {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 2rem;
        border-radius: 0.75rem; /* rounded-xl */
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-lg */
        z-index: 1000;
        text-align: center;
        max-width: 90%; /* Responsive width */
    }
    .message-box-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 999;
    }
`;

// Default staff entry names
const defaultNames = ["GPAY", "CARD", "UNISAT", "ENAMAKAL", "MARIYAS", "VIKASH", "KAVALAKKAD"];

// Helper function to create an initial dynamic entry (credit/debit/packed oil)
const createInitialDynamicEntry = (name = '', amount = 0, type = 'credit') => ({
    id: `${type}_${Date.now()}_${Math.random()}`,
    name,
    amount: amount.toString(), // Store as string for input value
});


// Main React Component
const ReadingDifferenceCalculator = () => {
    // ⭐ NEW: Define the API URL from environment variables
    // This will be 'http://localhost:3000' in dev, and 'https://your-deployed-api-domain.com' in prod
    const BASE_URL = import.meta.env.VITE_API_BASE_URL; 

    // ----------------------------------------------------
    // 1. STATE MANAGEMENT
    // ----------------------------------------------------

    const [formData, setFormData] = useState({
        currentDate: '',
        selectedId: '',
        petrol: 'Loading...',
        diesel: 'Loading...',
        oil: 'Loading...',

        // Initial reading inputs (using keys from the original component)
        oilFirstReading: '', oilFirstReading2: '', oilFirstReading3: '',
        oilSecondReading: '', oilSecondReading2: '', oilSecondReading3: '',
        firstReading1: '', firstReading2: '', firstReading3: '',
        secondReading1: '', secondReading2: '', secondReading3: '',
        dieselFirstReading1: '', dieselFirstReading2: '', dieselFirstReading3: '',
        dieselSecondReading1: '', dieselSecondReading2: '', dieselSecondReading3: '',
        
        petrolTestQuantity: '',
        dieselTestQuantity: '',

        batteryWater30: '', batteryWater60: '', batteryWater150: '',
        acidWater: '',

        // Note denominations
        note500: '', note200: '', note100: '', note50: '', note20: '', note10: '', note5: '', coins: ''
    });

    const [staffList, setStaffList] = useState([]);
    const [creditEntries, setCreditEntries] = useState(defaultNames.map(name => createInitialDynamicEntry(name, 0, 'credit')));
    const [debitEntries, setDebitEntries] = useState(defaultNames.map(name => createInitialDynamicEntry(name, 0, 'debit')));
    const [packedOilEntries, setPackedOilEntries] = useState([]);
    const [message, setMessage] = useState(null); // For custom message box
    const [messageType, setMessageType] = useState('success');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ----------------------------------------------------
    // 2. HELPER FUNCTIONS
    // ----------------------------------------------------

    const showMessageBox = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    // Callback for Dynamic Entry Change (used by DynamicEntrySection for Credit/Debit/PackedOil)
    const handleDynamicEntryChange = useCallback((id, field, value, setEntries) => {
        setEntries(prevEntries => 
            prevEntries.map(entry => 
                entry.id === id ? { ...entry, [field]: value } : entry
            )
        );
    }, []);

    // Callback for adding a new dynamic entry
    const addDynamicEntry = useCallback((type) => {
        const newEntry = createInitialDynamicEntry('', 0, type);
        if (type === 'credit') {
            setCreditEntries(prev => [...prev, newEntry]);
        } else if (type === 'debit') {
            setDebitEntries(prev => [...prev, newEntry]);
        } else if (type === 'packedOil') {
            setPackedOilEntries(prev => [...prev, newEntry]);
        }
    }, []);

    // Callback for removing a dynamic entry
    const removeDynamicEntry = useCallback((id, setEntries) => {
        setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    }, []);


    // ----------------------------------------------------
    // 3. DATA FETCHING (useEffect)
    // ----------------------------------------------------

    // Fetch staff data (Mocked for functional demonstration)
    useEffect(() => {
        const populateStaffDropdown = async () => {
            try {
                // ⭐ FIX 1: Using BASE_URL for production readiness
                const response = await fetch(`${BASE_URL}/api/staff`); 
                if (response.ok) {
                    const staffList = await response.json();
                    setStaffList(staffList);
                } else {
                    console.error('Failed to fetch staff data:', response.statusText);
                    // showMessageBox('Failed to load staff list. Please try refreshing.', 'error');
                    // Mock fallback data if fetch fails
                    setStaffList([{ staffId: 'mock1', name: 'John Doe' }, { staffId: 'mock2', name: 'Jane Smith' }]);
                }
            } catch (error) {
                console.error('Error fetching staff data:', error);
                setStaffList([{ staffId: 'mock1', name: 'John Doe' }, { staffId: 'mock2', name: 'Jane Smith' }]);
            }
        };

        populateStaffDropdown();
    }, [BASE_URL]); // BASE_URL is constant across renders but added for completeness

    // Fetch and display prices (Mocked for functional demonstration)
    useEffect(() => {
        const loadAndDisplayPrices = async () => {
            try {
                // ⭐ FIX 2: Using BASE_URL for production readiness
                const response = await fetch(`${BASE_URL}/api/prices/current`); 
                if (response.ok) {
                    const data = await response.json();
                    if (data) {
                        setFormData(prev => ({
                            ...prev,
                            petrol: data.petrolPrice !== undefined ? data.petrolPrice.toFixed(2) : 'N/A',
                            diesel: data.dieselPrice !== undefined ? data.dieselPrice.toFixed(2) : 'N/A',
                            oil: data.oilPrice !== undefined ? data.oilPrice.toFixed(2) : 'N/A',
                        }));
                    }
                } else {
                    console.error('Failed to fetch current prices:', await response.json());
                    // Mock fallback prices if fetch fails
                    setFormData(prev => ({ ...prev, petrol: '104.50', diesel: '95.25', oil: '120.00' }));
                }
            } catch (error) {
                console.error('Error fetching current prices:', error);
                 setFormData(prev => ({ ...prev, petrol: '104.50', diesel: '95.25', oil: '120.00' }));
            }
        };

        loadAndDisplayPrices();
    }, [BASE_URL]); // BASE_URL is constant across renders but added for completeness

    // ----------------------------------------------------
    // 4. SUBMISSION LOGIC (useCallback)
    // ----------------------------------------------------

    const saveAndNavigate = useCallback(async () => {
        setIsSubmitting(true);

        const payload = { ...formData };

        // 1. Process main form data (converting known numbers)
        for (const key in payload) {
            // Convert numeric-looking fields to float, excluding special keys
            if (key !== 'currentDate' && key !== 'selectedId' && !['petrol', 'diesel', 'oil'].includes(key) && !isNaN(parseFloat(payload[key]))) {
                payload[key] = parseFloat(payload[key]) || 0;
            }
        }

        // 2. Process dynamic entries
        const processEntries = (entries) => entries.map(entry => ({
            name: entry.name,
            amount: parseFloat(entry.amount) || 0
        }));

        payload.packedOilEntries = processEntries(packedOilEntries);
        payload.creditEntries = processEntries(creditEntries);
        payload.debitEntries = processEntries(debitEntries);

        try {
            // ⭐ FIX 3: Using BASE_URL for production readiness
            const response = await fetch(`${BASE_URL}/api/saveReading`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showMessageBox('Data saved successfully!', 'success');
                // In a real application, you would navigate or reset the form here
            } else {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                showMessageBox(`Failed to save data. Server returned: ${errorData.message || response.statusText}`, 'error');
            }
        } catch (error) {
            console.error('Error saving data:', error);
            showMessageBox('An error occurred while saving data. Check console for details.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, packedOilEntries, creditEntries, debitEntries, BASE_URL]); // BASE_URL added to dependencies


    // ----------------------------------------------------
    // 5. RENDER LOGIC
    // ----------------------------------------------------

    return (
        <>
            {/* Inject custom styles */}
            <style dangerouslySetInnerHTML={{ __html: customStyles }} />

            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-lg w-11/12 max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto my-auto">

                <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-8 text-center">Fuel Station Daily Readings</h1>
                
                {/* Date Input */}
                <div className="mb-8">
                    <label htmlFor="currentDate" className="block text-lg font-semibold text-gray-700 mb-2 text-center">Date</label>
                    <input type="date" id="currentDate"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm text-gray-800 text-center"
                        value={formData.currentDate}
                        onChange={handleInputChange} />
                </div>

                {/* Staff Selection */}
                <div className="mb-8">
                    <label htmlFor="selectedId" className="block text-lg font-semibold text-gray-700 mb-2 text-center">Select Staff</label>
                    <select id="selectedId"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm text-gray-800 text-center"
                        value={formData.selectedId}
                        onChange={handleInputChange}>
                        <option value="">--Select Staff--</option>
                        {staffList.map(staff => (
                            <option key={staff.staffId || staff.name} value={staff.staffId || staff.name}>{staff.name}</option>
                        ))}
                    </select>
                </div>

                {/* Price Inputs (Readonly) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                    {['petrol', 'diesel', 'oil'].map(fuel => (
                        <div key={fuel}>
                            <label htmlFor={fuel} className="block text-lg font-semibold text-gray-700 mb-2 text-center">
                                {fuel.charAt(0).toUpperCase() + fuel.slice(1)} Price
                            </label>
                            <input type="number" id={fuel}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm text-gray-800 text-center bg-gray-100"
                                placeholder="Loading..."
                                value={formData[fuel]}
                                readOnly />
                        </div>
                    ))}
                </div>

                <hr className="my-8 border-t border-gray-300" />

                {/* Fuel Readings Section */}
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Fuel Readings</h2>

                <ReadingInputs label="Oil First Reading" baseId="oilFirstReading" formData={formData} setFormData={setFormData} count={3} />
                <ReadingInputs label="Oil Second Reading" baseId="oilSecondReading" formData={formData} setFormData={setFormData} count={3} />

                <ReadingInputs label="Petrol First Reading" baseId="firstReading" formData={formData} setFormData={setFormData} count={3} />
                <ReadingInputs label="Petrol Second Reading" baseId="secondReading" formData={formData} setFormData={setFormData} count={3} />

                <ReadingInputs label="Diesel First Reading" baseId="dieselFirstReading" formData={formData} setFormData={setFormData} count={3} />
                <ReadingInputs label="Diesel Second Reading" baseId="dieselSecondReading" formData={formData} setFormData={setFormData} count={3} />

                <hr className="my-8 border-t border-gray-300" />

                {/* Test Quantity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {['petrol', 'diesel'].map(fuel => (
                        <div key={fuel}>
                            <label htmlFor={`${fuel}TestQuantity`} className="block text-lg font-semibold text-gray-700 mb-2 text-center">
                                {fuel.charAt(0).toUpperCase() + fuel.slice(1)} Test Quantity (Liters)
                            </label>
                            <input type="number" id={`${fuel}TestQuantity`}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm text-gray-800 text-center"
                                placeholder="Enter liters tested"
                                value={formData[`${fuel}TestQuantity`]}
                                onChange={handleInputChange} />
                        </div>
                    ))}
                </div>

                <hr className="my-8 border-t border-gray-300" />

                {/* Battery/Acid Water */}
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Additional Items</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    <div className="md:col-span-1">
                        <label className="block text-lg font-semibold text-gray-700 mb-2 text-center">Battery Water (Multiplier * Value)</label>
                        <div className="flex flex-col space-y-3">
                            {['30', '60', '150'].map(val => (
                                <div key={val} className="flex items-center gap-x-2">
                                    <label htmlFor={`batteryWater${val}`} className="w-1/3 text-right pr-4 text-gray-700 text-sm font-medium">{val} *</label>
                                    <input type="number" id={`batteryWater${val}`}
                                        className="w-2/3 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm text-gray-800 text-center"
                                        placeholder="Enter value"
                                        value={formData[`batteryWater${val}`]}
                                        onChange={handleInputChange} />
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="md:col-span-1">
                        <label htmlFor="acidWater" className="block text-lg font-semibold text-gray-700 mb-2 text-center">Acid Water Amount</label>
                        <input type="number" id="acidWater"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm text-gray-800 text-center"
                            placeholder="Enter amount"
                            value={formData.acidWater}
                            onChange={handleInputChange} />
                    </div>
                </div>

                <hr className="my-8 border-t border-gray-300" />

                {/* Packed Oil */}
                <DynamicEntrySection
                    title="Packed Oil Sales"
                    entries={packedOilEntries}
                    setEntries={setPackedOilEntries}
                    type="packedOil"
                    handleDynamicEntryChange={handleDynamicEntryChange}
                    addDynamicEntry={addDynamicEntry}
                    removeDynamicEntry={removeDynamicEntry}
                    isPackedOil={true}
                />

                <hr className="my-8 border-t border-gray-300" />

                {/* Credit/Debit */}
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Financial Entries</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Credit */}
                    <DynamicEntrySection
                        title="Credit"
                        entries={creditEntries}
                        setEntries={setCreditEntries}
                        type="credit"
                        handleDynamicEntryChange={handleDynamicEntryChange}
                        addDynamicEntry={addDynamicEntry}
                        removeDynamicEntry={removeDynamicEntry}
                    />

                    {/* Debit */}
                    <DynamicEntrySection
                        title="Debit"
                        entries={debitEntries}
                        setEntries={setDebitEntries}
                        type="debit"
                        handleDynamicEntryChange={handleDynamicEntryChange}
                        addDynamicEntry={addDynamicEntry}
                        removeDynamicEntry={removeDynamicEntry}
                    />
                </div>

                <hr className="my-8 border-t border-gray-300" />

                {/* Denomination Calculator */}
                <div className="grid grid-cols-1 mt-8">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 text-center">Note Denomination (Count)</h2>
                    <div className="space-y-3">
                        {[500, 200, 100, 50, 20, 10, 5].map(note => (
                            <div key={note} className="flex items-center">
                                <label htmlFor={`note${note}`} className="w-24 text-right pr-4 text-gray-700 text-lg font-medium">₹ {note} x</label>
                                <input type="number" id={`note${note}`}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm text-gray-800 text-center"
                                    placeholder="0"
                                    value={formData[`note${note}`]}
                                    onChange={handleInputChange} />
                            </div>
                        ))}
                        <div className="flex items-center">
                            <label htmlFor="coins" className="w-24 text-right pr-4 text-gray-700 text-lg font-medium">Coins</label>
                            <input type="number" id="coins"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm text-gray-800 text-center"
                                placeholder="0"
                                value={formData.coins}
                                onChange={handleInputChange} />
                        </div>
                    </div>
                </div>

                <hr className="my-8 border-t border-gray-300" />

                {/* Submit Button */}
                <div className="grid grid-cols-1 mt-8">
                    <button onClick={saveAndNavigate}
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-xl transition duration-300 ease-in-out disabled:opacity-50">
                        {isSubmitting ? 'Submitting...' : 'Submit Daily Reading'}
                    </button>
                </div>
            </div>

            {/* Render Message Box (Modal/Popup) */}
            <MessageBox
                message={message}
                type={messageType}
                onClose={() => setMessage(null)}
            />
        </>
    );
};

export default ReadingDifferenceCalculator;