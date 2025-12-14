import React, { useState } from 'react';

import NavLinks from './admin-panel/NavLinks';
import SearchReadings from './admin-panel/SearchReadings';
import ManageStaff from './admin-panel/ManageStaff';
import CreditDebit from './admin-panel/CreditDebit';
import PriceChange from './admin-panel/PriceChange';

const VIEWS = {
  SearchReadings,
  ManageStaff,
  CreditDebit,
  PriceChange,
};

const SIDEBAR_WIDTH = '18rem'; // w-72

function AdminPanel() {
  const [currentView, setCurrentView] = useState('SearchReadings');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const CurrentComponent = VIEWS[currentView];
  const formattedTitle = currentView.replace(/([A-Z])/g, ' $1').trim();

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR (scroll owner) */}
      <aside
        style={{ width: SIDEBAR_WIDTH }}
        className={`
          fixed top-0 left-0 z-40
          h-screen
          overflow-y-auto
          bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
          text-slate-100 shadow-2xl
          transform transition-transform duration-300 ease-out
          md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 px-6 py-5 bg-slate-900/80 backdrop-blur border-b border-white/10">
          <h1 className="text-2xl font-semibold">Admin Panel</h1>
          <p className="text-xs text-slate-400">Control & Management</p>
        </div>

        {/* Nav */}
        <div className="px-3 py-4">
          <NavLinks
            currentView={currentView}
            setCurrentView={(v) => {
              setCurrentView(v);
              setIsSidebarOpen(false);
            }}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-6 text-xs text-slate-400">
          © 2025 Admin Suite
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div
        style={{ paddingLeft: SIDEBAR_WIDTH }}
        className="hidden md:block"
      />

      <div className="md:pl-[18rem] flex flex-col min-h-screen">

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white shadow-sm">
          <h1 className="text-lg font-semibold text-slate-700">
            {formattedTitle}
          </h1>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg bg-slate-100"
          >
            ☰
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-10">
          <div className="bg-white rounded-2xl shadow-md p-6">
            {CurrentComponent && <CurrentComponent />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminPanel;
