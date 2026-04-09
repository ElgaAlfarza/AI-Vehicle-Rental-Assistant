import React, { useState, useEffect } from 'react';
import './InventoryPage.css';

const formatRupiah = (num) => new Intl.NumberFormat('id-ID').format(num);

const InventoryVehicleCard = ({ vehicle, onSewa }) => (
    <div className={`inventory-card ${vehicle.status !== 'available' ? 'opacity-80' : ''}`}>
        <div className="card-image-container">
            <img src={vehicle.image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600'} alt={vehicle.nama} className="card-image"/>
            {vehicle.status === 'available' ? 
                <span className="badge badge-available">TERSEDIA</span> : 
                <span className="badge badge-booked">DIPESAN</span>
            }
            <div className="card-price">
                <span className="card-price-value">Rp {formatRupiah(vehicle.harga_per_hari)}</span>
                <span className="card-price-unit">/hari</span>
            </div>
        </div>
        <div className="inventory-card-body">
            <div className="card-header">
                <div>
                    <h3>{vehicle.nama}</h3>
                    <span className="vehicle-type-badge">{vehicle.jenis}</span>
                </div>
                <span className="material-symbols-outlined icon-favorite">favorite</span>
            </div>
            <p className="card-description">ID Kendaraan: #{vehicle.id} • Tipe {vehicle.jenis}</p>
            <div className="card-features">
                <div className="feature-item">
                    <span className="material-symbols-outlined">airline_seat_recline_normal</span>
                    <span>{vehicle.jenis === 'Hatchback' ? '5' : '7'} Kursi</span>
                </div>
                <div className="feature-item">
                    <span className="material-symbols-outlined">settings_suggest</span>
                    <span>Automatic</span>
                </div>
                <div className="feature-item">
                    <span className="material-symbols-outlined">local_gas_station</span>
                    <span>Bensin</span>
                </div>
            </div>
            {vehicle.status === 'available' && (
                <button className="btn-sewa-card" onClick={() => onSewa(vehicle)}>
                    <span className="material-symbols-outlined">directions_car</span>
                    Sewa Sekarang
                </button>
            )}
            {vehicle.status !== 'available' && (
                <div className="btn-booked-card">
                    <span className="material-symbols-outlined">lock</span>
                    Sedang Disewa
                </div>
            )}
        </div>
    </div>
);

const InventoryPage = ({ setCurrentPage }) => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterJenis, setFilterJenis] = useState('Semua Tipe');
    const [filterStatus, setFilterStatus] = useState('Semua Status');

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/vehicles');
            const data = await res.json();
            setVehicles(data);
        } catch (err) {
            console.error("Gagal fetch vehicles:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredVehicles = vehicles.filter(v => {
        if (filterJenis !== 'Semua Tipe' && v.jenis !== filterJenis) return false;
        if (filterStatus === 'Tersedia' && v.status !== 'available') return false;
        if (filterStatus === 'Dipesan' && v.status !== 'booked') return false;
        return true;
    });

    const jenisOptions = ['Semua Tipe', ...new Set(vehicles.map(v => v.jenis))];

    return (
        <div style={{ padding: '0 0 128px 0', overflowY: 'auto' }}>
            <header className="page-header">
                <div>
                    <h1>Inventaris Kendaraan</h1>
                    <p>Temukan mobilitas premium untuk petualangan tropis Anda.</p>
                </div>
                <div className="header-actions">
                    <div className="inv-stats-pill">
                        <span className="material-symbols-outlined">directions_car</span>
                        <span>{vehicles.filter(v => v.status === 'available').length} Tersedia</span>
                        <span className="inv-stats-divider">|</span>
                        <span>{vehicles.length} Total</span>
                    </div>
                </div>
            </header>

            <section className="filters-bar">
                <div className="filter-item">
                    <span className="material-symbols-outlined">category</span>
                    <select className="filter-select" value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)}>
                        {jenisOptions.map(j => <option key={j}>{j}</option>)}
                    </select>
                </div>
                <div className="filter-item">
                    <span className="material-symbols-outlined">filter_list</span>
                    <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option>Semua Status</option>
                        <option>Tersedia</option>
                        <option>Dipesan</option>
                    </select>
                </div>
                <button className="btn-refresh-inv" onClick={fetchVehicles}>
                    <span className="material-symbols-outlined">refresh</span> Refresh
                </button>
            </section>

            {loading ? (
                <div className="inv-loading">
                    <span className="material-symbols-outlined spin">progress_activity</span>
                    <p>Memuat data kendaraan...</p>
                </div>
            ) : (
                <section className="inventory-grid">
                    {filteredVehicles.map(v => (
                        <InventoryVehicleCard 
                            key={v.id} 
                            vehicle={v} 
                            onSewa={() => setCurrentPage && setCurrentPage('chat')} 
                        />
                    ))}
                    {filteredVehicles.length === 0 && (
                        <div className="inv-empty">
                            <span className="material-symbols-outlined">search_off</span>
                            <p>Tidak ada kendaraan yang sesuai filter.</p>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
};

export default InventoryPage;
