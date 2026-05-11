import React, { useEffect, useState } from 'react';
import { documentApi } from '../../../lib/api';
import { PlusCircle, Trash2, Edit } from 'lucide-react';

export default function StepBudgets({ documentId }) {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    jenis_pembelanjaan: 'Bahan',
    item: '',
    satuan: '',
    volume: 1,
    biaya_satuan: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchBudgets();
  }, [documentId]);

  const fetchBudgets = async () => {
    try {
      const res = await documentApi.getBudgets(documentId);
      setBudgets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const total = parseInt(form.volume) * parseFloat(form.biaya_satuan);
      const payload = { 
        ...form, 
        volume: parseInt(form.volume), 
        biaya_satuan: parseFloat(form.biaya_satuan),
        total: total
      };
      
      if (isEditing) {
        await documentApi.updateBudget(documentId, editId, payload);
      } else {
        await documentApi.addBudget(documentId, payload);
      }
      resetForm();
      fetchBudgets();
    } catch (err) {
      alert(err.response?.data?.detail || 'Gagal menyimpan anggaran');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus anggaran ini?')) return;
    try {
      await documentApi.deleteBudget(documentId, id);
      fetchBudgets();
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
      jenis_pembelanjaan: 'Bahan', item: '', satuan: '', volume: 1, biaya_satuan: 0
    });
    setIsEditing(false);
    setEditId(null);
  };

  const formatRp = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  const totalAll = budgets.reduce((sum, b) => sum + parseFloat(b.total), 0);

  if (loading) return <div className="text-center py-8">Memuat anggaran...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Rencana Anggaran Biaya (RAB)</h3>
          <p className="text-gray-500 text-sm">Masukkan rincian anggaran yang dibutuhkan.</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Anggaran</p>
          <p className="text-2xl font-bold text-blue-600">{formatRp(totalAll)}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-slate-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-4">{isEditing ? 'Edit Anggaran' : 'Tambah Anggaran'}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">Jenis</label>
            <select value={form.jenis_pembelanjaan} onChange={e => setForm({...form, jenis_pembelanjaan: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white">
              <option value="Bahan">Bahan</option>
              <option value="Pengumpulan Data">Pengumpulan Data</option>
              <option value="Sewa Peralatan">Sewa Peralatan</option>
              <option value="Analisis Data">Analisis Data</option>
              <option value="Pelaporan, Luaran">Pelaporan, Luaran</option>
              <option value="Honorarium">Honorarium</option>
            </select>
          </div>
          <div className="lg:col-span-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">Item</label>
            <input required type="text" value={form.item} onChange={e => setForm({...form, item: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
          <div className="lg:col-span-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">Satuan (Rim, Paket, dll)</label>
            <input required type="text" value={form.satuan} onChange={e => setForm({...form, satuan: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
          <div className="lg:col-span-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">Volume</label>
            <input required type="number" min="1" value={form.volume} onChange={e => setForm({...form, volume: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
          <div className="lg:col-span-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">Harga Satuan (Rp)</label>
            <input required type="number" min="0" value={form.biaya_satuan} onChange={e => setForm({...form, biaya_satuan: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2 items-center">
          <div className="mr-auto text-sm text-gray-500">
            Total Item ini: <span className="font-bold text-gray-900">{formatRp((form.volume || 0) * (form.biaya_satuan || 0))}</span>
          </div>
          {isEditing && <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg">Batal</button>}
          <button type="submit" className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg">
            <PlusCircle size={16} /> {isEditing ? 'Simpan' : 'Tambah'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Jenis & Item</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Vol & Satuan</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Harga Satuan</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {budgets.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Belum ada rincian anggaran ditambahkan.</td></tr>
            ) : (
              budgets.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <span className="inline-flex mb-1 px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-600 rounded-md uppercase tracking-wider">{r.jenis_pembelanjaan}</span>
                    <div className="text-sm font-medium text-gray-900">{r.item}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-right">{r.volume} {r.satuan}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-right">{formatRp(r.biaya_satuan)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">{formatRp(r.total)}</td>
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
