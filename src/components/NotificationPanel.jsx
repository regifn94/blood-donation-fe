/**
 * NotificationPanel.jsx
 * AI-Powered Notification Management Panel for Admin
 * src/components/NotificationPanel.jsx
 */

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Mail,
  Zap,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader,
  X,
  Sparkles,
  Clock,
  BarChart3,
  Users
} from 'lucide-react';
import apiService from '../services/api';

const NotificationPanel = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('quick-actions');
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Form states
  const [testEmail, setTestEmail] = useState('');
  const [customForm, setCustomForm] = useState({
    email: '',
    subject: '',
    message: '',
    use_ai: false
  });

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      setStatusLoading(true);
      const status = await apiService.notifications.getStatus();
      setSystemStatus(status);
    } catch (error) {
      console.error('Error fetching notification status:', error);
      showNotification('error', 'Gagal memuat status sistem');
    } finally {
      setStatusLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification({ type: '', message: '' });
    }, 5000);
  };

  // ==================== Quick Actions ====================

  const handleTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmail) {
      showNotification('error', 'Masukkan email terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.notifications.testEmail(testEmail);
      if (result.success) {
        showNotification('success', '✅ Email test berhasil dikirim!');
        setTestEmail('');
      } else {
        showNotification('error', 'Gagal mengirim email test');
      }
    } catch (error) {
      showNotification('error', error.response?.data?.detail || 'Gagal mengirim email');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerStockCheck = async () => {
    setLoading(true);
    try {
      await apiService.notifications.triggerStockCheck();
      showNotification('success', '✅ Pengecekan stok darah triggered! Email akan dikirim jika ada stok yang menipis.');
    } catch (error) {
      showNotification('error', error.response?.data?.detail || 'Gagal trigger stock check');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerReminders = async () => {
    setLoading(true);
    try {
      await apiService.notifications.triggerReminders();
      showNotification('success', '✅ Pengingat donor triggered! Email akan dikirim ke pendonor dengan jadwal dekat.');
    } catch (error) {
      showNotification('error', error.response?.data?.detail || 'Gagal trigger reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerWeeklySummary = async () => {
    setLoading(true);
    try {
      await apiService.notifications.triggerWeeklySummary();
      showNotification('success', '✅ Ringkasan mingguan berhasil dikirim ke admin!');
    } catch (error) {
      showNotification('error', error.response?.data?.detail || 'Gagal mengirim ringkasan');
    } finally {
      setLoading(false);
    }
  };

  // ==================== Custom Notification ====================

  const handleSendCustom = async (e) => {
    e.preventDefault();
    
    if (!customForm.email || !customForm.subject || !customForm.message) {
      showNotification('error', 'Semua field wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.notifications.sendCustom(customForm);
      
      if (result.success) {
        showNotification(
          'success', 
          customForm.use_ai 
            ? '✅ Notifikasi berhasil dikirim dengan AI enhancement!' 
            : '✅ Notifikasi berhasil dikirim!'
        );
        setCustomForm({ email: '', subject: '', message: '', use_ai: false });
      } else {
        showNotification('error', 'Gagal mengirim notifikasi');
      }
    } catch (error) {
      showNotification('error', error.response?.data?.detail || 'Gagal mengirim notifikasi');
    } finally {
      setLoading(false);
    }
  };

  const formatNextRun = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    const now = new Date();
    const diff = date - now;
    
    if (diff < 0) return 'Overdue';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      return `${Math.floor(hours / 24)} hari lagi`;
    } else if (hours > 0) {
      return `${hours} jam ${minutes} menit lagi`;
    } else {
      return `${minutes} menit lagi`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Notification Center</h3>
                <p className="text-sm text-blue-100">AI-Powered Email Notifications</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Notification Alert */}
        {notification.message && (
          <div className={`mx-6 mt-4 p-4 rounded-lg border-2 flex items-start gap-3 ${
            notification.type === 'success'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm font-medium ${
              notification.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {notification.message}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="px-6 pt-4 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('quick-actions')}
              className={`px-4 py-2 font-medium rounded-t-lg transition ${
                activeTab === 'quick-actions'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Quick Actions
              </span>
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-4 py-2 font-medium rounded-t-lg transition ${
                activeTab === 'custom'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Custom Message
              </span>
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`px-4 py-2 font-medium rounded-t-lg transition ${
                activeTab === 'status'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                System Status
              </span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Quick Actions Tab */}
          {activeTab === 'quick-actions' && (
            <div className="space-y-6">
              {/* Test Email */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 mb-1">Test Email System</h4>
                    <p className="text-sm text-gray-600">
                      Kirim email test untuk memastikan konfigurasi SMTP berfungsi dengan baik
                    </p>
                  </div>
                </div>
                <form onSubmit={handleTestEmail} className="flex gap-3">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="flex-1 px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send Test
                  </button>
                </form>
              </div>

              {/* Trigger Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Stock Check */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Stock Alert</h4>
                      <p className="text-sm text-gray-600">
                        Cek stok darah dan kirim alert jika menipis
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleTriggerStockCheck}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    Trigger Stock Check
                  </button>
                </div>

                {/* Donation Reminders */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Donation Reminders</h4>
                      <p className="text-sm text-gray-600">
                        Kirim pengingat ke pendonor dengan jadwal dekat
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleTriggerReminders}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send Reminders
                  </button>
                </div>

                {/* Weekly Summary */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Weekly Summary</h4>
                      <p className="text-sm text-gray-600">
                        Kirim ringkasan mingguan ke semua admin
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleTriggerWeeklySummary}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    Send Summary
                  </button>
                </div>

                {/* Refresh Status */}
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border-2 border-gray-200">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Loader className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Refresh Status</h4>
                      <p className="text-sm text-gray-600">
                        Update status sistem notifikasi
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={fetchSystemStatus}
                    disabled={statusLoading}
                    className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    {statusLoading ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Loader className="w-4 h-4" />
                    )}
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom Message Tab */}
          {activeTab === 'custom' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">Custom Notification</h4>
                    <p className="text-sm text-gray-600">
                      Kirim notifikasi custom dengan atau tanpa AI enhancement
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSendCustom} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Penerima
                    </label>
                    <input
                      type="email"
                      value={customForm.email}
                      onChange={(e) => setCustomForm({ ...customForm, email: e.target.value })}
                      placeholder="recipient@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={customForm.subject}
                      onChange={(e) => setCustomForm({ ...customForm, subject: e.target.value })}
                      placeholder="Email subject"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      value={customForm.message}
                      onChange={(e) => setCustomForm({ ...customForm, message: e.target.value })}
                      placeholder="Your message here..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows="6"
                      required
                    />
                  </div>

                  {/* AI Toggle */}
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <input
                      type="checkbox"
                      id="use_ai"
                      checked={customForm.use_ai}
                      onChange={(e) => setCustomForm({ ...customForm, use_ai: e.target.checked })}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="use_ai" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-gray-900">Enhance with AI</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Gunakan Gemini AI untuk membuat pesan lebih profesional dan ramah
                      </p>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-bold transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Kirim Notifikasi</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* System Status Tab */}
          {activeTab === 'status' && (
            <div className="space-y-6">
              {statusLoading ? (
                <div className="text-center py-12">
                  <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading system status...</p>
                </div>
              ) : systemStatus ? (
                <>
                  {/* System Status */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">Background Tasks Status</h4>
                        <p className="text-sm text-gray-600">
                          Status: <span className="font-semibold text-green-600">
                            {systemStatus.background_tasks_running ? 'Running' : 'Stopped'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Jobs */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Scheduled Jobs</h4>
                    <div className="space-y-3">
                      {systemStatus.scheduler_jobs && systemStatus.scheduler_jobs.length > 0 ? (
                        systemStatus.scheduler_jobs.map((job, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-blue-300 transition"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Clock className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <h5 className="font-semibold text-gray-900">{job.id}</h5>
                                  <p className="text-sm text-gray-600">
                                    Next run: {formatNextRun(job.next_run)}
                                  </p>
                                </div>
                              </div>
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                Active
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No scheduled jobs</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                  <p className="text-gray-600">Failed to load system status</p>
                  <button
                    onClick={fetchSystemStatus}
                    className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Powered by Gemini AI</span>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;