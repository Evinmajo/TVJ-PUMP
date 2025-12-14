import React from 'react';

const links = [
    { id: 'SearchReadings', name: 'Search Readings' },
    { id: 'CreditDebit', name: 'Credit & Debit' },
    { id: 'PriceChange', name: 'Price Change' },
    { id: 'ManageStaff', name: 'Manage Staff' },
];

function NavLinks({ currentView, setCurrentView }) {
    return (
        <nav className="p-4 space-y-2"> {/* Added space-y-2 for vertical separation */}
            <ul>
                {links.map((link) => (
                    <li key={link.id} className="mb-1">
                        <button
                            onClick={() => setCurrentView(link.id)}
                            className={`
                                w-full text-left py-2.5 px-4 rounded-xl transition duration-200 ease-in-out flex items-center gap-3
                                
                                ${currentView === link.id 
                                    // Attractive Active State: Brighter background, strong shadow, and text contrast
                                    ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/50 transform scale-[1.02]' 
                                    
                                    // Default State: Lighter text, clear hover effect
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-md'}
                            `}
                        >
                            {/* Optional: Add an icon based on the link name for visual appeal (using Tailwind placeholder icons) */}
                            {link.id === 'SearchReadings' && (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            )}
                            {link.id === 'CreditDebit' && (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            )}
                            {link.id === 'PriceChange' && (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            )}
                            {link.id === 'ManageStaff' && (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5m-5 0a2 2 0 100-4m0 4a2 2 0 01-2 2h-2a2 2 0 01-2-2m2-4v12m0-12a2 2 0 100-4m0 4a2 2 0 012-2h2a2 2 0 012 2m0 0v12" /></svg>
                            )}
                            
                            <span className="truncate"> {/* Ensure name truncates if sidebar gets narrow */}
                                {link.name}
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default NavLinks;