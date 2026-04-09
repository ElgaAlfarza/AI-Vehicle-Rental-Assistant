import React, { useState, useEffect } from 'react';
import './ReservasiPage.css';

function ReservasiPage({ setCurrentPage }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/bookings`);
      const data = await res.json();
      setBookings(data);
      if (data.length > 0 && (!selectedBooking || !data.find(d => d.id === selectedBooking.id))) {
        setSelectedBooking(data[0]);
      } else if (data.length === 0) {
        setSelectedBooking(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handlePaymentStatus = async (id, status) => {
    try {
      await fetch(`http://localhost:8000/api/bookings/${id}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: status })
      });
      fetchBookings();
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking({...selectedBooking, payment_status: status});
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="res-loading">
        <span className="material-symbols-outlined spin">progress_activity</span>
        <p>Memuat riwayat pemesanan...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="res-empty-state">
        <div className="res-empty-icon">
          <span className="material-symbols-outlined">receipt_long</span>
        </div>
        <h2>Belum ada reservasi</h2>
        <p>Anda belum melakukan pemesanan kendaraan apa pun.</p>
        <button className="btn-start-booking" onClick={() => setCurrentPage('chat')}>
          <span className="material-symbols-outlined">forum</span>
          Sewa Sekarang
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 0 128px 0', overflowY: 'auto' }}>
      <div className="reservasi-header">
        <div>
          <div className="reservasi-header-nav">
            <span className="material-symbols-outlined">verified</span>
            <p>Sistem Reservasi Global</p>
          </div>
          <h2>Riwayat Pemesanan</h2>
          <p className="res-subtitle">{bookings.length} perjalanan tercatat</p>
        </div>
        <div className="res-header-actions">
          <button className="res-refresh-btn" onClick={fetchBookings}>
            <span className="material-symbols-outlined">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      <div className="reservasi-layout">
        <div className="res-right-col" style={{ gridColumn: 'span 4' }}>
          <div className="booking-list">
            {bookings.map(b => (
              <div 
                key={b.id} 
                className={`booking-list-item ${selectedBooking?.id === b.id ? 'active' : ''}`}
                onClick={() => setSelectedBooking(b)}
              >
                <div className="booking-item-img">
                  <img src={b.vehicle_image} alt={b.vehicle_nama} />
                </div>
                <div className="booking-item-info">
                  <h4>{b.vehicle_nama}</h4>
                  <p className="booking-item-name">{b.nama_penyewa}</p>
                  <p className="booking-item-meta">{b.tanggal_mulai}</p>
                </div>
                <div className="booking-item-right">
                  <span className={`booking-status-badge status-${b.status_pesanan}`}>
                    {b.status_pesanan}
                  </span>
                  <span className={`booking-status-badge ${b.payment_status === 'paid' ? 'status-completed' : 'status-pending'}`}>
                    {b.payment_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="res-left-col" style={{ gridColumn: 'span 8' }}>
          {selectedBooking && (
            <>
              {/* Payment Summary */}
              <div className="summary-card">
                <div className="summary-glow"></div>
                <div className="summary-title">Ringkasan Biaya</div>
                <div className="summary-items">
                  <div className="summary-item">
                    <span className="summary-item-label">Kendaraan</span>
                    <span className="summary-item-val">{selectedBooking.vehicle_nama}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-item-label">Nama Penyewa</span>
                    <span className="summary-item-val">{selectedBooking.nama_penyewa}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-item-label">Status Pembayaran</span>
                    <span className="summary-item-val">{selectedBooking.payment_status.toUpperCase()}</span>
                  </div>
                </div>
                
                <div className="summary-total">
                  <div>
                    <div className="summary-total-label">Total Tagihan</div>
                    <div className="summary-total-val">
                      Rp {selectedBooking.total_harga ? selectedBooking.total_harga.toLocaleString('id-ID') : 0}
                    </div>
                  </div>
                </div>

                <div className="summary-actions-group">
                  {selectedBooking.payment_status !== 'paid' && (
                    <>
                      <button className="btn-summary-primary" onClick={() => handlePaymentStatus(selectedBooking.id, 'paid')}>
                        Tandai Sudah Dibayar
                      </button>
                      <button className="btn-summary-primary">
                        Lanjutkan ke Pembayaran (Bank)
                      </button>
                    </>
                  )}
                  <button className="btn-summary-secondary" onClick={() => setCurrentPage('chat')}>
                    Hubungi Asisten
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReservasiPage;
