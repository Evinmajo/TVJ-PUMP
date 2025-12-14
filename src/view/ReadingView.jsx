import React, { useState, useEffect, useMemo } from 'react';

// Get the API base URL from the environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Define the initial state structure
const initialReadingData = {
    selectedId: '-',
    currentDate: '',
    petrol: 0,
    diesel: 0,
    oil: 0,
    oilFirstReading: 0, oilSecondReading: 0,
    oilFirstReading2: 0, oilSecondReading2: 0,
    oilFirstReading3: 0, oilSecondReading3: 0,
    firstReading1: 0, secondReading1: 0,
    firstReading2: 0, secondReading2: 0,
    firstReading3: 0, secondReading3: 0,
    dieselFirstReading1: 0, dieselSecondReading1: 0,
    dieselFirstReading2: 0, dieselSecondReading2: 0,
    dieselFirstReading3: 0, dieselSecondReading3: 0,
    petrolTestQuantity: 0,
    dieselTestQuantity: 0,
    acidWater: 0,
    note500: 0, note200: 0, note100: 0, note50: 0, note20: 0, note10: 0, note5: 0, coins: 0,
    batteryWater30: 0,
    batteryWater60: 0,
    batteryWater150: 0,
    packedOilEntries: [],
    creditEntries: [],
    debitEntries: [],
};

// Helper to safely format a number to 2 decimal places or return '-' if not a number
const formatOutput = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? '-' : num.toFixed(2);
};

// Component for a standard single input field (used for prices, date, ID, test quantities)
const ReadOnlyInput = ({ id, label, value, type = 'number', placeholder = '-', className = '' }) => (
    <div>
        <label htmlFor={id} className="block text-lg font-semibold text-gray-700 mb-2 text-center">{label}</label>
        <input
            // Use 'text' for calculated outputs to avoid number input issues with string values
            type={type === 'number' ? 'number' : 'text'}
            id={id}
            value={value}
            className={`w-full p-3 border border-gray-300 rounded-lg shadow-sm text-gray-800 text-center ${className}`}
            placeholder={placeholder}
            readOnly
            tabIndex="-1"
        />
    </div>
);

// Component to render dynamic lists (Packed Oil, Credit, Debit)
const DynamicEntryList = ({ title, entries, totalAmount, totalLabel }) => (
    <div className="col-span-1">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 text-center">{title}</h2>
        <div className="space-y-3">
            {entries.map((entry, index) => (
                <div key={`${title}-${index}`} className="flex items-center gap-x-2 mb-3">
                    <input
                        type="text"
                        value={entry.name || ''}
                        className="w-1/2 p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 text-center dynamic-entry-name"
                        readOnly
                        tabIndex="-1"
                    />
                    <input
                        // These amounts are input, but are readonly here, keeping 'number' for fidelity
                        type="number"
                        value={entry.amount || 0}
                        className="w-1/2 p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 text-center dynamic-entry-amount"
                        readOnly
                        tabIndex="-1"
                    />
                </div>
            ))}
        </div>
        <div className="mt-4">
            <label htmlFor={`total${totalLabel}Amount`} className="block text-lg font-semibold text-gray-700 mb-2 text-center">{`Total ${totalLabel}`}</label>
            <input
                type="text" // Always 'text' for final total output
                id={`total${totalLabel}Amount`}
                value={formatOutput(totalAmount)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 text-center font-bold"
                readOnly
                tabIndex="-1"
            />
        </div>
    </div>
);

// CSS extracted from view.html to remove spin buttons and set font
const globalStyles = `
        /* Custom styles for the Inter font and overall body */
        body {
            font-family: 'Inter', sans-serif;
        }
        /* Ensure input type="number" does not show spin buttons */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        input[type="number"] {
            -moz-appearance: textfield;
        }
    `;

const ReadingView = () => {
    const [data, setData] = useState(initialReadingData);
    const [entryId, setEntryId] = useState(null);

    // --- Data Fetching Effect ---
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        setEntryId(id);

        if (!id) {
            console.log('No entry ID provided in the URL.');
            return;
        }

        const loadData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/reading/${id}`);
                if (response.ok) {
                    const fetchedData = await response.json();
                    if (fetchedData) {
                        const parsedData = Object.fromEntries(
                            Object.entries(fetchedData).map(([key, value]) => {
                                // Convert numeric strings to numbers for calculations
                                if (typeof initialReadingData[key] === 'number') {
                                    return [key, parseFloat(value) || 0];
                                }
                                return [key, value];
                            })
                        );

                        setData(prevData => ({
                            ...initialReadingData,
                            ...prevData,
                            ...parsedData,
                        }));
                    }
                } else {
                    console.error('Server error:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        loadData();
    }, []);

    // --- Core Calculation Logic (useMemo for memoization) ---

    // Oil Difference
    const oilDiff1 = useMemo(() => data.oilFirstReading - data.oilSecondReading, [data.oilFirstReading, data.oilSecondReading]);
    const oilDiff2 = useMemo(() => data.oilFirstReading2 - data.oilSecondReading2, [data.oilFirstReading2, data.oilSecondReading2]);
    const oilDiff3 = useMemo(() => data.oilFirstReading3 - data.oilSecondReading3, [data.oilFirstReading3, data.oilSecondReading3]);
    const totalOilDifference = useMemo(() => oilDiff1 + oilDiff2 + oilDiff3, [oilDiff1, oilDiff2, oilDiff3]);
    const oilRequiredMoney = useMemo(() => totalOilDifference * data.oil, [totalOilDifference, data.oil]);

    // Petrol Difference
    const petrolDiff1 = useMemo(() => data.secondReading1 - data.firstReading1, [data.secondReading1, data.firstReading1]);
    const petrolDiff2 = useMemo(() => data.secondReading2 - data.firstReading2, [data.secondReading2, data.firstReading2]);
    const petrolDiff3 = useMemo(() => data.secondReading3 - data.firstReading3, [data.secondReading3, data.firstReading3]);
    const totalPetrolDifference = useMemo(() => petrolDiff1 + petrolDiff2 + petrolDiff3, [petrolDiff1, petrolDiff2, petrolDiff3]);
    const requiredMoneyPetrol = useMemo(() => totalPetrolDifference * data.petrol, [totalPetrolDifference, data.petrol]);

    // Diesel Difference
    const dieselDiff1 = useMemo(() => data.dieselSecondReading1 - data.dieselFirstReading1, [data.dieselSecondReading1, data.dieselFirstReading1]);
    const dieselDiff2 = useMemo(() => data.dieselSecondReading2 - data.dieselFirstReading2, [data.dieselSecondReading2, data.dieselFirstReading2]);
    const dieselDiff3 = useMemo(() => data.dieselSecondReading3 - data.dieselFirstReading3, [data.dieselSecondReading3, data.dieselFirstReading3]);
    const totalDieselDifference = useMemo(() => dieselDiff1 + dieselDiff2 + dieselDiff3, [dieselDiff1, dieselDiff2, dieselDiff3]);
    const requiredMoneyDiesel = useMemo(() => totalDieselDifference * data.diesel, [totalDieselDifference, data.diesel]);

    // Test Quantities Money
    const petrolTestQuantityMoney = useMemo(() => data.petrolTestQuantity * data.petrol, [data.petrolTestQuantity, data.petrol]);
    const dieselTestQuantityMoney = useMemo(() => data.dieselTestQuantity * data.diesel, [data.dieselTestQuantity, data.diesel]);

    // Total Credit and Debit
    const totalCreditAmount = useMemo(() =>
        data.creditEntries.reduce((total, entry) => total + (parseFloat(entry.amount) || 0), 0),
        [data.creditEntries]
    );
    const totalDebitAmount = useMemo(() =>
        data.debitEntries.reduce((total, entry) => total + (parseFloat(entry.amount) || 0), 0),
        [data.debitEntries]
    );

    // Total Battery Water
    const totalBatteryWaterAmount = useMemo(() =>
        (30 * (data.batteryWater30 || 0)) +
        (60 * (data.batteryWater60 || 0)) +
        (150 * (data.batteryWater150 || 0)),
        [data.batteryWater30, data.batteryWater60, data.batteryWater150]
    );

    // Total Packed Oil
    const totalPackedOilAmount = useMemo(() =>
        data.packedOilEntries.reduce((total, entry) => total + (parseFloat(entry.amount) || 0), 0),
        [data.packedOilEntries]
    );

    // Total Denomination Amount
    const totalDenominationAmount = useMemo(() =>
        (data.note500 * 500) + (data.note200 * 200) +
        (data.note100 * 100) + (data.note50 * 50) + (data.note20 * 20) +
        (data.note10 * 10) + (data.note5 * 5) + (data.coins || 0),
        [data.note500, data.note200, data.note100, data.note50, data.note20, data.note10, data.note5, data.coins]
    );

    // Final Result (Required Money)
    const finalResult = useMemo(() => {
        const positives = oilRequiredMoney + requiredMoneyPetrol + requiredMoneyDiesel + totalDebitAmount + totalBatteryWaterAmount + data.acidWater + totalPackedOilAmount;
        const negatives = petrolTestQuantityMoney + dieselTestQuantityMoney + totalCreditAmount;
        return positives - negatives;
    }, [oilRequiredMoney, requiredMoneyPetrol, requiredMoneyDiesel, totalDebitAmount, totalBatteryWaterAmount, data.acidWater, totalPackedOilAmount, petrolTestQuantityMoney, dieselTestQuantityMoney, totalCreditAmount]);

    // Excess/Shot
    const excessShotResult = useMemo(() => totalDenominationAmount - finalResult, [totalDenominationAmount, finalResult]);

    const excessShotStatus = useMemo(() => {
        if (excessShotResult > 0) return { heading: 'Excess', className: 'bg-green-100 text-green-800' };
        if (excessShotResult < 0) return { heading: 'Shot', className: 'bg-red-100 text-red-800' };
        return { heading: 'Excess/Shot', className: 'bg-gray-100 text-gray-800' };
    }, [excessShotResult]);


    return (
        // Replicates body background, centering, and min-height from original HTML style block
        <div className="min-h-screen flex justify-center items-center p-4 antialiased" style={{ backgroundColor: '#2563eb' }}>

            {/* Injects the custom CSS for font and spin button removal */}
            <style dangerouslySetInnerHTML={{ __html: globalStyles }} />

            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-lg w-full max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto my-auto">
                <a href="/admin">Admin Panel</a>

                {/* ID and Date Section */}
                <div className="mb-8">
                    <ReadOnlyInput id="currentDate" label="Date" value={data.currentDate} type="text" className="bg-gray-100 font-bold" />
                </div>
                <div className="mb-8">
                    <ReadOnlyInput id="displayId" label="ID Section" value={data.selectedId} type="text" className="bg-gray-100 font-bold" />
                </div>

                {/* Fuel Prices */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <ReadOnlyInput id="petrol" label="Petrol Price" value={data.petrol} placeholder="Enter petrol price" />
                    <ReadOnlyInput id="diesel" label="Diesel Price" value={data.diesel} placeholder="Enter diesel price" />
                    <ReadOnlyInput id="oil" label="Oil Price" value={data.oil} placeholder="Enter oil price" />
                </div>

                <hr className="my-8 border-t border-gray-300" />

                {/* --- Oil Readings and Difference --- */}
                
                {/* Oil First Reading Group */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-700 w-full sm:w-1/3 mb-2 sm:mb-0 text-left">Oil First Reading</h2>
                    <div className="flex flex-row space-x-2 w-full sm:w-2/3 justify-end">
                        <input type="number" id="oilFirstReading" value={data.oilFirstReading} readOnly placeholder="First Reading" className="w-1/3 p-3 border border-gray-300 rounded-lg shadow-sm text-gray-800 text-center" />
                        <input type="number" id="oilFirstReading2" value={data.oilFirstReading2} readOnly placeholder="First Reading" className="w-1/3 p-3 border border-gray-300 rounded-lg shadow-sm text-gray-800 text-center" />
                        <input type="number" id="oilFirstReading3" value={data.oilFirstReading3} readOnly placeholder="First Reading" className="w-1/3 p-3 border border-gray-300 rounded-lg shadow-sm text-gray-800 text-center" />
                    </div>
                </div>

                {/* Oil Second Reading Group */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-700 w-full sm:w-1/3 mb-2 sm:mb-0 text-left">Oil Second Reading</h2>
                    <div className="flex flex-row space-x-2 w-full sm:w-2/3 justify-end">
                        <input type="number" id="oilSecondReading" value={data.oilSecondReading} readOnly placeholder="Second Reading" className="w-1/3 p-3 border border-gray-300 rounded-lg shadow-sm text-gray-800 text-center" />
                        <input type="number" id="oilSecondReading2" value={data.oilSecondReading2} readOnly placeholder="Second Reading" className="w-1/3 p-3 border border-gray-300 rounded-lg shadow-sm text-gray-800 text-center" />
                        <input type="number" id="oilSecondReading3" value={data.oilSecondReading3} readOnly placeholder="Second Reading" className="w-1/3 p-3 border border-gray-300 rounded-lg shadow-sm text-gray-800 text-center" />
                    </div>
                </div>

                {/* Oil Difference Group (Calculated Outputs) */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-700 w-full sm:w-1/3 mb-2 sm:mb-0 text-left">Oil Difference</h2>
                    <div className="flex flex-row space-x-2 w-full sm:w-2/3 justify-end">
                        {/* Must be type="text" to display formatted output */}
                        <input type="text" id="oilReadingDifference" value={formatOutput(oilDiff1)} readOnly placeholder="-" className="w-1/3 p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 text-center font-bold" tabIndex="-1" />
                        <input type="text" id="oilReadingDifference2" value={formatOutput(oilDiff2)} readOnly placeholder="-" className="w-1/3 p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 text-center font-bold" tabIndex="-1" />
                        <input type="text" id="oilReadingDifference3" value={formatOutput(oilDiff3)} readOnly placeholder="-" className="w-1/3 p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 text-center font-bold" tabIndex="-1" />
                    </div>
                </div>

                {/* Required Money (Oil) */}
                <div className="grid grid-cols-1 mt-8">
                    <ReadOnlyInput id="oilRequiredMoney" label="Required Money (Oil)" value={formatOutput(oilRequiredMoney)} type="text" className="bg-blue-100 text-blue-800 font-bold text-lg" />
                </div>

                <hr className="my-8 border-t border-gray-300" />

                {/* --- Petrol Readings and Difference --- */}

                {/* Petrol First Reading Group */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-700 w-full sm:w-1/3 mb-2 sm:mb-0 text-left">Petrol First Reading</h2>
                    <div className="flex flex-row space-x-2 w-full sm:w-2/3 justify-end">
                        <input type="number" id="firstReading1" value={data.firstReading1} readOnly placeholder="First Reading" className="w-1/3 p-3 border border-gray-300 rounded-lg shadow-sm text-gray-800 text-center" />
                        <input type="number" id="firstReading2" value={data.firstReading2} readOnly placeholder="First Reading" className="w-1/3 p-3 border border-gray-300 rounded-lg shadow-sm text-gray-800 text-center" />
                        <input type="number" id="firstReading3" value={data.firstReading3} readOnly placeholder="First Reading" className="w-1/3 p-3 border border-gray-300 rounded-lg shadow-sm text-gray-800 text-center" />
                    </div>
                </div>

                {/* Petrol Second Reading Group */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-700 w-full sm:w-1/3 mb-2 sm:mb-0 text-left">Petrol Second Reading</h2>
                    <div className="flex flex-row space-x-2 w-full sm:w-2/3 justify-end">
                        <input type="number" id="secondReading1" value={data.secondReading1} readOnly placeholder="Second Reading" className="w-1/3 p-3 border border-gray-300 rounded-lg shadow-sm text-gray-800 text-center" />
                        <input type="number" id="secondReading2" value={data.secondReading2} readOnly placeholder="Second Reading" className="w-1/3 p-3 border border-gray-300 rounded-lg shadow-sm text-gray-800 text-center" />
                        <input type="number" id="secondReading3" value={data.secondReading3} readOnly placeholder="Second Reading" className="w-1/3 p-3 border border-gray-300 rounded-lg shadow-sm text-gray-800 text-center" />
                    </div>
                </div>

                {/* Petrol Difference Group (Calculated Outputs) */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-700 w-full sm:w-1/3 mb-2 sm:mb-0 text-left">Petrol Difference</h2>
                    <div className="flex flex-row space-x-2 w-full sm:w-2/3 justify-end">
                        <input type="text" id="petrolDifference1" value={formatOutput(petrolDiff1)} readOnly placeholder="-" className="w-1/3 p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 text-center font-bold" tabIndex="-1" />
                        <input type="text" id="petrolDifference2" value={formatOutput(petrolDiff2)} readOnly placeholder="-" className="w-1/3 p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 text-center font-bold" tabIndex="-1" />
                        <input type="text" id="petrolDifference3" value={formatOutput(petrolDiff3)} readOnly placeholder="-" className="w-1/3 p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 text-center font-bold" tabIndex="-1" />
                    </div>
                </div>

                {/* Required Money (Petrol) */}
                <div className="grid grid-cols-1 mt-8">
                    <ReadOnlyInput id="requiredMoneyPetrol" label="Required Money (Petrol)" value={formatOutput(requiredMoneyPetrol)} type="text" className="bg-green-100 text-green-800 font-bold text-lg" />
                </div>

                <hr className="my-8 border-t border-gray-300" />

                {/* --- Diesel Readings and Difference --- */}

                {/* Diesel First Reading Group */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-700 w-full sm:w-1/3 mb-2 sm:mb-0 text-left">Diesel First Reading</h2>
                    <div className="flex flex-row space-x-2 w-full sm:w-2/3 justify-end">
                        <input type="number" id="dieselFirstReading1" value={data.dieselFirstReading1} readOnly placeholder="First Reading" className="w-1/3 p-3 border border-gray-300 rounded-lg shadow-sm text-gray-800 text-center" />
                        <input type="number" id="dieselFirstReading2" value={data.dieselFirstReading2} readOnly placeholder="First Reading" className="w-1/3 p-3 border border-gray-300 rounded-lg shadow-sm text-gray-800 text-center" />
                        <input type="number" id="dieselFirstReading3" value={data.dieselFirstReading3} readOnly placeholder="First Reading" className="w-1/3 p-3 border border-gray-300 rounded-lg shadow-sm text-gray-800 text-center" />
                    </div>
                </div>

                {/* Diesel Second Reading Group */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-700 w-full sm:w-1/3 mb-2 sm:mb-0 text-left">Diesel Second Reading</h2>
                    <div className="flex flex-row space-x-2 w-full sm:w-2/3 justify-end">
                        <input type="number" id="dieselSecondReading1" value={data.dieselSecondReading1} readOnly placeholder="Second Reading" className="w-1/3 p-3 border border-gray-300 rounded-lg shadow-sm text-gray-800 text-center" />
                        <input type="number" id="dieselSecondReading2" value={data.dieselSecondReading2} readOnly placeholder="Second Reading" className="w-1/3 p-3 border border-gray-300 rounded-lg shadow-sm text-gray-800 text-center" />
                        <input type="number" id="dieselSecondReading3" value={data.dieselSecondReading3} readOnly placeholder="Second Reading" className="w-1/3 p-3 border border-gray-300 rounded-lg shadow-sm text-gray-800 text-center" />
                    </div>
                </div>

                {/* Diesel Difference Group (Calculated Outputs) */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-700 w-full sm:w-1/3 mb-2 sm:mb-0 text-left">Diesel Difference</h2>
                    <div className="flex flex-row space-x-2 w-full sm:w-2/3 justify-end">
                        <input type="text" id="dieselDifference1" value={formatOutput(dieselDiff1)} readOnly placeholder="-" className="w-1/3 p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 text-center font-bold" tabIndex="-1" />
                        <input type="text" id="dieselDifference2" value={formatOutput(dieselDiff2)} readOnly placeholder="-" className="w-1/3 p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 text-center font-bold" tabIndex="-1" />
                        <input type="text" id="dieselDifference3" value={formatOutput(dieselDiff3)} readOnly placeholder="-" className="w-1/3 p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 text-center font-bold" tabIndex="-1" />
                    </div>
                </div>

                {/* Required Money (Diesel) */}
                <div className="grid grid-cols-1 mt-8">
                    <ReadOnlyInput id="requiredMoneyDiesel" label="Required Money (Diesel)" value={formatOutput(requiredMoneyDiesel)} type="text" className="bg-blue-100 text-blue-800 font-bold text-lg" />
                </div>

                <hr className="my-8 border-t border-gray-300" />

                {/* Test Quantities */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    <ReadOnlyInput id="petrolTestQuantity" label="Petrol Test Quantity (Liters)" value={data.petrolTestQuantity} placeholder="Enter liters tested" />
                    <ReadOnlyInput id="dieselTestQuantity" label="Diesel Test Quantity (Liters)" value={data.dieselTestQuantity} placeholder="Enter liters tested" />
                    <ReadOnlyInput id="petrolTestQuantityMoney" label="Petrol Test Money" value={formatOutput(petrolTestQuantityMoney)} type="text" className="bg-purple-100 text-purple-800 font-bold text-lg" />
                    <ReadOnlyInput id="dieselTestQuantityMoney" label="Diesel Test Money" value={formatOutput(dieselTestQuantityMoney)} type="text" className="bg-purple-100 text-purple-800 font-bold text-lg" />
                </div>

                <hr className="my-8 border-t border-gray-300" />

                {/* Battery Water & Acid Water */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <ReadOnlyInput id="totalBatteryWaterAmount" label="Battery Water (Total)" value={formatOutput(totalBatteryWaterAmount)} type="text" className="bg-gray-100 font-bold" />
                    <ReadOnlyInput id="acidWater" label="Acid Water" value={data.acidWater} placeholder="Enter amount" />
                </div>

                <hr className="my-8 border-t border-gray-300" />

                {/* Packed Oil */}
                <div className="mb-6">
                    <h2 className="block text-lg sm:text-xl font-semibold text-gray-700 mb-4 text-center">Packed Oil</h2>
                    <div className="space-y-3">
                        {data.packedOilEntries.map((entry, index) => (
                            <div key={index} className="flex items-center gap-x-2 mb-3">
                                <input type="text" value={entry.name} readOnly className="w-1/2 p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 text-center packed-oil-name" tabIndex="-1" />
                                <input type="number" value={entry.amount} readOnly className="w-1/2 p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 text-center packed-oil-amount" tabIndex="-1" />
                            </div>
                        ))}
                    </div>
                    <div className="mt-4">
                        <ReadOnlyInput id="totalPackedOilAmount" label="Total Packed Oil" value={formatOutput(totalPackedOilAmount)} type="text" className="bg-gray-100 font-bold" />
                    </div>
                </div>

                <hr className="my-8 border-t border-gray-300" />

                {/* Credit and Debit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <DynamicEntryList
                        title="Credit"
                        entries={data.creditEntries}
                        totalAmount={totalCreditAmount}
                        totalLabel="Credit"
                    />
                    <DynamicEntryList
                        title="Debit"
                        entries={data.debitEntries}
                        totalAmount={totalDebitAmount}
                        totalLabel="Debit"
                    />
                </div>

                <hr className="my-8 border-t border-gray-300" />

                {/* Denomination Calculator */}
                <div className="grid grid-cols-1 mt-8">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 text-center">Denomination Calculator</h2>
                    <div className="space-y-3">
                        {[500, 200, 100, 50, 20, 10, 5].map(note => (
                            <div key={note} className="flex items-center">
                                <label htmlFor={`note${note}`} className="w-24 text-right pr-4 text-gray-700">{note} x</label>
                                <input type="number" id={`note${note}`} value={data[`note${note}`]} readOnly className="w-full p-2 border border-gray-300 rounded-lg shadow-sm text-gray-800 text-center" placeholder="0" />
                            </div>
                        ))}
                        <div className="flex items-center">
                            <label htmlFor="coins" className="w-24 text-right pr-4 text-gray-700">Coins</label>
                            <input type="number" id="coins" value={data.coins} readOnly className="w-full p-2 border border-gray-300 rounded-lg shadow-sm text-gray-800 text-center" placeholder="0" />
                        </div>
                    </div>
                </div>

                <hr className="my-8 border-t border-gray-300" />

                {/* Total Denomination Amount */}
                <div className="grid grid-cols-1 mt-8">
                    <ReadOnlyInput id="totalAmount" label="Total Denomination Amount" value={formatOutput(totalDenominationAmount)} type="text" className="bg-yellow-100 text-yellow-800 font-bold text-lg" />
                </div>

                {/* Final Result */}
                <div className="grid grid-cols-1 mt-8">
                    <ReadOnlyInput id="finalResult" label="Final Result" value={formatOutput(finalResult)} type="text" className="bg-green-100 text-green-800 font-bold text-lg" />
                </div>

                {/* Excess/Shot Result */}
                <div className="grid grid-cols-1 mt-8">
                    <label id="excessShotHeading" className="block text-lg font-semibold text-gray-700 mb-2 text-center">{excessShotStatus.heading}</label>
                    <input
                        type="text"
                        id="excessShotResult"
                        value={formatOutput(excessShotResult)}
                        className={`w-full p-3 border border-gray-300 rounded-lg ${excessShotStatus.className} text-center font-bold text-lg`}
                        readOnly
                        placeholder="-"
                        tabIndex="-1"
                    />
                </div>

                {/* Edit Button */}
                <div className="mt-8 text-center">
                    <a id="editButton" href={entryId ? `edit?id=${entryId}` : '#'}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Edit Entry
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ReadingView;