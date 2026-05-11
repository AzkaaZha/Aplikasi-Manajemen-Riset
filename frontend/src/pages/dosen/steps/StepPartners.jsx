import React, { useEffect, useState } from 'react';
import { documentApi } from '../../../lib/api';
import { PlusCircle, Trash2, Edit } from 'lucide-react';

export default function StepPartners({ documentId }) {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    nama_mitra: '',
    institusi_mitra: '',
    alamat_mitra: '',
    email_mitra: '',
    peran_mitra: '',
    dana_kontribusi: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchPartners();
  }, [documentId]);

  const fetchPartners = async () => {
    try {
      const res = await documentApi.getPartners(documentId);
      setPartners(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, dana_kontribusi: parseFloat(form.dana_kontribusi) || 0 };
      if (isEditing) {
        await documentApi.updatePartner(documentId, editId, payload);
      } else {
        await documentApi.addPartner(documentId, payload);
      }
      resetForm();
      fetchPartners();
    } catch (err) {
      alert(err.response?.data?.detail || 'Gagal menyimpan data mitra');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus mitra ini?')) return;
    try {
      await documentApi.deletePartner(documentId, id);
      fetchPartners();
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
      nama_mitra: '', institusi_mitra: '', alamat_mitra: '',
      email_mitra: '', peran_mitra: '', dana_kontribusi: ''
    });
    setIsEditing(false);
    setEditId(null);
  };

  if (loading) return <div className="text-center py-8">Memuat data mitra...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">Mitra Penelitian</h3>
        <p className="text-gray-500 text-sm">Kelola daftar instansi atau individu yang menjadi mitra.</p>
      </div>

      <form onSubmit={handleSave} className="bg-slate-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-4">{isEditing ? 'Edit Mitra' : 'Tambah Mitra'}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nama Mitra (Person In Charge)</label>
            <input required type="text" value={form.nama_mitra} onChange={e => setForm({...form, nama_mitra: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Institusi / Perusahaan</label>
            <input required type="text" value={form.institusi_mitra} onChange={e => setForm({...form, institusi_mitra: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Alamat Mitra</label>
            <input type="text" value={form.alamat_mitra} onChange={e => setForm({...form, alamat_mitra: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email_mitra} onChange={e => setForm({...form, email_mitra: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Dana Kontribusi (Rp)</label>
            <input type="number" value={form.dana_kontribusi} onChange={e => setForm({...form, dana_kontribusi: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Peran / Keterlibatan</label>
            <input type="text" required value={form.peran_mitra} onChange={e => setForm({...form, peran_mitra: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          {isEditing && <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg">Batal</button>}
          <button type="submit" className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg">
            <PlusCircle size={16} /> {isEditing ? 'Simpan Perubahan' : 'Tambah'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Institusi & Nama</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Peran</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Kontribusi (Rp)</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {partners.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Belum ada mitra ditambahkan.</td></tr>
            ) : (
              partners.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{r.institusi_mitra}</div>
                    <div className="text-xs text-gray-500">{r.nama_mitra} - {r.email_mitra}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{r.peran_mitra}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.dana_kontribusi > 0 ? r.dana_kontribusi.toLocaleString('id-ID') : '-'}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
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
