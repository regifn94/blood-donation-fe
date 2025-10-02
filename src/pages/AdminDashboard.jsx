/**
 * AdminDashboard.jsx
 * Admin Dashboard with API Integration
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
  AlertCircle 
} from 'lucide-react';
import apiService from '../services/api';

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

  // Get blood stock status class
  const getStockClass = (status) => {
    switch (status) {
      case 'Kritis':
        return 'critical';
      case 'Menipis':
        return 'thin';
      case 'Aman':
        return 'safe';
      default:
        return 'safe';
    }
  };

  // Calculate donor status
  const getDonorStatus = (lastDonation) => {
    if (!lastDonation) return 'Siap Donor';
    
    const lastDate = new Date(lastDonation);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    if (lastDate <= threeMonthsAgo) {
      return 'Siap Donor';
    } else {
      return 'Masa Tunggu';
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

        {/* Blood Stock Management */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Home className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-bold text-gray-900">Manajemen Stok Darah</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bloodStocks.map((stock) => (
              <div
                key={stock.gol_darah}
                className={`p-4 rounded-lg border-2 ${
                  stock.status === 'Kritis'
                    ? 'bg-red-50 border-red-300'
                    : stock.status === 'Menipis'
                    ? 'bg-yellow-50 border-yellow-300'
                    : 'bg-green-50 border-green-300'
                }`}
              >
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
    </div>
  );
};

export default AdminDashboard;