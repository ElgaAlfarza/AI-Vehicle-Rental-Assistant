import React, { useState, useRef, useEffect } from 'react';
import './ChatPage.css';

const ChatHeader = () => (
    <header className="top-bar">
        <div className="top-bar-left">
            <div className="mobile-only menu-btn">
                <span className="material-symbols-outlined text-primary">menu</span>
            </div>
            <h2>The Tropical Tech</h2>
        </div>
        <div className="top-bar-right">
            <button className="icon-btn">
                <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="avatar">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCs6HlelhB3gW7xox5TAN39hpBEuDFYYVW4MaTzqckGZfKKyH-9CNj4m__O1_w3bswTrrSiCM9E9qYcuZtda05YRj0WzjIVBrRSCuXBam_GtWLh3fn6JKynvAh_slt3flHqHAxDDq5sCEKmqZPLE8LgjGuSB0hwJfnlrQot6-58j4HyIhig4Ke8xAQa8jI4iwUwr_yzqM_duFguhF0fuHpsmhQebpD_v04s-I_ckeS9MDG7RW19S_FSN6rtgpGQWlcFCfIbo3d5rZx7" alt="Profil pengguna"/>
            </div>
        </div>
    </header>
);

const ChatVehicleCard = ({ vehicle, onPesan }) => (
    <div className="vehicle-card border-card">
        <div className="card-image-wrapper">
            <img src={vehicle.image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600'} alt={vehicle.nama} className="card-image" />
            <span className="badge-status">Tersedia</span>
            <span className="badge-price">Rp {(vehicle.harga_per_hari / 1000).toFixed(0)}rb<span>/hari</span></span>
        </div>
        <div className="card-body">
            <div className="chat-card-header">
                <div>
                    <h3>{vehicle.nama}</h3>
                    <p>{vehicle.jenis}</p>
                </div>
                <span className="material-symbols-outlined info-icon">info</span>
            </div>
            <div className="chat-card-features">
                <div className="chat-feature"><span className="material-symbols-outlined">group</span><span>{vehicle.jenis === 'SUV' ? '7' : vehicle.jenis === 'MPV' ? '7' : '5'} Kursi</span></div>
                <div className="chat-feature"><span className="material-symbols-outlined">luggage</span><span>{vehicle.jenis === 'Hatchback' ? '2' : '3'} Koper</span></div>
                <div className="chat-feature"><span className="material-symbols-outlined">settings</span><span>Automatic</span></div>
            </div>
            <button className="btn-primary-full" onClick={() => onPesan(vehicle)}>
                <span className="material-symbols-outlined btn-icon">directions_car</span>
                Pesan Mobil Ini
            </button>
        </div>
    </div>
);

const BookingFormModal = ({ vehicle, onClose, onSubmitBooking }) => {
    const today = new Date().toISOString().split('T')[0];
    const [namaPenyewa, setNamaPenyewa] = useState('');
    const [tanggalMulai, setTanggalMulai] = useState(today);
    const [lamaSewa, setLamaSewa] = useState(1);
    const [metodePembayaran, setMetodePembayaran] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalHarga = vehicle.harga_per_hari * lamaSewa;

    const getTanggalSelesai = () => {
        if (!tanggalMulai) return '';
        const d = new Date(tanggalMulai);
        d.setDate(d.getDate() + parseInt(lamaSewa));
        return d.toISOString().split('T')[0];
    };

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!namaPenyewa.trim() || !tanggalMulai || !metodePembayaran) return;
        setIsSubmitting(true);
        await onSubmitBooking({
            nama_penyewa: namaPenyewa,
            vehicle_id: vehicle.id,
            vehicle_nama: vehicle.nama,
            tanggal_mulai: tanggalMulai,
            tanggal_selesai: getTanggalSelesai(),
            lama_sewa: lamaSewa,
            total_harga: totalHarga,
            metode_pembayaran: metodePembayaran
        });
        setIsSubmitting(false);
    };

    return (
        <div className="booking-modal-overlay" onClick={onClose}>
            <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
                <div className="booking-modal-header">
                    <div className="booking-modal-title">
                        <span className="material-symbols-outlined icon-fill booking-modal-icon">directions_car</span>
                        <div>
                            <h3>Formulir Pemesanan</h3>
                            <p>{vehicle.nama} • {vehicle.jenis}</p>
                        </div>
                    </div>
                    <button className="booking-close-btn" onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="booking-vehicle-preview">
                    <img src={vehicle.image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600'} alt={vehicle.nama} />
                    <div className="booking-vehicle-info">
                        <span className="booking-price-tag">Rp {formatRupiah(vehicle.harga_per_hari)}<span>/hari</span></span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="booking-form">
                    <div className="form-group">
                        <label><span className="material-symbols-outlined form-label-icon">person</span>Nama Penyewa</label>
                        <input type="text" placeholder="Masukkan nama lengkap Anda" value={namaPenyewa} onChange={(e) => setNamaPenyewa(e.target.value)} required />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label><span className="material-symbols-outlined form-label-icon">calendar_today</span>Tanggal Mulai</label>
                            <input type="date" value={tanggalMulai} min={today} onChange={(e) => setTanggalMulai(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label><span className="material-symbols-outlined form-label-icon">schedule</span>Lama Sewa (Hari)</label>
                            <input type="number" min="1" max="30" value={lamaSewa} onChange={(e) => setLamaSewa(Math.max(1, parseInt(e.target.value) || 1))} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label><span className="material-symbols-outlined form-label-icon">date_range</span>Tanggal Selesai</label>
                        <input type="text" value={getTanggalSelesai()} readOnly className="readonly-input" />
                    </div>

                    <div className="form-group">
                        <label><span className="material-symbols-outlined form-label-icon">payments</span>Metode Pembayaran</label>
                        <div className="payment-options">
                            {[
                                { id: 'transfer', icon: 'account_balance', label: 'Transfer Bank' },
                                { id: 'ewallet', icon: 'wallet', label: 'E-Wallet' },
                                { id: 'cash', icon: 'payments', label: 'Tunai (Cash)' },
                                { id: 'qris', icon: 'qr_code_2', label: 'QRIS' },
                            ].map(opt => (
                                <button key={opt.id} type="button"
                                    className={`payment-option ${metodePembayaran === opt.id ? 'active' : ''}`}
                                    onClick={() => setMetodePembayaran(opt.id)}>
                                    <span className="material-symbols-outlined">{opt.icon}</span>
                                    <span>{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="booking-summary">
                        <div className="summary-row">
                            <span>Harga per hari</span>
                            <span>Rp {formatRupiah(vehicle.harga_per_hari)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Durasi sewa</span>
                            <span>{lamaSewa} hari</span>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-row summary-total">
                            <span>Total Pembayaran</span>
                            <span>Rp {formatRupiah(totalHarga)}</span>
                        </div>
                    </div>

                    <button type="submit" className="btn-booking-submit" disabled={isSubmitting || !namaPenyewa.trim() || !metodePembayaran}>
                        {isSubmitting ? (
                            <><span className="material-symbols-outlined spin">progress_activity</span> Memproses...</>
                        ) : (
                            <><span className="material-symbols-outlined icon-fill">check_circle</span> Konfirmasi Pemesanan</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

const ChatPage = () => {
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Halo! Saya asisten pintar The Tropical Tech. Ada yang bisa saya bantu hari ini terkait pencarian dan penyewaan mobil?', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), vehicles: [] }
    ]);
    const [inputQuery, setInputQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [bookingVehicle, setBookingVehicle] = useState(null);
    const chatCanvasRef = useRef(null);

    useEffect(() => {
        if (chatCanvasRef.current) {
            chatCanvasRef.current.scrollTop = chatCanvasRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async (customMessage) => {
        const msgText = customMessage || inputQuery;
        if (!msgText.trim()) return;
        
        const userMsg = { role: 'user', text: msgText, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), vehicles: [] };
        setMessages(prev => [...prev, userMsg]);
        if (!customMessage) setInputQuery('');
        setIsLoading(true);

        try {
            const bodyPayload = { message: msgText };
            
            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPayload)
            });
            const data = await response.json();
            
            const aiMsg = {
                role: 'ai',
                text: data.reply,
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                vehicles: data.vehicles || [],
                action: data.action
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', text: 'Maaf, backend server tidak aktif atau error jaringan terjadi.', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), vehicles: [] }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePesanMobil = (vehicle) => {
        setBookingVehicle(vehicle);
    };

    const handleSubmitBooking = async (bookingData) => {
        setBookingVehicle(null);
        // Extract durasi_hari from the confirmation
        const durasiHari = bookingData.durasi_hari || 1; // Assuming bookingData provides it now
        const confirmMsg = `Tolong buatkan pesanan rental mobil ${bookingData.vehicle_nama} atas nama ${bookingData.nama_penyewa}, mulai tanggal ${bookingData.tanggal_mulai} selama ${durasiHari} hari. Pembayaran via ${bookingData.metode_pembayaran}. Tolong konfirmasi.`;
        await handleSend(confirmMsg);
    };

    return (
        <>
            <ChatHeader />
            <div className="chat-canvas" ref={chatCanvasRef}>
                <div className="chat-date"><span>Hari Ini</span></div>

                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}>
                        {msg.role === 'ai' && (
                            <div className="ai-avatar"><span className="material-symbols-outlined icon-fill">smart_toy</span></div>
                        )}
                        <div className="message-content">
                            <div className={`message-bubble ${msg.role === 'ai' ? 'ai-bubble' : ''}`}>
                                <p>{msg.text}</p>
                            </div>

                            {/* Render Vehicle Cards */}
                            {msg.vehicles && msg.vehicles.length > 0 && (
                                <div className="vehicle-grid">
                                    {msg.vehicles.map((v) => (
                                        <ChatVehicleCard key={v.id} vehicle={v} onPesan={handlePesanMobil} />
                                    ))}
                                </div>
                            )}
                        </div>
                        <span className={msg.role === 'user' ? "message-time" : "ai-time"}>
                            {msg.time} {msg.role === 'user' ? '• Anda' : '• Tropical Tech AI'}
                        </span>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="message ai-message">
                         <div className="ai-avatar"><span className="material-symbols-outlined icon-fill">smart_toy</span></div>
                         <div className="message-content">
                            <div className="message-bubble ai-bubble typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                         </div>
                    </div>
                )}
            </div>

            <div className="message-input-section">
                <div className="input-container">
                    <div className="input-wrapper">
                        <button className="add-btn"><span className="material-symbols-outlined">add_circle</span></button>
                        <input 
                            className="chat-input" 
                            type="text" 
                            placeholder="Tanyakan mobil apa yang tersedia..." 
                            value={inputQuery}
                            onChange={(e) => setInputQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <div className="input-actions">
                            <button className="mic-btn desktop-only"><span className="material-symbols-outlined">mic</span></button>
                            <button className="send-btn" onClick={() => handleSend()}><span className="material-symbols-outlined icon-fill">send</span></button>
                        </div>
                    </div>
                    <div className="quick-suggestions">
                        <button className="quick-suggest-btn" onClick={() => { setInputQuery("Mobil apa saja yang tersedia?"); handleSend("Mobil apa saja yang tersedia?"); }}>🚗 Lihat semua mobil</button>
                        <button className="quick-suggest-btn" onClick={() => { setInputQuery("Mobil SUV apa saja yang tersedia hari ini?"); handleSend("Mobil SUV apa saja yang tersedia hari ini?"); }}>🏔️ Cari mobil SUV</button>
                        <button className="quick-suggest-btn" onClick={() => { setInputQuery("Mobil murah di bawah 300 ribu?"); handleSend("Mobil murah di bawah 300 ribu?"); }}>💰 Mobil murah</button>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            {bookingVehicle && (
                <BookingFormModal
                    vehicle={bookingVehicle}
                    onClose={() => setBookingVehicle(null)}
                    onSubmitBooking={handleSubmitBooking}
                />
            )}
        </>
    );
};

export default ChatPage;
