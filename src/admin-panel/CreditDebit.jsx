import React, { useState, useEffect, useCallback } from 'react';

// Configuration and Utilities
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const getApiUrl = (path) => `${API_BASE_URL}${path}`;

const formatDate = (date) => date.toISOString().split('T')[0];
const today = new Date();
const sevenDaysAgo = new Date(today);
sevenDaysAgo.setDate(today.getDate() - 7);
const defaultFromDate = formatDate(sevenDaysAgo);
const defaultToDate = formatDate(today);


function CreditDebit() {
    // staffId defaults to 'all' to represent "All Staff"
    const [staffId, setStaffId] = useState('all'); 
    const [fromDate, setFromDate] = useState(defaultFromDate);
    const [toDate, setToDate] = useState(defaultToDate);
    const [staffList, setStaffList] = useState([]);
    const [transactions, setTransactions] = useState([]); 
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Function to fetch staff data for the dropdown
    const populateStaffDropdown = useCallback(async () => {
        try {
            const response = await fetch(getApiUrl('/api/staff')); // Using '/api/staff' based on the HTML
            if (!response.ok) {
                throw new Error('Failed to fetch staff data');
            }
            const data = await response.json();
            setStaffList(data);
        } catch (err) {
            console.error('Error fetching staff list:', err);
            setError('Could not load staff list.');
        }
    }, []);

    // Function to fetch transactions and calculate summary
    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);
        setTransactions([]); 
        setSummary(null);

        try {
            // 💥 START OF FIX: Conditionally add staffId to parameters 💥
            const params = new URLSearchParams({
                fromDate: fromDate,
                toDate: toDate,
            });

            // If staffId is 'all', we omit the parameter to fetch all staff data
            if (staffId !== 'all') {
                params.append('staffId', staffId);
            }
            // 💥 END OF FIX 💥

            // Adjusting URL to match your backend route: /api/transactions/creditDebit
            const url = getApiUrl(`/api/transactions/creditDebit?${params.toString()}`);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Failed to fetch transactions. Status: ${response.status}`);
            }

            // Assuming API returns an object of transactions grouped by date
            const data = await response.json();
            
            let totalCredit = 0;
            let totalDebit = 0;

            // Process and flatten data for display, and calculate totals
            const fetchedTransactions = Object.entries(data).map(([date, dayData]) => {
                const credits = (dayData && dayData.credits) || [];
                const debits = (dayData && dayData.debits) || [];

                credits.forEach(credit => totalCredit += credit.amount);
                debits.forEach(debit => totalDebit += debit.amount);

                return { date, credits, debits };
            }).sort((a, b) => new Date(b.date) - new Date(a.date));

            setTransactions(fetchedTransactions);
            setSummary({ totalCredit, totalDebit, netAmount: totalCredit - totalDebit });

        } catch (err) {
            console.error('Error fetching transactions:', err);
            setError(`Error fetching transactions: ${err.message}. Check the Network tab.`);
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
    
    // JSX remains the same as previous successful response for the body content
    return (
        <div className="p-4">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Transaction Filters</h2>
            
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
                            <option key={staff.staffId} value={staff.staffId}>
                                {staff.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Date Inputs and Filter Button... (rest of the filter JSX) */}
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
    );
}

export default CreditDebit;