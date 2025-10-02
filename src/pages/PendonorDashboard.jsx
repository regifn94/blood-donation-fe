/**
 * PendonorDashboard.jsx
 * Blood Requester Dashboard with API Integration
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
  XCircle
} from 'lucide-react';
import apiService from '../services/api';

const PendonorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bloodStocks, setBloodStocks] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  
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
          <button className="bg-white hover:bg-gray-50 rounded-xl shadow-lg p-6 text-left transition border-2 border-transparent hover:border-red-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Riwayat Donasi</h3>
            </div>
            <p className="text-sm text-gray-600">Lihat riwayat donasi darah Anda</p>
          </button>

          <button 
            onClick={() => setShowRequestForm(true)}
            className="bg-red-600 hover:bg-red-700 rounded-xl shadow-lg p-6 text-left transition border-2 border-red-700"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <Droplet className="w-6 h-6 text-red-600" fill="currentColor" />
              </div>
              <h3 className="text-lg font-bold text-white">Buat Jadwal Donor</h3>
            </div>
            <p className="text-sm text-red-100">Ajukan permintaan donor darah</p>
          </button>

          <button className="bg-white hover:bg-gray-50 rounded-xl shadow-lg p-6 text-left transition border-2 border-transparent hover:border-red-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
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
    </div>
  );
};

// ==================== Request Blood Modal Component ====================
const RequestBloodModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    gol_darah: '',
    jumlah_kantong: 1,
    keperluan: '',
    nama_pasien: '',
    rumah_sakit: 'RS Sentra Medika Minahasa Utara'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.gol_darah || !formData.nama_pasien || !formData.keperluan) {
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">Ajukan Permintaan Darah</h3>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Golongan Darah */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Golongan Darah <span className="text-red-600">*</span>
              </label>
              <select
                name="gol_darah"
                value={formData.gol_darah}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="">Pilih golongan darah</option>
                {bloodTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Jumlah Kantong */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Kantong <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="jumlah_kantong"
                value={formData.jumlah_kantong}
                onChange={handleChange}
                min="1"
                max="10"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            {/* Nama Pasien */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Pasien <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="nama_pasien"
                value={formData.nama_pasien}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Nama lengkap pasien"
                required
              />
            </div>

            {/* Keperluan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keperluan <span className="text-red-600">*</span>
              </label>
              <textarea
                name="keperluan"
                value={formData.keperluan}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="Jelaskan keperluan darah (operasi, transfusi, dll)"
                rows="3"
                required
              />
            </div>

            {/* Rumah Sakit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rumah Sakit
              </label>
              <input
                type="text"
                name="rumah_sakit"
                value={formData.rumah_sakit}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  'Kirim Permintaan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PendonorDashboard;