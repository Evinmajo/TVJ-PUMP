// src/components/ReadingInputs.jsx

import React, { useMemo } from 'react';

// Helper function for Reading Inputs
const ReadingInputs = ({ label, baseId, formData, setFormData, count = 3 }) => {
    const handleInputChange = (e, index) => {
        const value = e.target.value;
        // Determine the correct key name, e.g., 'firstReading', 'firstReading2', 'firstReading3'
        const key = `${baseId}${index > 0 ? index : ''}`;
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // Memoize the input IDs to prevent unnecessary re-creation
    const inputIds = useMemo(() => {
        // baseId is the main key, e.g., 'oilFirstReading'
        // indices are 0, 1, 2
        return Array.from({ length: count }, (_, i) => `${baseId}${i > 0 ? i + 1 : ''}`);
    }, [baseId, count]);

    return (
        <div className="mb-6">
            <h2 className="block text-lg sm:text-xl font-semibold text-gray-700 mb-2 text-left">{label}</h2>
            <div className="flex flex-row gap-x-2 w-full justify-end">
                {inputIds.map((id, index) => (
                    <input
                        key={id}
                        type="number"
                        id={id}
                        className="w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm text-gray-800 text-center"
                        placeholder="-"
                        value={formData[id] || ''}
                        onChange={(e) => handleInputChange(e, index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ReadingInputs;