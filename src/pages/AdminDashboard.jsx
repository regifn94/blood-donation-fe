/**
 * AdminDashboard.jsx
 * Admin Dashboard with API Integration & AI Notifications
 * src/pages/admin/AdminDashboard.jsx
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Droplet, 
  Calendar, 
  Home, 
  UserPlus, 
  LogOut,
  AlertCircle,
  Edit,
  Package,
  X,
  Check,
  Clock,
  Bell
} from 'lucide-react';
import apiService from '../services/api';
import NotificationPanel from '../components/NotificationPanel';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State untuk dashboard stats
  const [stats, setStats] = useState({
    total_pendonor: 0,
    stok_kritis: 0,
    jadwal_minggu_ini: 0
  });
  
  // State untuk blood stocks
  const [bloodStocks, setBloodStocks] = useState([]);
  
  // State untuk donor list
  const [donors, setDonors] = useState([]);
  
  // State untuk blood requests
  const [bloodRequests, setBloodRequests] = useState([]);
  
  // Modal states
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [updateQuantity, setUpdateQuantity] = useState('');
  const [updatingStock, setUpdatingStock] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(false);
  
  // Get current user
  const currentUser = apiService.auth.getUser();

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const dashboardStats = await apiService.dashboard.getAdminDashboard();
      setStats(dashboardStats);
      
      // Fetch blood stocks
      const stocks = await apiService.bloodStock.getAll();
      setBloodStocks(stocks);
      
      // Fetch pendonors
      const pendonorList = await apiService.user.getAllPendonors();
      setDonors(pendonorList);
      
      // Fetch blood requests
      const requests = await apiService.bloodRequest.getAll();
      setBloodRequests(requests.filter(req => req.status === 'Pending'));
      
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

  // Handle stock update
  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!selectedStock || !updateQuantity) return;
    
    setUpdatingStock(true);
    try {
      await apiService.bloodStock.updateStock(
        selectedStock.gol_darah,
        parseInt(updateQuantity)
      );
      
      // Refresh data
      await fetchDashboardData();
      
      // Close modal and reset
      setShowUpdateModal(false);
      setSelectedStock(null);
      setUpdateQuantity('');
      
      // Show success message
      alert('Stok darah berhasil diperbarui!');
    } catch (err) {
      console.error('Error updating stock:', err);
      alert('Gagal memperbarui stok darah');
    } finally {
      setUpdatingStock(false);
    }
  };

  // Handle blood request status update
  const handleRequestStatusUpdate = async (requestId, status, catatan = null) => {
    setProcessingRequest(true);
    try {
      // Find the request details
      const request = bloodRequests.find(req => req.id === requestId);
      if (!request) {
        throw new Error('Permintaan tidak ditemukan');
      }

      // If approving, check stock availability first
      if (status === 'Disetujui') {
        const currentStock = bloodStocks.find(stock => stock.gol_darah === request.gol_darah);
        
        if (!currentStock) {
          alert(`Stok darah ${request.gol_darah} tidak tersedia!`);
          return;
        }

        if (currentStock.jumlah_kantong < request.jumlah_kantong) {
          alert(`Stok tidak mencukupi! Tersedia: ${currentStock.jumlah_kantong} kantong, Diminta: ${request.jumlah_kantong} kantong`);
          return;
        }

        // Update the request status
        await apiService.bloodRequest.updateStatus(requestId, status, catatan);
        
        // Reduce the blood stock
        const newQuantity = currentStock.jumlah_kantong - request.jumlah_kantong;
        await apiService.bloodStock.updateStock(request.gol_darah, newQuantity);
        
        // Show success message with stock info
        alert(`Permintaan disetujui! Stok ${request.gol_darah} berkurang ${request.jumlah_kantong} kantong. Sisa stok: ${newQuantity} kantong`);
      } else {
        // For rejection, just update status
        await apiService.bloodRequest.updateStatus(requestId, status, catatan);
        alert('Permintaan darah ditolak');
      }
      
      // Refresh all data to show updated stocks and requests
      await fetchDashboardData();
      
    } catch (err) {
      console.error('Error updating request:', err);
      alert(err.message || 'Gagal memproses permintaan darah');
    } finally {
      setProcessingRequest(false);
    }
  };

  // Open update modal
  const openUpdateModal = (stock) => {
    setSelectedStock(stock);
    setUpdateQuantity(stock.jumlah_kantong.toString());
    setShowUpdateModal(true);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <Droplet className="w-6 h-6 text-white" fill="currentColor" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Sistem Layanan Donor Darah
                </h1>
                <p className="text-sm text-gray-600">
                  RS Sentra Medika Minahasa Utara
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{currentUser?.nama}</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Pendonor */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Total Pendonor Terdaftar</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.total_pendonor}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Stok Kritis */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Stok Darah Kritis</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.stok_kritis}</h3>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Droplet className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Jadwal Minggu Ini */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Jadwal Donor Minggu Ini</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.jadwal_minggu_ini}</h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setShowUpdateModal(true)}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl transition shadow-lg hover:shadow-xl"
          >
            <Edit className="w-5 h-5" />
            <span className="font-semibold">Update Stok Darah</span>
          </button>
          
          <button
            onClick={() => setShowRequestsModal(true)}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-lg hover:shadow-xl"
          >
            <Package className="w-5 h-5" />
            <span className="font-semibold">Permintaan Darah ({bloodRequests.length})</span>
          </button>

          <button
            onClick={() => setShowNotificationPanel(true)}
            className="flex items-center justify-center gap-3 px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition shadow-lg hover:shadow-xl relative"
          >
            <Bell className="w-5 h-5" />
            <span className="font-semibold">Notification Center</span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></span>
          </button>
        </div>

        {/* Blood Stock Management */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-bold text-gray-900">Manajemen Stok Darah</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bloodStocks.map((stock) => (
              <div
                key={stock.gol_darah}
                className={`relative p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition ${
                  stock.status === 'Kritis'
                    ? 'bg-red-50 border-red-300'
                    : stock.status === 'Menipis'
                    ? 'bg-yellow-50 border-yellow-300'
                    : 'bg-green-50 border-green-300'
                }`}
                onClick={() => openUpdateModal(stock)}
              >
                <button
                  className="absolute top-2 right-2 p-1 hover:bg-white rounded-full transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    openUpdateModal(stock);
                  }}
                >
                  <Edit className="w-3 h-3 text-gray-600" />
                </button>
                
                <div className="flex items-start justify-between mb-2">
                  <span className="text-lg font-bold text-gray-900">
                    {stock.gol_darah}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      stock.status === 'Kritis'
                        ? 'bg-red-200 text-red-800'
                        : stock.status === 'Menipis'
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-green-200 text-green-800'
                    }`}
                  >
                    {stock.status}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stock.jumlah_kantong}
                  <span className="text-sm font-normal text-gray-600 ml-1">Kantong</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Donor Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-bold text-gray-900">Data Pendonor</h2>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gol. Darah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No. Telepon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donors.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      Belum ada data pendonor
                    </td>
                  </tr>
                ) : (
                  donors.slice(0, 10).map((donor) => (
                    <tr key={donor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{donor.nama}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                          {donor.gol_darah || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {donor.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {donor.no_telepon || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Aktif
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {donors.length > 10 && (
            <div className="px-6 py-4 border-t border-gray-100 text-center">
              <button className="text-red-600 hover:text-red-700 font-medium text-sm">
                Lihat Semua Pendonor ({donors.length})
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Update Stock Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Update Stok Darah</h3>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedStock(null);
                  setUpdateQuantity('');
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {selectedStock ? (
              <form onSubmit={handleUpdateStock}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Golongan Darah
                  </label>
                  <div className="px-4 py-3 bg-gray-100 rounded-lg font-semibold text-gray-900">
                    {selectedStock.gol_darah}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Kantong
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={updateQuantity}
                    onChange={(e) => setUpdateQuantity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Masukkan jumlah kantong"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Stok saat ini: {selectedStock.jumlah_kantong} kantong
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keterangan
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows="3"
                    placeholder="Opsional: Tambahkan catatan perubahan"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUpdateModal(false);
                      setSelectedStock(null);
                      setUpdateQuantity('');
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    disabled={updatingStock}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                    disabled={updatingStock}
                  >
                    {updatingStock ? 'Memperbarui...' : 'Update Now'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">
                  Pilih golongan darah yang ingin diperbarui:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {bloodStocks.map((stock) => (
                    <button
                      key={stock.gol_darah}
                      onClick={() => openUpdateModal(stock)}
                      className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-center"
                    >
                      <span className="font-semibold">{stock.gol_darah}</span>
                      <span className="block text-xs text-gray-500 mt-1">
                        {stock.jumlah_kantong} kantong
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Blood Requests Modal */}
      {showRequestsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Permintaan Darah</h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {bloodRequests.length} Pending
                </span>
              </div>
              <button
                onClick={() => setShowRequestsModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {bloodRequests.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Tidak ada permintaan darah pending</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bloodRequests.map((request) => {
                  // Get current stock for this blood type
                  const currentStock = bloodStocks.find(stock => stock.gol_darah === request.gol_darah);
                  const stockAvailable = currentStock ? currentStock.jumlah_kantong : 0;
                  const isStockSufficient = stockAvailable >= request.jumlah_kantong;
                  
                  return (
                    <div
                      key={request.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg font-semibold text-gray-900">
                              {request.nama_pasien}
                            </span>
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                              {request.gol_darah}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                              {request.jumlah_kantong} kantong
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Keperluan:</strong> {request.keperluan}
                          </p>
                          <div className="flex items-center gap-4 mb-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                              isStockSufficient 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              Stok Tersedia: {stockAvailable} kantong
                              {!isStockSufficient && ' (Tidak Mencukupi)'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(request.tanggal_request)}
                            </span>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                              Pending
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => {
                              if (isStockSufficient) {
                                if (confirm(`Setujui permintaan ${request.jumlah_kantong} kantong darah ${request.gol_darah} untuk ${request.nama_pasien}?\n\nStok akan berkurang dari ${stockAvailable} menjadi ${stockAvailable - request.jumlah_kantong} kantong.`)) {
                                  handleRequestStatusUpdate(request.id, 'Disetujui');
                                }
                              }
                            }}
                            disabled={processingRequest || !isStockSufficient}
                            className={`px-3 py-2 rounded-lg transition flex items-center gap-1 ${
                              isStockSufficient 
                                ? 'bg-green-600 text-white hover:bg-green-700' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            } disabled:opacity-50`}
                            title={!isStockSufficient ? 'Stok tidak mencukupi' : 'Setujui permintaan'}
                          >
                            <Check className="w-4 h-4" />
                            <span className="hidden sm:inline">Setujui</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Tolak permintaan darah untuk ${request.nama_pasien}?`)) {
                                handleRequestStatusUpdate(request.id, 'Ditolak', 'Stok tidak mencukupi');
                              }
                            }}
                            disabled={processingRequest}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-1"
                          >
                            <X className="w-4 h-4" />
                            <span className="hidden sm:inline">Tolak</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowRequestsModal(false)}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Panel */}
      {showNotificationPanel && (
        <NotificationPanel onClose={() => setShowNotificationPanel(false)} />
      )}
    </div>
  );
};

export default AdminDashboard;