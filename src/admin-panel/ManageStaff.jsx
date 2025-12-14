import React, { useState, useEffect, useCallback } from 'react';

// --- Configuration and Utilities ---
// Access the environment variable (Use the same convention as your other files)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const getApiUrl = (path) => `${API_BASE_URL}${path}`;

const STAFF_API_ENDPOINT = '/api/staff'; 

function ManageStaff() {
    // State for Staff List
    const [staffList, setStaffList] = useState([]);
    
    // State for New Staff Form
    const [newStaff, setNewStaff] = useState({ staffId: '', name: '' });
    
    // State for process control and messages
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // --- Message Management (As per admin.html's alert/console behavior) ---
    const showMessage = (setter, text) => {
        setter(text);
        setTimeout(() => setter(null), 5000); // Auto-hide after 5 seconds
    };

    // --- Fetching and Listing Staff ---

    const loadStaffList = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(getApiUrl(STAFF_API_ENDPOINT));
            if (!response.ok) throw new Error(`Failed to fetch staff list. Status: ${response.status}`);
            const data = await response.json();
            setStaffList(data);
        } catch (err) {
            console.error('Error fetching staff list:', err);
            showMessage(setError, 'Could not load staff list. Check /api/staff endpoint.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStaffList();
    }, [loadStaffList]);

    // --- Handlers ---

    const handleNewStaffChange = (e) => {
        const { name, value } = e.target;
        setNewStaff(prev => ({ ...prev, [name]: value }));
    };

    const addStaff = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!newStaff.staffId || !newStaff.name) {
            showMessage(setError, 'Please enter both Staff ID and Staff Name.');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(getApiUrl(STAFF_API_ENDPOINT), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newStaff),
            });

            if (response.ok) {
                showMessage(setSuccessMessage, 'Staff member added successfully!');
                setNewStaff({ staffId: '', name: '' }); // Clear input
                loadStaffList(); // Refresh the list
            } else {
                const errorData = await response.json();
                showMessage(setError, `Failed to add staff: ${errorData.message || 'Server error'}`);
                console.error('Server error:', errorData);
            }
        } catch (err) {
            console.error('Error adding staff member:', err);
            showMessage(setError, 'An error occurred while adding the staff member.');
        } finally {
            setLoading(false);
        }
    };

    const deleteStaff = async (staffId) => {
        if (!window.confirm(`Are you sure you want to delete staff member with ID: ${staffId}? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(getApiUrl(`${STAFF_API_ENDPOINT}/${staffId}`), {
                method: 'DELETE',
            });

            if (response.ok) {
                showMessage(setSuccessMessage, 'Staff member deleted successfully!');
                loadStaffList(); // Refresh the list
            } else {
                const errorData = await response.json();
                showMessage(setError, `Failed to delete staff: ${errorData.message || 'Server error'}`);
                console.error('Server error:', errorData);
            }
        } catch (err) {
            console.error('Error deleting staff member:', err);
            showMessage(setError, 'An error occurred while deleting the staff member.');
        }
    };


    // --- JSX Render (Uses Tailwind-like classes similar to admin.html) ---

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Manage Staff</h2>
            
            {/* Messages Area */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}
            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Success:</strong>
                    <span className="block sm:inline"> {successMessage}</span>
                </div>
            )}

            {/* Add New Staff Form (Matches structure of admin.html's Add Staff section) */}
            <form onSubmit={addStaff} className="mb-8 p-6 bg-gray-50 rounded-lg shadow-sm">
                <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-4">Add New Staff Member</h3>
                <div className="mb-4">
                    <label htmlFor="newStaffId" className="block text-md font-semibold text-gray-700 mb-2">Staff ID:</label>
                    <input 
                        type="text" 
                        id="newStaffId"
                        name="staffId"
                        value={newStaff.staffId}
                        onChange={handleNewStaffChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm text-gray-800"
                        placeholder="Enter New Staff ID"
                        disabled={loading}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="newStaffName" className="block text-md font-semibold text-gray-700 mb-2">Staff Name:</label>
                    <input 
                        type="text" 
                        id="newStaffName"
                        name="name"
                        value={newStaff.name}
                        onChange={handleNewStaffChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm text-gray-800"
                        placeholder="Enter New Staff Name"
                        disabled={loading}
                    />
                </div>
                <button
                    type="submit"
                    className={`w-full font-bold py-2 px-4 rounded-lg text-lg transition duration-300 ease-in-out ${
                        loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                    disabled={loading}
                >
                    {loading ? 'Adding...' : 'Add Staff'}
                </button>
            </form>

            {/* Staff List Table (Matches structure of admin.html's Staff List table) */}
            <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                <table className="min-w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="py-3 px-6">Staff ID</th>
                            <th scope="col" className="py-3 px-6">Staff Name</th>
                            <th scope="col" className="py-3 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200" id="staffListBody">
                        {staffList.length === 0 && !loading && !error ? (
                            <tr className="bg-white border-b">
                                <td colSpan="3" className="text-center text-gray-600 py-4">No staff members found.</td>
                            </tr>
                        ) : staffList.map((staff) => (
                            <tr key={staff.staffId} className="bg-white border-b hover:bg-gray-50">
                                <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">{staff.staffId}</td>
                                <td className="py-4 px-6">{staff.name}</td>
                                <td className="py-4 px-6 text-right">
                                    <button 
                                        onClick={() => deleteStaff(staff.staffId)} 
                                        className="font-medium text-red-600 hover:text-red-800 hover:underline transition duration-150"
                                        disabled={loading}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {loading && <p className="text-center text-blue-600 py-4">Loading staff list...</p>}
        </div>
    );
}

export default ManageStaff;