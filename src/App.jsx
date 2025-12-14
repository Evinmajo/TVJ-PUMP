import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ReadingDifferenceCalculator from './index/ReadingDifferenceCalculator.jsx';
import StaffAdminLinks from './home/StaffAdminLinks.jsx'; 
import Login from './login/Login.jsx';
import AdminPanel from './AdminPanel.jsx';
import ReadingView from './view/ReadingView.jsx';
import EditReadingEntry from './edit/EditReadingEntry.jsx';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/staff" element={<ReadingDifferenceCalculator />} />
          <Route path="/" element={<StaffAdminLinks />} />
          <Route path="/login" element={<Login />} />
          <Route path="/hbvheiwbvhebnjhfrbvhjdbhvbfxjkbkdbhadmin" element={<AdminPanel />} />
          <Route path='/view' element={<ReadingView/>}/>
          <Route path='/edit' element={<EditReadingEntry/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App; // <-- The file should end here.