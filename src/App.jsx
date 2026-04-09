import React, { useState } from 'react';
import './css/style.css';

import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import ChatPage from './pages/ChatPage';
import InventoryPage from './pages/InventoryPage';
import ReservasiPage from './pages/ReservasiPage';

function App() {
  const [currentPage, setCurrentPage] = useState('chat');

  const renderContent = () => {
    switch(currentPage) {
      case 'inventory':
        return <InventoryPage setCurrentPage={setCurrentPage} />;
      case 'reservasi':
        return <ReservasiPage setCurrentPage={setCurrentPage} />;
      case 'chat':
      default:
        return <ChatPage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
      />
      <main className="main-content" style={{ position: 'relative' }}>
        {renderContent()}
      </main>
      <MobileNav 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
      />
    </div>
  );
}

export default App;
