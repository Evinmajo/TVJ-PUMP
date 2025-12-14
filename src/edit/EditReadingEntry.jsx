import React, { useState, useEffect, useCallback } from 'react';

// FIX: Define the absolute base path for the backend API.
// **IMPORTANT**: If your backend server runs on a different port than 3000,
// you MUST change 'http://localhost:3000' to your correct backend URL/port.
const API_BASE_PATH = 'http://localhost:3000/api';

// --- Global Tailwind Utility Classes for Consistency ---
// Note: The [appearance:textfield] class and the [&::...] modifiers are modern
// Tailwind JIT/v3+ syntax used to replicate the original CSS to hide number input spin buttons
const numberInputNoSpin = "w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm text-gray-800 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";
const defaultInputClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm text-gray-800 text-center";

// --- Helper Functions ---

/**
 * Safely gets numeric value from an input string.
 * @param {string} value - The input value string.
 * @returns {number} The parsed number or 0 if invalid.
 */
const getNumberValue = (value) => {
    const parsed = parseFloat(value);
    return !isNaN(parsed) ? parsed : 0;
};

// --- Message Box Component (Pure Tailwind) ---
const MessageBox = ({ message, type, isVisible, onClose }) => {
    if (!isVisible) return null;

    // Converted original custom CSS to pure Tailwind utilities
    const typeClasses = type === 'success'
        ? 'bg-green-100 text-green-800 border border-green-400'
        : 'bg-red-100 text-red-800 border border-red-400';

    return (
        <div
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-5 px-8 rounded-xl shadow-2xl z-50 text-center font-bold ${typeClasses}`}
        >
            <p>{message}</p>
            <button
                onClick={onClose}
                className="mt-4 p-2 px-5 border-none rounded-lg cursor-pointer bg-blue-600 text-white font-bold hover:bg-blue-700"
            >
                OK
            </button>
        </div>
    );
};

// --- Dynamic Entry Component (Packed Oil, Credit, Debit) ---
const DynamicEntryRow = ({ index, type, entry, onUpdate, onRemove }) => {
    const handleNameChange = (e) => {
        onUpdate(index, { ...entry, name: e.target.value });
    };

    const handleAmountChange = (e) => {
        onUpdate(index, { ...entry, amount: e.target.value });
    };

    const inputClass = 'w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm';
    const namePlaceholder = type === 'packedOil' ? 'Oil Name' : `${type.charAt(0).toUpperCase() + type.slice(1)} Name`;
    const amountPlaceholder = 'Amount';

    return (
        <div className="flex items-center gap-x-2 mb-3">
            <input
                type="text"
                value={entry.name}
                onChange={handleNameChange}
                className={`${inputClass}`}
                placeholder={namePlaceholder}
            />
            <input
                type="number"
                value={entry.amount}
                onChange={handleAmountChange}
                className={`${inputClass} ${numberInputNoSpin}`} // Apply no-spin utility
                placeholder={amountPlaceholder}
                step="0.001"
            />
            <button
                type="button"
                className="ml-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                onClick={() => onRemove(index)}
            >
                X
            </button>
        </div>
    );
};


// --- Main Component ---
const EditReadingEntry = () => {
    const [formData, setFormData] = useState({
        currentDate: '',
        selectedId: '',
        petrol: '', diesel: '', oil: '',
        oilFirstReading: '', oilFirstReading2: '', oilFirstReading3: '',
        oilSecondReading: '', oilSecondReading2: '', oilSecondReading3: '',
        firstReading1: '', firstReading2: '', firstReading3: '',
        secondReading1: '', secondReading2: '', secondReading3: '',
        dieselFirstReading1: '', dieselFirstReading2: '', dieselFirstReading3: '',
        dieselSecondReading1: '', dieselSecondReading2: '', dieselSecondReading3: '',
        petrolTestQuantity: '', dieselTestQuantity: '',
        batteryWater30: '', batteryWater60: '', batteryWater150: '', acidWater: '',
        note500: '', note200: '', note100: '', note50: '',
        note20: '', note10: '', note5: '', coins: '',
    });

    const [packedOilEntries, setPackedOilEntries] = useState([]);
    const [creditEntries, setCreditEntries] = useState([]);
    const [debitEntries, setDebitEntries] = useState([]);

    const [newPackedOil, setNewPackedOil] = useState({ name: '', amount: '' });
    const [newCredit, setNewCredit] = useState({ name: '', amount: '' });
    const [newDebit, setNewDebit] = useState({ name: '', amount: '' });

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');
    const [isMessageVisible, setIsMessageVisible] = useState(false);

    // Simulate getting ID from URL on client side
    const currentEntryId = new URLSearchParams(window.location.search).get('id');

    // --- Handlers ---

    const showMessageBox = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
        setIsMessageVisible(true);
    };

    const hideMessageBox = () => {
        setIsMessageVisible(false);
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleDynamicChange = (type, e) => {
        const { id, value } = e.target;
        // Determine which dynamic state to update based on 'type'
        const key = id.replace(`new${type.charAt(0).toUpperCase() + type.slice(1)}`, '').toLowerCase();

        switch (type) {
            case 'packedOil': setNewPackedOil(prev => ({ ...prev, [key]: value })); break;
            case 'credit': setNewCredit(prev => ({ ...prev, [key]: value })); break;
            case 'debit': setNewDebit(prev => ({ ...prev, [key]: value })); break;
            default: break;
        }
    };

    const handleDynamicEntryUpdate = useCallback((type, index, updatedEntry) => {
        const setEntries = type === 'packedOil' ? setPackedOilEntries : type === 'credit' ? setCreditEntries : setDebitEntries;
        setEntries(prev => prev.map((entry, i) => i === index ? updatedEntry : entry));
    }, []);

    const handleDynamicEntryRemove = useCallback((type, index) => {
        const setEntries = type === 'packedOil' ? setPackedOilEntries : type === 'credit' ? setCreditEntries : setDebitEntries;
        setEntries(prev => prev.filter((_, i) => i !== index));
    }, []);

    const addDynamicEntry = (type) => {
        let name, amount, setEntries, newEntryState, setNewEntryState;

        switch (type) {
            case 'packedOil':
                name = newPackedOil.name; amount = newPackedOil.amount;
                setEntries = setPackedOilEntries; newEntryState = newPackedOil; setNewEntryState = setNewPackedOil;
                break;
            case 'credit':
                name = newCredit.name; amount = newCredit.amount;
                setEntries = setCreditEntries; newEntryState = newCredit; setNewEntryState = setNewCredit;
                break;
            case 'debit':
                name = newDebit.name; amount = newDebit.amount;
                setEntries = setDebitEntries; newEntryState = newDebit; setNewEntryState = setNewDebit;
                break;
            default: return;
        }

        if (name.trim() === '' || amount === '') {
            showMessageBox(`${type.charAt(0).toUpperCase() + type.slice(1)} name and amount cannot be empty.`, 'error');
            return;
        }

        setEntries(prev => [...prev, { name: name.trim(), amount: amount }]);
        setNewEntryState({ name: '', amount: '' }); // Clear input fields
    };

    const cancelEdit = () => {
        if (currentEntryId) {
            window.location.href = `/view?id=${currentEntryId}`; // Redirect back
        } else {
            window.location.href = `/admin`; // Fallback
        }
    };

    // --- Data Fetching (useEffect) ---

    useEffect(() => {
        if (!currentEntryId) {
            showMessageBox('No entry ID provided in the URL.', 'error');
            return;
        }

        const loadDataForEdit = async () => {
            try {
                // FIX: Use API_BASE_PATH for absolute URL
                const response = await fetch(`${API_BASE_PATH}/reading/${currentEntryId}`);
                if (response.ok) {
                    const fetchedData = await response.json();
                    if (fetchedData) {
                        // Populate formData state
                        const newFormData = {};
                        for (const key in formData) {
                            if (fetchedData.hasOwnProperty(key)) {
                                newFormData[key] = fetchedData[key] !== undefined && fetchedData[key] !== null ? fetchedData[key] : '';
                            }
                        }
                        setFormData(newFormData);

                        // Populate dynamic entries state, defaulting to empty array
                        // NOTE: Ensure your backend uses the keys 'packedOilEntries', 'creditEntries', 'debitEntries'
                        setPackedOilEntries(fetchedData.packedOilEntries || []);
                        setCreditEntries(fetchedData.creditEntries || []);
                        setDebitEntries(fetchedData.debitEntries || []);

                    } else {
                        showMessageBox('No data found for this ID.', 'error');
                    }
                } else {
                    showMessageBox('Failed to fetch data from the server.', 'error');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                // Updated error message
                showMessageBox('An error occurred while fetching data. Please ensure your backend server is running on the correct port (check API_BASE_PATH).', 'error');
            }
        };

        loadDataForEdit();
    }, [currentEntryId]); // Depend on currentEntryId

    // --- Form Submission (Save Changes) ---

    const saveChanges = async (e) => {
        e.preventDefault();

        // Prepare data for submission, ensuring all numbers are parsed
        const data = {
            ...formData,
            // Parse all number fields from string to float
            ...Object.fromEntries(
                Object.entries(formData)
                    .filter(([key]) => key !== 'currentDate' && key !== 'selectedId')
                    .map(([key, value]) => [key, getNumberValue(value)])
            ),
            packedOilEntries: packedOilEntries.map(entry => ({
                name: entry.name,
                amount: getNumberValue(entry.amount)
            })),
            creditEntries: creditEntries.map(entry => ({
                name: entry.name,
                amount: getNumberValue(entry.amount)
            })),
            debitEntries: debitEntries.map(entry => ({
                name: entry.name,
                amount: getNumberValue(entry.amount)
            })),
        };

        try {
            // FIX: Use API_BASE_PATH for absolute URL
            const response = await fetch(`${API_BASE_PATH}/reading/${currentEntryId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                showMessageBox('Entry updated successfully!', 'success');
                // Redirect after a short delay
                setTimeout(() => {
                    window.location.href = `/view?id=${currentEntryId}`;
                }, 1500);
            } else {
                showMessageBox('Failed to update entry. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error updating entry:', error);
            showMessageBox('An error occurred while updating the entry.', 'error');
        }
    };


    return (
        // The outer div replicates the original <body> styles for background and centering
        <div className="min-h-screen bg-blue-600 flex justify-center items-center p-4 font-sans">
            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-lg w-full max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 text-center">Edit Reading Entry</h1>

                <MessageBox
                    message={message}
                    type={messageType}
                    isVisible={isMessageVisible}
                    onClose={hideMessageBox}
                />

                <form id="editForm" className="space-y-6" onSubmit={saveChanges}>
                    {/* Date and ID Section */}
                    <div className="mb-8">
                        <label htmlFor="currentDate" className="block text-lg font-semibold text-gray-700 mb-2 text-center">Date</label>
                        <input type="date" id="currentDate" name="currentDate"
                            className={`${defaultInputClass} font-bold`}
                            value={formData.currentDate} onChange={handleChange} />
                    </div>

                    <div className="mb-8">
                        <label htmlFor="selectedId" className="block text-lg font-semibold text-gray-700 mb-2 text-center">ID Section</label>
                        <input type="text" id="selectedId" name="selectedId"
                            className={`${defaultInputClass} font-bold`}
                            placeholder="Enter ID"
                            value={formData.selectedId} onChange={handleChange} />
                    </div>

                    {/* Price Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                        <div>
                            <label htmlFor="petrol" className="block text-lg font-semibold text-gray-700 mb-2 text-center">Petrol Price</label>
                            <input type="number" id="petrol" name="petrol"
                                className={numberInputNoSpin}
                                placeholder="Enter petrol price" step="0.001"
                                value={formData.petrol} onChange={handleChange} />
                        </div>
                        <div>
                            <label htmlFor="diesel" className="block text-lg font-semibold text-gray-700 mb-2 text-center">Diesel Price</label>
                            <input type="number" id="diesel" name="diesel"
                                className={numberInputNoSpin}
                                placeholder="Enter diesel price" step="0.001"
                                value={formData.diesel} onChange={handleChange} />
                        </div>
                        <div>
                            <label htmlFor="oil" className="block text-lg font-semibold text-gray-700 mb-2 text-center">Oil Price</label>
                            <input type="number" id="oil" name="oil"
                                className={numberInputNoSpin}
                                placeholder="Enter oil price" step="0.001"
                                value={formData.oil} onChange={handleChange} />
                        </div>
                    </div>

                    <hr className="my-8 border-t border-gray-300" />

                    {/* Oil Readings Section */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 w-full sm:w-1/3 mb-2 sm:mb-0 text-left">Oil First Reading</h2>
                        <div className="flex flex-row space-x-2 w-full sm:w-2/3 justify-end">
                            <input type="number" id="oilFirstReading" name="oilFirstReading" className={`w-1/3 ${numberInputNoSpin.replace('w-full', '')}`} placeholder="-" step="0.001" value={formData.oilFirstReading} onChange={handleChange} />
                            <input type="number" id="oilFirstReading2" name="oilFirstReading2" className={`w-1/3 ${numberInputNoSpin.replace('w-full', '')}`} placeholder="-" step="0.001" value={formData.oilFirstReading2} onChange={handleChange} />
                            <input type="number" id="oilFirstReading3" name="oilFirstReading3" className={`w-1/3 ${numberInputNoSpin.replace('w-full', '')}`} placeholder="-" step="0.001" value={formData.oilFirstReading3} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 w-full sm:w-1/3 mb-2 sm:mb-0 text-left">Oil Second Reading</h2>
                        <div className="flex flex-row space-x-2 w-full sm:w-2/3 justify-end">
                            <input type="number" id="oilSecondReading" name="oilSecondReading" className={`w-1/3 ${numberInputNoSpin.replace('w-full', '')}`} placeholder="-" step="0.001" value={formData.oilSecondReading} onChange={handleChange} />
                            <input type="number" id="oilSecondReading2" name="oilSecondReading2" className={`w-1/3 ${numberInputNoSpin.replace('w-full', '')}`} placeholder="-" step="0.001" value={formData.oilSecondReading2} onChange={handleChange} />
                            <input type="number" id="oilSecondReading3" name="oilSecondReading3" className={`w-1/3 ${numberInputNoSpin.replace('w-full', '')}`} placeholder="-" step="0.001" value={formData.oilSecondReading3} onChange={handleChange} />
                        </div>
                    </div>

                    <hr className="my-8 border-t border-gray-300" />

                    {/* Petrol Readings Section */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 w-full sm:w-1/3 mb-2 sm:mb-0 text-left">Petrol First Reading</h2>
                        <div className="flex flex-row space-x-2 w-full sm:w-2/3 justify-end">
                            <input type="number" id="firstReading1" name="firstReading1" className={`w-1/3 ${numberInputNoSpin.replace('w-full', '')}`} placeholder="-" step="0.001" value={formData.firstReading1} onChange={handleChange} />
                            <input type="number" id="firstReading2" name="firstReading2" className={`w-1/3 ${numberInputNoSpin.replace('w-full', '')}`} placeholder="-" step="0.001" value={formData.firstReading2} onChange={handleChange} />
                            <input type="number" id="firstReading3" name="firstReading3" className={`w-1/3 ${numberInputNoSpin.replace('w-full', '')}`} placeholder="-" step="0.001" value={formData.firstReading3} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 w-full sm:w-1/3 mb-2 sm:mb-0 text-left">Petrol Second Reading</h2>
                        <div className="flex flex-row space-x-2 w-full sm:w-2/3 justify-end">
                            <input type="number" id="secondReading1" name="secondReading1" className={`w-1/3 ${numberInputNoSpin.replace('w-full', '')}`} placeholder="-" step="0.001" value={formData.secondReading1} onChange={handleChange} />
                            <input type="number" id="secondReading2" name="secondReading2" className={`w-1/3 ${numberInputNoSpin.replace('w-full', '')}`} placeholder="-" step="0.001" value={formData.secondReading2} onChange={handleChange} />
                            <input type="number" id="secondReading3" name="secondReading3" className={`w-1/3 ${numberInputNoSpin.replace('w-full', '')}`} placeholder="-" step="0.001" value={formData.secondReading3} onChange={handleChange} />
                        </div>
                    </div>

                    <hr className="my-8 border-t border-gray-300" />

                    {/* Diesel Readings Section */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 w-full sm:w-1/3 mb-2 sm:mb-0 text-left">Diesel First Reading</h2>
                        <div className="flex flex-row space-x-2 w-full sm:w-2/3 justify-end">
                            <input type="number" id="dieselFirstReading1" name="dieselFirstReading1" className={`w-1/3 ${numberInputNoSpin.replace('w-full', '')}`} placeholder="-" step="0.001" value={formData.dieselFirstReading1} onChange={handleChange} />
                            <input type="number" id="dieselFirstReading2" name="dieselFirstReading2" className={`w-1/3 ${numberInputNoSpin.replace('w-full', '')}`} placeholder="-" step="0.001" value={formData.dieselFirstReading2} onChange={handleChange} />
                            <input type="number" id="dieselFirstReading3" name="dieselFirstReading3" className={`w-1/3 ${numberInputNoSpin.replace('w-full', '')}`} placeholder="-" step="0.001" value={formData.dieselFirstReading3} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 w-full sm:w-1/3 mb-2 sm:mb-0 text-left">Diesel Second Reading</h2>
                        <div className="flex flex-row space-x-2 w-full sm:w-2/3 justify-end">
                            <input type="number" id="dieselSecondReading1" name="dieselSecondReading1" className={`w-1/3 ${numberInputNoSpin.replace('w-full', '')}`} placeholder="-" step="0.001" value={formData.dieselSecondReading1} onChange={handleChange} />
                            <input type="number" id="dieselSecondReading2" name="dieselSecondReading2" className={`w-1/3 ${numberInputNoSpin.replace('w-full', '')}`} placeholder="-" step="0.001" value={formData.dieselSecondReading2} onChange={handleChange} />
                            <input type="number" id="dieselSecondReading3" name="dieselSecondReading3" className={`w-1/3 ${numberInputNoSpin.replace('w-full', '')}`} placeholder="-" step="0.001" value={formData.dieselSecondReading3} onChange={handleChange} />
                        </div>
                    </div>

                    <hr className="my-8 border-t border-gray-300" />

                    {/* Test Quantity */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label htmlFor="petrolTestQuantity" className="block text-lg font-semibold text-gray-700 mb-2 text-center">Petrol Test Quantity (Liters)</label>
                            <input type="number" id="petrolTestQuantity" name="petrolTestQuantity"
                                className={numberInputNoSpin}
                                placeholder="Enter liters tested" step="0.001"
                                value={formData.petrolTestQuantity} onChange={handleChange} />
                        </div>
                        <div>
                            <label htmlFor="dieselTestQuantity" className="block text-lg font-semibold text-gray-700 mb-2 text-center">Diesel Test Quantity (Liters)</label>
                            <input type="number" id="dieselTestQuantity" name="dieselTestQuantity"
                                className={numberInputNoSpin}
                                placeholder="Enter liters tested" step="0.001"
                                value={formData.dieselTestQuantity} onChange={handleChange} />
                        </div>
                    </div>

                    <hr className="my-8 border-t border-gray-300" />

                    {/* Battery/Acid Water */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div>
                            <label htmlFor="batteryWater30" className="block text-lg font-semibold text-gray-700 mb-2 text-center">Battery Water 30L</label>
                            <input type="number" id="batteryWater30" name="batteryWater30"
                                className={numberInputNoSpin}
                                placeholder="0" min="0" step="0.001"
                                value={formData.batteryWater30} onChange={handleChange} />
                        </div>
                        <div>
                            <label htmlFor="batteryWater60" className="block text-lg font-semibold text-gray-700 mb-2 text-center">Battery Water 60L</label>
                            <input type="number" id="batteryWater60" name="batteryWater60"
                                className={numberInputNoSpin}
                                placeholder="0" min="0" step="0.001"
                                value={formData.batteryWater60} onChange={handleChange} />
                        </div>
                        <div>
                            <label htmlFor="batteryWater150" className="block text-lg font-semibold text-gray-700 mb-2 text-center">Battery Water 150L</label>
                            <input type="number" id="batteryWater150" name="batteryWater150"
                                className={numberInputNoSpin}
                                placeholder="0" min="0" step="0.001"
                                value={formData.batteryWater150} onChange={handleChange} />
                        </div>
                        <div>
                            <label htmlFor="acidWater" className="block text-lg font-semibold text-gray-700 mb-2 text-center">Acid Water</label>
                            <input type="number" id="acidWater" name="acidWater"
                                className={numberInputNoSpin}
                                placeholder="Enter amount" step="0.001"
                                value={formData.acidWater} onChange={handleChange} />
                        </div>
                    </div>

                    <hr className="my-8 border-t border-gray-300" />

                    {/* Packed Oil Entries */}
                    <div className="mb-6">
                        <h2 className="block text-lg sm:text-xl font-semibold text-gray-700 mb-4 text-center">Packed Oil Entries</h2>
                        <div id="packedOilEntriesContainer" className="space-y-3">
                            {packedOilEntries.map((entry, index) => (
                                <DynamicEntryRow
                                    key={index}
                                    index={index}
                                    type="packedOil"
                                    entry={entry}
                                    onUpdate={(i, e) => handleDynamicEntryUpdate('packedOil', i, e)}
                                    onRemove={(i) => handleDynamicEntryRemove('packedOil', i)}
                                />
                            ))}
                        </div>
                        <div className="mt-4 flex space-x-2">
                            <input type="text" id="newPackedOilName" className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm" placeholder="Oil Name"
                                value={newPackedOil.name} onChange={(e) => handleDynamicChange('packedOil', e)} />
                            <input type="number" id="newPackedOilAmount" className={`${numberInputNoSpin.replace('w-full', 'w-1/2')}`} placeholder="Amount" step="0.001"
                                value={newPackedOil.amount} onChange={(e) => handleDynamicChange('packedOil', e)} />
                            <button type="button" onClick={() => addDynamicEntry('packedOil')} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Add</button>
                        </div>
                    </div>

                    <hr className="my-8 border-t border-gray-300" />

                    {/* Credit/Debit Entries */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div className="col-span-1">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 text-center">Credit Entries</h2>
                            <div id="creditEntriesContainer" className="space-y-3">
                                {creditEntries.map((entry, index) => (
                                    <DynamicEntryRow
                                        key={index}
                                        index={index}
                                        type="credit"
                                        entry={entry}
                                        onUpdate={(i, e) => handleDynamicEntryUpdate('credit', i, e)}
                                        onRemove={(i) => handleDynamicEntryRemove('credit', i)}
                                    />
                                ))}
                            </div>
                            <div className="mt-4 flex space-x-2">
                                <input type="text" id="newCreditName" className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm" placeholder="Credit Name"
                                    value={newCredit.name} onChange={(e) => handleDynamicChange('credit', e)} />
                                <input type="number" id="newCreditAmount" className={`${numberInputNoSpin.replace('w-full', 'w-1/2')}`} placeholder="Amount" step="0.001"
                                    value={newCredit.amount} onChange={(e) => handleDynamicChange('credit', e)} />
                                <button type="button" onClick={() => addDynamicEntry('credit')} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Add</button>
                            </div>
                        </div>

                        <div className="col-span-1">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 text-center">Debit Entries</h2>
                            <div id="debitEntriesContainer" className="space-y-3">
                                {debitEntries.map((entry, index) => (
                                    <DynamicEntryRow
                                        key={index}
                                        index={index}
                                        type="debit"
                                        entry={entry}
                                        onUpdate={(i, e) => handleDynamicEntryUpdate('debit', i, e)}
                                        onRemove={(i) => handleDynamicEntryRemove('debit', i)}
                                    />
                                ))}
                            </div>
                            <div className="mt-4 flex space-x-2">
                                <input type="text" id="newDebitName" className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm" placeholder="Debit Name"
                                    value={newDebit.name} onChange={(e) => handleDynamicChange('debit', e)} />
                                <input type="number" id="newDebitAmount" className={`${numberInputNoSpin.replace('w-full', 'w-1/2')}`} placeholder="Amount" step="0.001"
                                    value={newDebit.amount} onChange={(e) => handleDynamicChange('debit', e)} />
                                <button type="button" onClick={() => addDynamicEntry('debit')} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Add</button>
                            </div>
                        </div>
                    </div>

                    <hr className="my-8 border-t border-gray-300" />

                    {/* Denomination Calculator */}
                    <div className="grid grid-cols-1 mt-8">
                        <div className="col-span-1">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 text-center">Denomination Calculator</h2>
                            <div className="space-y-3">
                                {['500', '200', '100', '50', '20', '10', '5'].map(note => (
                                    <div className="flex items-center" key={note}>
                                        <label htmlFor={`note${note}`} className="w-24 text-right pr-4 text-gray-700">{note} x</label>
                                        <input type="number" id={`note${note}`} name={`note${note}`}
                                            className={`${numberInputNoSpin.replace('p-3', 'p-2')}`}
                                            placeholder="0" min="0"
                                            value={formData[`note${note}`]} onChange={handleChange} />
                                    </div>
                                ))}
                                <div className="flex items-center">
                                    <label htmlFor="coins" className="w-24 text-right pr-4 text-gray-700">Coins</label>
                                    <input type="number" id="coins" name="coins"
                                        className={`${numberInputNoSpin.replace('p-3', 'p-2')}`}
                                        placeholder="0" step="0.01"
                                        value={formData.coins} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="my-8 border-t border-gray-300" />

                    {/* Action Buttons */}
                    <div className="flex justify-center space-x-4 mt-8">
                        <button type="submit"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Save Changes
                        </button>
                        <button type="button" onClick={cancelEdit}
                            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditReadingEntry;