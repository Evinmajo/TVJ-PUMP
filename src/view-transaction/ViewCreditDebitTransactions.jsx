import React, { useState, useEffect, useCallback } from 'react';

/**
 * Utility function to get the API base URL from Vite's environment variables.
 * @param {string} path - The specific API endpoint path.
 * @returns {string} The full API URL.
 */
const getApiUrl = (path) => {
    // Uses VITE_API_BASE_URL from the .env file.
    // Falls back to a default if the variable is not defined for safety.
    const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    return `${BASE_URL}${path}`;
};

// Helper function to format date to YYYY-MM-DD for date inputs
const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

// Set default date range for initial state (today and 7 days ago)
const today = new Date();
const sevenDaysAgo = new Date(today);
sevenDaysAgo.setDate(today.getDate() - 7);

const defaultFromDate = formatDate(sevenDaysAgo);
const defaultToDate = formatDate(today);

function ViewCreditDebitTransactions() {
    // State for form inputs
    const [staffId, setStaffId] = useState('all');
    const [fromDate, setFromDate] = useState(defaultFromDate);
    const [toDate, setToDate] = useState(defaultToDate);

    // State for fetched data
    const [staffList, setStaffList] = useState([]);
    const [transactions, setTransactions] = useState([]); 
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Function to fetch staff data for the dropdown (memoized)
    const populateStaffDropdown = useCallback(async () => {
        try {
            const response = await fetch(getApiUrl('/staff'));
            if (!response.ok) {
                throw new Error('Failed to fetch staff data');
            }
            // Assuming API returns [{ id: 1, name: 'John Doe' }, ...]
            const data = await response.json();
            setStaffList(data);
        } catch (err) {
            console.error('Error fetching staff list:', err);
            setError('Could not load staff list.');
        }
    }, []);

    // Function to fetch transactions and calculate summary (memoized)
    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);
        setTransactions([]); 
        setSummary(null);

        try {
            const params = new URLSearchParams({
                staffId: staffId,
                fromDate: fromDate,
                toDate: toDate,
            });

            // Using the API base URL from the environment variable
            const url = getApiUrl(`/transactions?${params.toString()}`);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch transactions');
            }

            // Assuming API returns an object of transactions grouped by date
            const data = await response.json();
            
            let totalCredit = 0;
            let totalDebit = 0;

            // Process and flatten data for display, and calculate totals
            const fetchedTransactions = Object.entries(data).map(([date, dayData]) => {
                const credits = dayData.credits || [];
                const debits = dayData.debits || [];

                credits.forEach(credit => totalCredit += credit.amount);
                debits.forEach(debit => totalDebit += debit.amount);

                return { date, credits, debits };
            }).sort((a, b) => new Date(b.date) - new Date(a.date));

            setTransactions(fetchedTransactions);
            
            setSummary({ totalCredit, totalDebit, netAmount: totalCredit - totalDebit });

        } catch (err) {
            console.error('Error fetching transactions:', err);
            setError('Error fetching transactions. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [staffId, fromDate, toDate]);

    // Initial data load and data re-fetch when filters change (on component mount)
    useEffect(() => {
        populateStaffDropdown();
        fetchTransactions();
    }, [populateStaffDropdown, fetchTransactions]);

    const handleFilterClick = (event) => {
        event.preventDefault();
        fetchTransactions();
    };

    // Helper function to render an individual transaction item
    const renderTransactionItem = (item, type) => {
        const isCredit = type === 'Credit';
        const labelClasses = isCredit 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white';
        const amountDisplay = `₹${item.amount ? item.amount.toFixed(2) : '0.00'}`;

        return (
            <div key={`${type}-${item.name}-${item.amount}-${Math.random()}`} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0 flex-wrap">
                <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold min-w-[60px] text-center ${labelClasses}`}>
                        {type}
                    </span>
                    <span className="font-medium text-gray-500">Name:</span>
                    <span className="text-gray-800 font-medium">{item.name}</span>
                </div>
                <span className="text-lg font-bold text-gray-900 mt-2 sm:mt-0">
                    {amountDisplay}
                </span>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen p-4 flex flex-col items-center">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl max-w-4xl w-full my-8">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6 pb-3 border-b-4 border-blue-600">
                    View Credit/Debit Transactions
                </h1>

                {/* Filter Controls */}
                <div className="flex flex-wrap gap-4 mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50 items-end">
                    
                    {/* Select Staff */}
                    <div className="flex flex-col w-full sm:w-auto flex-grow">
                        <label htmlFor="staffSelect" className="font-medium text-gray-600 mb-1">Select Staff</label>
                        <select
                            id="staffSelect"
                            value={staffId}
                            onChange={(e) => setStaffId(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                            <option value="all">All Staff</option>
                            {staffList.map(staff => (
                                <option key={staff.id} value={staff.id}>
                                    {staff.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* From Date */}
                    <div className="flex flex-col w-full sm:w-auto flex-grow">
                        <label htmlFor="fromDate" className="font-medium text-gray-600 mb-1">From Date</label>
                        <input
                            type="date"
                            id="fromDate"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                    </div>

                    {/* To Date */}
                    <div className="flex flex-col w-full sm:w-auto flex-grow">
                        <label htmlFor="toDate" className="font-medium text-gray-600 mb-1">To Date</label>
                        <input
                            type="date"
                            id="toDate"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                    </div>

                    {/* Filter Button */}
                    <button 
                        className="p-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 font-semibold w-full sm:w-auto"
                        onClick={handleFilterClick} 
                        disabled={loading}
                    >
                        {loading ? 'Fetching...' : 'Filter Transactions'}
                    </button>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                )}

                {/* Transactions List */}
                <div className="transactions-display mt-6">
                    {transactions.length === 0 && !loading && !error && (
                        <div className="text-center p-8 text-gray-500 border border-gray-200 rounded-lg bg-white">
                            No transactions found for the selected period.
                        </div>
                    )}

                    {transactions.map((dayData) => (
                        <div key={dayData.date} className="border border-gray-300 rounded-lg mb-4 p-4 shadow-sm">
                            <div className="text-lg font-bold text-blue-600 mb-2 pb-1 border-b border-dashed border-gray-300">
                                {dayData.date}
                            </div>
                            
                            {/* Render Credits */}
                            {dayData.credits.map(credit =>
                                renderTransactionItem(credit, 'Credit')
                            )}

                            {/* Render Debits */}
                            {dayData.debits.map(debit =>
                                renderTransactionItem(debit, 'Debit')
                            )}
                        </div>
                    ))}
                </div>

                {/* Transaction Summary */}
                {summary && (
                    <div className="text-center mt-6 p-4 border-2 border-green-600 rounded-lg bg-green-50 font-bold text-green-700 shadow-md">
                        <p>
                            Total Credits: <span className="text-green-800">₹{summary.totalCredit.toFixed(2)}</span> | 
                            Total Debits: <span className="text-red-800">₹{summary.totalDebit.toFixed(2)}</span>
                        </p>
                        <p className="mt-2 text-xl">
                            Net Amount: <span className="text-green-900">₹{summary.netAmount.toFixed(2)}</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ViewCreditDebitTransactions;