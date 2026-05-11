import React, { useEffect, useState } from 'react';
import { documentApi } from '../../../lib/api';
import { PlusCircle, Trash2, Edit } from 'lucide-react';

export default function StepSchedules({ documentId }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    nama_kegiatan: '',
    bulan_1: 0, bulan_2: 0, bulan_3: 0, bulan_4: 0, bulan_5: 0, bulan_6: 0,
    bulan_7: 0, bulan_8: 0, bulan_9: 0, bulan_10: 0, bulan_11: 0, bulan_12: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchSchedules();
  }, [documentId]);

  const fetchSchedules = async () => {
    try {
      const res = await documentApi.getSchedules(documentId);
      setSchedules(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await documentApi.updateSchedule(documentId, editId, form);
      } else {
        await documentApi.addSchedule(documentId, form);
      }
      resetForm();
      fetchSchedules();
    } catch (err) {
      alert(err.response?.data?.detail || 'Gagal menyimpan data jadwal');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus jadwal ini?')) return;
    try {
      await documentApi.deleteSchedule(documentId, id);
      fetchSchedules();
    } catch (err) {
      alert('Gagal menghapus');
    }
  };

  const handleEdit = (r) => {
    setForm(r);
    setEditId(r.id);
    setIsEditing(true);
  };

  const resetForm = () => {
    setForm({
      nama_kegiatan: '',
      bulan_1: 0, bulan_2: 0, bulan_3: 0, bulan_4: 0, bulan_5: 0, bulan_6: 0,
      bulan_7: 0, bulan_8: 0, bulan_9: 0, bulan_10: 0, bulan_11: 0, bulan_12: 0
    });
    setIsEditing(false);
    setEditId(null);
  };

  const toggleBulan = (bulanKey) => {
    setForm(prev => ({ ...prev, [bulanKey]: prev[bulanKey] ? 0 : 1 }));
  };

  if (loading) return <div className="text-center py-8">Memuat data jadwal...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">Jadwal Kegiatan</h3>
        <p className="text-gray-500 text-sm">Buat rincian jadwal pelaksanaan per bulan.</p>
      </div>

      <form onSubmit={handleSave} className="bg-slate-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-4">{isEditing ? 'Edit Jadwal' : 'Tambah Jadwal'}</h4>
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">Nama Kegiatan</label>
          <input required type="text" value={form.nama_kegiatan} onChange={e => setForm({...form, nama_kegiatan: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Bulan Pelaksanaan (Klik untuk memilih)</label>
          <div className="flex flex-wrap gap-2">
            {[...Array(12)].map((_, i) => {
              const b = `bulan_${i+1}`;
              const active = form[b] === 1;
              return (
                <button
                  key={b} type="button" onClick={() => toggleBulan(b)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >
                  B{i+1}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          {isEditing && <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg">Batal</button>}
          <button type="submit" className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg">
            <PlusCircle size={16} /> {isEditing ? 'Simpan Perubahan' : 'Tambah'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase whitespace-nowrap">Nama Kegiatan</th>
              {[...Array(12)].map((_, i) => <th key={i} className="px-2 py-3 text-center font-semibold text-gray-500 uppercase">B{i+1}</th>)}
              <th className="px-4 py-3 text-right font-semibold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {schedules.length === 0 ? (
              <tr><td colSpan="14" className="px-6 py-8 text-center text-gray-500">Belum ada jadwal ditambahkan.</td></tr>
            ) : (
              schedules.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.nama_kegiatan}</td>
                  {[...Array(12)].map((_, i) => (
                    <td key={i} className="px-2 py-3 text-center">
                      {r[`bulan_${i+1}`] === 1 ? <div className="w-4 h-4 rounded bg-blue-500 mx-auto"></div> : <div className="w-4 h-4 rounded border border-gray-200 bg-gray-50 mx-auto"></div>}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right font-medium">
                    <button onClick={() => handleEdit(r)} className="text-blue-600 hover:text-blue-900 mr-3"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
