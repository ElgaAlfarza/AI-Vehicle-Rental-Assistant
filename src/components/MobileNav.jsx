import React from 'react';
import './MobileNav.css';

const MobileNav = ({ currentPage, setCurrentPage }) => (
    <nav className="mobile-nav">
        <a href="#" className={currentPage === 'chat' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentPage('chat'); }}>
            <span className={`material-symbols-outlined ${currentPage === 'chat' ? 'icon-fill' : ''}`}>chat_bubble</span>
            <span>Chat</span>
        </a>
        <a href="#" className={currentPage === 'inventory' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentPage('inventory'); }}>
            <span className={`material-symbols-outlined ${currentPage === 'inventory' ? 'icon-fill' : ''}`}>directions_car</span>
            <span>Mobil</span>
        </a>
        <div className="fab-wrapper">
            <button className="fab-btn">
                <span className="material-symbols-outlined">add</span>
            </button>
        </div>
        <a href="#" className={currentPage === 'reservasi' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentPage('reservasi'); }}>
            <span className={`material-symbols-outlined ${currentPage === 'reservasi' ? 'icon-fill' : ''}`}>calendar_month</span>
            <span>Pesanan</span>
        </a>
    </nav>
);

export default MobileNav;
