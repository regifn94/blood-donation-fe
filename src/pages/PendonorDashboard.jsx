/**
 * PendonorDashboard.jsx
 * Blood Requester Dashboard with Request Darah Modal
 * src/pages/pendonor/PendonorDashboard.jsx
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Droplet, 
  LogOut, 
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  X
} from 'lucide-react';
import apiService from '../services/api';

const PendonorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bloodStocks, setBloodStocks] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [donorHistories, setDonorHistories] = useState([]);
  
  // Get current user
  const currentUser = apiService.auth.getUser();

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch blood stocks
      const stocks = await apiService.bloodStock.getAll();
      setBloodStocks(stocks);
      
      // Fetch my blood requests
      const requests = await apiService.bloodRequest.getAll();
      setMyRequests(requests);
      
      // Fetch donor histories/schedules
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/donor-schedules`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const histories = await response.json();
        setDonorHistories(histories);
      }
      
      setError('');
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiService.auth.logout();
    navigate('/login');
  };

  // Get stock status badge color
  const getStockBadgeClass = (status) => {
    switch (status) {
      case 'Kritis':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Menipis':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Aman':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Get stock card background
  const getStockCardClass = (status) => {
    switch (status) {
      case 'Kritis':
        return 'bg-red-50 border-red-300';
      case 'Menipis':
        return 'bg-yellow-50 border-yellow-300';
      case 'Aman':
        return 'bg-green-50 border-green-300';
      default:
        return 'bg-gray-50 border-gray-300';
    }
  };

  // Get request status badge
  const getRequestStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'Disetujui':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Disetujui
          </span>
        );
      case 'Ditolak':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-red-700 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-red-700">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                <Droplet className="w-8 h-8 text-white" fill="currentColor" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Sistem Layanan Donor Darah
                </h1>
                <p className="text-sm text-gray-600">
                  Rs. Sentra Medika Minahasa utara
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition shadow-md"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="text-sm text-red-600 underline mt-1"
              >
                Coba lagi
              </button>
            </div>
          </div>
        )}

        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-4 border-red-200">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Selamat Datang,
              </h2>
              <p className="text-3xl font-bold text-red-600">
                {currentUser?.nama || 'User'}
              </p>
            </div>
            <div className="text-right bg-red-50 px-4 py-3 rounded-lg border-2 border-red-200">
              <p className="text-sm text-gray-600 mb-1">Golongan Darah</p>
              <p className="text-2xl font-bold text-red-600">
                {currentUser?.gol_darah || '-'}
              </p>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
            <p className="text-sm text-gray-600 mb-1">Jadwal Donor</p>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-600" />
              <p className="text-xl font-bold text-gray-900">
                {formatDate(new Date())} {formatTime(new Date())}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button 
            onClick={() => setShowHistoryModal(true)}
            className="bg-white hover:bg-gray-50 rounded-xl shadow-lg p-6 text-left transition border-2 border-transparent hover:border-red-300"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Riwayat Donasi</h3>
            </div>
            <p className="text-sm text-gray-600">Lihat riwayat donasi darah Anda</p>
          </button>

          <button 
            onClick={() => setShowScheduleForm(true)}
            className="bg-red-600 hover:bg-red-700 rounded-xl shadow-lg p-6 text-left transition border-2 border-red-700"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-white">Buat Jadwal Donor</h3>
            </div>
            <p className="text-sm text-red-100">Atur jadwal donor darah Anda</p>
          </button>

          <button 
            onClick={() => setShowRequestForm(true)}
            className="bg-white hover:bg-gray-50 rounded-xl shadow-lg p-6 text-left transition border-2 border-transparent hover:border-red-300"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Droplet className="w-6 h-6 text-green-600" fill="currentColor" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Request Darah</h3>
            </div>
            <p className="text-sm text-gray-600">Ajukan permintaan kebutuhan darah</p>
          </button>
        </div>

        {/* Blood Stock Display */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-2 border-red-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Stok Darah Tersedia</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bloodStocks.map((stock) => (
              <div
                key={stock.gol_darah}
                className={`p-5 rounded-xl border-2 shadow-md transition hover:shadow-lg ${getStockCardClass(stock.status)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl font-bold text-gray-900">
                    {stock.gol_darah}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getStockBadgeClass(stock.status)}`}>
                    {stock.status}
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {stock.jumlah_kantong}
                </p>
                <p className="text-sm text-gray-600 font-medium">Kantong</p>
              </div>
            ))}
          </div>
        </div>

        {/* My Requests */}
        {myRequests.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-red-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Riwayat Permintaan Saya</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Gol. Darah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Jumlah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Keperluan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {myRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(request.tanggal_permintaan)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                          {request.gol_darah}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.jumlah_kantong} Kantong
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {request.keperluan || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRequestStatusBadge(request.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Request Form Modal */}
      {showRequestForm && (
        <RequestBloodModal
          onClose={() => setShowRequestForm(false)}
          onSuccess={() => {
            setShowRequestForm(false);
            fetchDashboardData();
          }}
        />
      )}

      {/* Schedule Form Modal */}
      {showScheduleForm && (
        <ScheduleDonorModal
          onClose={() => setShowScheduleForm(false)}
          onSuccess={() => {
            setShowScheduleForm(false);
            fetchDashboardData();
          }}
        />
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <DonorHistoryModal
          histories={donorHistories}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
};

// ==================== Request Blood Modal Component ====================
const RequestBloodModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nama_pasien: '',
    gol_darah: '',
    jumlah_kantong: 2,
    keperluan: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nama_pasien || !formData.gol_darah || !formData.keperluan) {
      setError('Semua field wajib diisi');
      return;
    }

    setLoading(true);
    try {
      await apiService.bloodRequest.create(formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal membuat permintaan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">Request Darah</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Nama Lengkap Pengirim */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap Pengirim
                </label>
                <input
                  type="text"
                  name="nama_pasien"
                  value={formData.nama_pasien}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              {/* Golongan Darah */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gol. Darah
                </label>
                <select
                  name="gol_darah"
                  value={formData.gol_darah}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50"
                  required
                >
                  <option value="">Pilih golongan darah</option>
                  {bloodTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Jumlah Darah */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Darah (cc)
                </label>
                <input
                  type="number"
                  name="jumlah_kantong"
                  value={formData.jumlah_kantong}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50"
                  required
                />
              </div>
            </div>

            {/* Right Column */}
            <div>
              {/* Keterangan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keterangan
                </label>
                <textarea
                  name="keperluan"
                  value={formData.keperluan}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none bg-gray-50 h-[calc(100%-2rem)]"
                  placeholder="Jelaskan keperluan darah..."
                  rows="8"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition flex items-center justify-center gap-2 min-w-[250px]"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== Schedule Donor Modal Component ====================
const ScheduleDonorModal = ({ onClose, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00'
  ];

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Thu', 'Fri', 'Sab'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const handleDateSelect = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(date);
    setError('');
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDate) {
      setError('Silakan pilih tanggal donor');
      return;
    }

    setLoading(true);
    try {
      const datetimeString = `${selectedDate.toISOString().split('T')[0]}T${selectedTime}:00`;
      
      // Call the correct API endpoint for creating donor schedule
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/donor-schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          tanggal_donor: datetimeString,
          lokasi: 'RS Sentra Medika Minahasa Utara',
          catatan: ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Gagal membuat jadwal');
      }

      onSuccess();
    } catch (err) {
      setError(err.message || 'Gagal membuat jadwal');
    } finally {
      setLoading(false);
    }
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = [];

    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      date.setHours(0, 0, 0, 0);
      
      const isPast = date < today;
      const isSunday = date.getDay() === 0;
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === today.toDateString();

      let buttonClass = 'h-12 rounded-lg text-base font-medium transition ';
      
      if (isSelected) {
        buttonClass += 'bg-blue-400 text-white';
      } else if (isSunday) {
        buttonClass += 'text-red-500 cursor-not-allowed';
      } else if (isPast) {
        buttonClass += 'text-gray-300 cursor-not-allowed';
      } else if (isToday) {
        buttonClass += 'text-red-500 hover:bg-gray-100';
      } else {
        buttonClass += 'text-gray-900 hover:bg-gray-100';
      }

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isPast && !isSunday && handleDateSelect(day)}
          disabled={isPast || isSunday}
          className={buttonClass}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-200 rounded-3xl shadow-2xl max-w-lg w-full p-8">
        {/* Header */}
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Buat Jadwal Donor</h2>

        {/* Calendar Container */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition"
              >
                ←
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition"
              >
                →
              </button>
            </div>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 h-8 flex items-center justify-center">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {renderCalendar()}
          </div>

          {/* Time Selection */}
          <div className="mb-6">
            <label className="block text-base font-semibold text-gray-900 mb-3">
              Waktu
            </label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
            >
              {timeSlots.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !selectedDate}
            className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl font-bold text-lg transition"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Membuat Jadwal...
              </span>
            ) : (
              'Buat Jadwal'
            )}
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full mt-3 py-3 text-gray-600 hover:text-gray-900 font-medium transition"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== Donor History Modal Component ====================
const DonorHistoryModal = ({ histories, onClose }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status) => {
    const statusStr = typeof status === 'string' ? status : status?.toString() || '';
    
    if (statusStr === 'Selesai' || statusStr === 'selesai') {
      return 'bg-green-100 text-green-800 border-green-300';
    } else if (statusStr === 'Siap Donor' || statusStr === 'siap_donor') {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    } else if (statusStr === 'Dibatalkan' || statusStr === 'dibatalkan') {
      return 'bg-red-100 text-red-800 border-red-300';
    }
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusText = (status) => {
    const statusStr = typeof status === 'string' ? status : status?.toString() || '';
    
    if (statusStr === 'Selesai' || statusStr === 'selesai') return 'Selesai';
    if (statusStr === 'Siap Donor' || statusStr === 'siap_donor') return 'Siap Donor';
    if (statusStr === 'Dibatalkan' || statusStr === 'dibatalkan') return 'Dibatalkan';
    return statusStr;
  };

  const completedCount = histories.filter(h => {
    const status = typeof h.status === 'string' ? h.status : h.status?.toString() || '';
    return status === 'Selesai' || status === 'selesai';
  }).length;

  const scheduledCount = histories.filter(h => {
    const status = typeof h.status === 'string' ? h.status : h.status?.toString() || '';
    return status === 'Siap Donor' || status === 'siap_donor';
  }).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-red-500 to-red-600">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Riwayat Donasi</h3>
              <p className="text-sm text-red-100">Histori donor darah Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {histories.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-12 h-12 text-gray-300" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Riwayat</h4>
              <p className="text-gray-600">Anda belum memiliki riwayat donasi darah</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Card */}
              <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 border-2 border-red-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-red-600 font-medium mb-1">Total Donasi</p>
                    <p className="text-3xl font-bold text-red-700">{histories.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-red-600 font-medium mb-1">Selesai</p>
                    <p className="text-3xl font-bold text-green-600">{completedCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-red-600 font-medium mb-1">Terjadwal</p>
                    <p className="text-3xl font-bold text-blue-600">{scheduledCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-red-600 font-medium mb-1">Liter Darah</p>
                    <p className="text-3xl font-bold text-red-700">
                      {(completedCount * 0.45).toFixed(1)}L
                    </p>
                  </div>
                </div>
              </div>

              {/* History List */}
              <div className="space-y-3">
                {histories.map((history, index) => {
                  const statusStr = getStatusText(history.status);
                  const isCompleted = statusStr === 'Selesai';
                  const isScheduled = statusStr === 'Siap Donor';
                  
                  return (
                    <div
                      key={history.id}
                      className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-red-300 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-4">
                          {/* Number Badge */}
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-red-600 font-bold text-sm">{histories.length - index}</span>
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-bold text-gray-900">
                                {formatDate(history.tanggal_donor)}
                              </h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(history.status)}`}>
                                {statusStr}
                              </span>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>{formatTime(history.tanggal_donor)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>{history.lokasi}</span>
                              </div>
                            </div>

                            {history.catatan && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Catatan:</span> {history.catatan}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Icon */}
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                          ) : isScheduled ? (
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              <Clock className="w-6 h-6 text-gray-600" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendonorDashboard;