import React from "react";
import "./Sidebar.css";

const Sidebar = ({ currentPage, setCurrentPage }) => {
  return (
    <aside className="sidebar desktop-only">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="material-symbols-outlined icon-fill">eco</span>
        </div>
        <div>
          <h2>TROPICAL</h2>
          <p>Rental System</p>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <a
          href="#"
          className={`nav-item ${currentPage === "inventory" ? "active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            setCurrentPage("inventory");
          }}
        >
          <span className={`material-symbols-outlined ${currentPage === "inventory" ? "icon-fill" : ""}`}>
            directions_car
          </span>
          <span>Katalog Mobil</span>
        </a>

        <a
          href="#"
          className={`nav-item ${currentPage === "reservasi" ? "active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            setCurrentPage("reservasi");
          }}
        >
          <span className={`material-symbols-outlined ${currentPage === "reservasi" ? "icon-fill" : ""}`}>
            calendar_month
          </span>
          <span>Reservasi Saya</span>
        </a>

        <a
          href="#"
          className={`nav-item ${currentPage === "chat" ? "active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            setCurrentPage("chat");
          }}
        >
          <span className={`material-symbols-outlined ${currentPage === "chat" ? "icon-fill" : ""}`}>
            chat_bubble
          </span>
          <span>Chat AI</span>
        </a>
      </nav>

      <div style={{ flexGrow: 1 }}></div>

      <div className="sidebar-action" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button className="btn-primary-action" onClick={() => setCurrentPage("chat")}>
          <span className="material-symbols-outlined">add</span>
          Sewa Baru
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
