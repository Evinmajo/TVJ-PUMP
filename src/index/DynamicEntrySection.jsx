import React from 'react';

const DynamicEntrySection = ({ title, entries, setEntries, type, handleDynamicEntryChange, addDynamicEntry, removeDynamicEntry, isPackedOil = false }) => (
    <div className={`col-span-1 ${isPackedOil ? 'md:col-span-2' : ''}`}>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 text-center">{title}</h2>
        <div id={`${type}EntriesContainer`} className="space-y-3">
            {entries.map(entry => (
                <div key={entry.id} className="flex items-center gap-x-2 mb-3">
                    <input type="text" placeholder="Name"
                        className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm text-gray-800 text-center dynamic-entry-name"
                        value={entry.name}
                        onChange={(e) => handleDynamicEntryChange(entry.id, 'name', e.target.value, setEntries)} />
                    <input type="number" placeholder="0"
                        className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm text-gray-800 text-center dynamic-entry-amount"
                        value={entry.amount}
                        onChange={(e) => handleDynamicEntryChange(entry.id, 'amount', e.target.value, setEntries)} />
                    <button type="button"
                        onClick={() => removeDynamicEntry(entry.id, setEntries)}
                        className="ml-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-lg text-sm">
                        Remove
                    </button>
                </div>
            ))}
        </div>
        <button type="button" onClick={() => addDynamicEntry(type)}
            className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-md transition duration-300 ease-in-out">
            Add {title} Entry
        </button>
    </div>
);

export default DynamicEntrySection;