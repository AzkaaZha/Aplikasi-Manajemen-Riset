import React from 'react';
import { Users, FileText, Activity } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Admin</h2>
        <p className="text-gray-500 mt-1">Ringkasan sistem manajemen riset</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Pengguna</p>
            <p className="text-2xl font-bold text-gray-900">12</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
            <Activity size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Penelitian</p>
            <p className="text-2xl font-bold text-gray-900">8</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
            <FileText size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Dokumen Dibuat</p>
            <p className="text-2xl font-bold text-gray-900">24</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center py-16">
        <p className="text-gray-500">Modul Manajemen Pengguna belum diimplementasikan di versi demo ini.</p>
      </div>
    </div>
  );
}
