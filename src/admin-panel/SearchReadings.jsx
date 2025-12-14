import React, { useState, useEffect, useCallback } from 'react';

// --- Configuration and Utilities ---
// Access the environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const getApiUrl = (path) => `${API_BASE_URL}${path}`;

const formatDate = (date) => date.toISOString().split('T')[0];
const today = new Date();
const defaultDate = formatDate(today); // Default to today's date

function SearchReadings() {
    // State for form inputs
    const [staffId, setStaffId] = useState('all');
    // MODIFIED: Use a single searchDate instead of a date range
    const [searchDate, setSearchDate] = useState(defaultDate); 

    // State for fetched data
    const [staffList, setStaffList] = useState([]);
    const [readings, setReadings] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- Action Handlers (Matching admin.html's functionality) ---

    const handleView = (readingId) => {
        // MATCH: admin.html links to view.html
        window.location.href = `view.html?id=${readingId}`;
        console.log(`Viewing Reading ID: ${readingId}`);
    };

    const handleEdit = (readingId) => {
        // MATCH: admin.html links to edit.html
        window.location.href = `edit.html?id=${readingId}`;
        console.log(`Editing Reading ID: ${readingId}`);
    };

    const handleDelete = async (readingId) => {
        // MATCH: admin.html uses confirm()
        if (!window.confirm('Are you sure you want to delete this entry?')) {
            return;
        }

        try {
            const url = getApiUrl(`/api/readings/${readingId}`);
            const response = await fetch(url, { method: 'DELETE' });

            if (response.ok) {
                // MATCH: admin.html uses alert() for success
                alert('Entry deleted successfully!');
                // Remove the deleted reading from the local state and refresh
                setReadings(prevReadings => prevReadings.filter(r => r._id !== readingId));
            } else {
                const errorData = await response.json();
                // MATCH: admin.html uses alert() for failure
                alert(`Failed to delete entry. Status: ${response.status}. Message: ${errorData.message || response.statusText}`);
                console.error('Delete error:', errorData);
            }
        } catch (err) {
            console.error('Error deleting entry:', err);
            // MATCH: admin.html uses alert() for network error
            alert('An error occurred while deleting the entry.');
        }
    };


    // --- Fetching Logic ---

    const populateStaffDropdown = useCallback(async () => {
        try {
            setError(null);
            const response = await fetch(getApiUrl('/api/staff')); 
            if (!response.ok) throw new Error('Failed to fetch staff data');
            const data = await response.json();
            setStaffList(data);
        } catch (err) {
            console.error('Error fetching staff list:', err);
            setError('Could not load staff list. Check /api/staff endpoint.');
        }
    }, []);

    const fetchReadings = useCallback(async () => {
        setLoading(true);
        setError(null);
        setReadings([]); 

        try {
            const params = new URLSearchParams();
            
            // MATCH: Only include searchDate if it is set
            if (searchDate) {
                params.append('searchDate', searchDate); 
            }
            
            // MATCH: Only include staffId if it is not 'all'
            if (staffId !== 'all' && staffId) {
                params.append('searchId', staffId); // admin.html uses 'searchId' query param
            }

            // MATCH: Use the /api/readings endpoint for search
            const url = getApiUrl(`/api/readings?${params.toString()}`);
            const response = await fetch(url);

            if (!response.ok) throw new Error(`Failed to fetch readings. Status: ${response.status}`);

            const data = await response.json();
            setReadings(data); 

        } catch (err) {
            console.error('Error fetching readings:', err);
            setError(`Error fetching readings: ${err.message}. Ensure /api/readings is defined and working.`);
        } finally {
            setLoading(false);
        }
    }, [staffId, searchDate]); // Dependency is now searchDate, not fromDate/toDate

    useEffect(() => {
        populateStaffDropdown();
        fetchReadings();
    }, [populateStaffDropdown, fetchReadings]);

    const handleFilterClick = (event) => {
        event.preventDefault();
        fetchReadings();
    };
    
    // Helper function to get the staff name from the ID
    const getStaffName = (id) => {
        const staff = staffList.find(s => String(s.staffId) === String(id));
        return staff ? staff.name : 'N/A';
    }
    
    // --- JSX Render (MATCHING admin.html ALIGNMENT) ---

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Search Readings</h2>
            
            {/* Filter Controls */}
            <div className="flex flex-wrap gap-4 mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50 items-end">
                
                {/* MATCH: Search by Date (Single Input) */}
                <div className="flex flex-col w-full sm:w-auto flex-grow">
                    <label htmlFor="searchDate" className="font-medium text-gray-600 mb-1">Search by Date</label>
                    <input
                        type="date"
                        id="searchDate"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm text-sm"
                    />
                </div>

                {/* Staff Select */}
                <div className="flex flex-col w-full sm:w-auto flex-grow">
                    <label htmlFor="staffSelect" className="font-medium text-gray-600 mb-1">Search by Staff ID</label>
                    <select
                        id="staffSelect"
                        value={staffId}
                        onChange={(e) => setStaffId(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm text-sm"
                    >
                        <option value="all">All Staff</option>
                        {/* MATCH: admin.html displays name and ID in dropdown, though the value is just the ID */}
                        {staffList.map(staff => (
                            <option key={staff.staffId} value={staff.staffId}>
                                {`${staff.name} (${staff.staffId})`}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Filter Button */}
                <button 
                    className="p-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150 font-bold w-full sm:w-auto flex-grow" // Use blue button color from admin.html's search button
                    onClick={handleFilterClick} 
                    disabled={loading}
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}

            {/* Readings Results Table (MATCHING admin.html ALIGNMENT) */}
            <div className="readings-results mt-8 overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
                
                {(readings.length === 0 && !loading && !error) ? (
                    <div className="text-center p-8 text-gray-500">
                        {loading ? 'Searching...' : 'No data found.'}
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                {/* MATCH: Only Date, Staff Name, and Actions */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Name</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {readings.map((reading) => (
                                <tr key={reading._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reading.currentDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{getStaffName(reading.selectedId)}</td>
                                    
                                    {/* Actions Column (MATCHING admin.html ALIGNMENT) */}
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex space-x-2 justify-center">
                                            <a 
                                                href={`view?id=${reading._id}`}
                                                className="font-medium text-blue-600 hover:underline mr-3"
                                                title="View Details"
                                            >
                                                View
                                            </a>
                                            <a
                                                href={`edit?id=${reading._id}`}
                                                className="font-medium text-yellow-500 hover:underline mr-3"
                                                title="Edit Reading"
                                            >
                                                Edit
                                            </a>
                                            <button
                                                onClick={() => handleDelete(reading._id)}
                                                className="font-medium text-red-600 hover:underline"
                                                title="Delete Reading"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default SearchReadings;