import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import DashboardStatsSection from '../../components/dashboard/DashboardStatsSection';
import DashboardContentCard from '../../components/dashboard/DashboardContentCard';
import { authApiClient, documentApiClient } from '../../api/axiosClient';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState([
    { title: 'Total Pengguna', value: '0', icon: 'bi-people', colorClass: 'primary' },
    { title: 'Total Penelitian', value: '0', icon: 'bi-journal-text', colorClass: 'success' },
    { title: 'Dokumen Dibuat', value: '0', icon: 'bi-file-earmark-text', colorClass: 'warning' },
  ]);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const [usersRes, documentStatsRes] = await Promise.all([
          authApiClient.get('/users/'),
          documentApiClient.get('/researches/admin/dashboard-stats'),
        ]);

        setStats([
          {
            title: 'Total Pengguna',
            value: String(usersRes.data?.length || 0),
            icon: 'bi-people',
            colorClass: 'primary',
          },
          {
            title: 'Total Penelitian',
            value: String(documentStatsRes.data?.total_penelitian || 0),
            icon: 'bi-journal-text',
            colorClass: 'success',
          },
          {
            title: 'Dokumen Dibuat',
            value: String(documentStatsRes.data?.total_dokumen || 0),
            icon: 'bi-file-earmark-text',
            colorClass: 'warning',
          },
        ]);
      } catch (error) {
        console.error('Gagal mengambil data dashboard admin:', error);
      }
    };

    fetchAdminStats();
  }, []);

  return (
    <AdminLayout title="Dashboard">
      <div className="mb-4">
        <h2 className="fs-4 fw-bold text-dark mb-1">Dashboard Admin</h2>
        <p className="text-secondary mb-0">Ringkasan sistem manajemen riset</p>
      </div>

      <DashboardStatsSection stats={stats} />

      <DashboardContentCard>
        <div className="empty-state">
          <i className="bi bi-tools"></i>
          <p>Modul Manajemen Pengguna belum diimplementasikan di versi demo ini.</p>
        </div>
      </DashboardContentCard>
    </AdminLayout>
  );
};

export default AdminDashboardPage;