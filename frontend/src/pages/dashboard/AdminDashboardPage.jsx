import React from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import DashboardStatsSection from '../../components/dashboard/DashboardStatsSection';
import DashboardContentCard from '../../components/dashboard/DashboardContentCard';

const AdminDashboardPage = () => {
  const dummyStats = [
    { title: 'Total Pengguna', value: '124', icon: 'bi-people', colorClass: 'primary' },
    { title: 'Total Penelitian', value: '45', icon: 'bi-journal-text', colorClass: 'success' },
    { title: 'Dokumen Dibuat', value: '312', icon: 'bi-file-earmark-text', colorClass: 'warning' },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="mb-4">
        <h2 className="fs-4 fw-bold text-dark mb-1">Dashboard Admin</h2>
        <p className="text-secondary mb-0">Ringkasan sistem manajemen riset</p>
      </div>

      <DashboardStatsSection stats={dummyStats} />

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