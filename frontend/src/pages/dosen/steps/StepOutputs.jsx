import React, { useEffect, useState } from 'react';
import { documentApi } from '../../../lib/api';
import { PlusCircle, Trash2, Edit } from 'lucide-react';

export default function StepOutputs({ documentId }) {
  const [outputs, setOutputs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    kategori_luaran: 'wajib',
    tahun_luaran: new Date().getFullYear(),
    jenis_luaran: '',
    status_target: 'Accepted',
    keterangan: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchOutputs();
  }, [documentId]);

  const fetchOutputs = async () => {
    try {
      const res = await documentApi.getOutputs(documentId);
      setOutputs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, tahun_luaran: parseInt(form.tahun_luaran) };
      if (isEditing) {
        await documentApi.updateOutput(documentId, editId, payload);
      } else {
        await documentApi.addOutput(documentId, payload);
      }
      resetForm();
      fetchOutputs();
    } catch (err) {
      alert(err.response?.data?.detail || 'Gagal menyimpan luaran');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus luaran ini?')) return;
    try {
      await documentApi.deleteOutput(documentId, id);
      fetchOutputs();
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
      kategori_luaran: 'wajib',
      tahun_luaran: new Date().getFullYear(),
      jenis_luaran: '',
      status_target: 'Accepted',
      keterangan: ''
    });
    setIsEditing(false);
    setEditId(null);
  };

  if (loading) return <div className="text-center py-8">Memuat target luaran...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">Target Luaran</h3>
        <p className="text-gray-500 text-sm">Tentukan target luaran wajib dan tambahan.</p>
      </div>

      <form onSubmit={handleSave} className="bg-slate-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-4">{isEditing ? 'Edit Luaran' : 'Tambah Luaran'}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
            <select value={form.kategori_luaran} onChange={e => setForm({...form, kategori_luaran: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white">
              <option value="wajib">Wajib</option>
              <option value="tambahan">Tambahan</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tahun Target</label>
            <input required type="number" value={form.tahun_luaran} onChange={e => setForm({...form, tahun_luaran: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status Target</label>
            <select value={form.status_target} onChange={e => setForm({...form, status_target: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white">
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Accepted">Accepted</option>
              <option value="Published">Published</option>
              <option value="Paten Terdaftar">Paten Terdaftar</option>
              <option value="Paten Granted">Paten Granted</option>
            </select>
          </div>
          <div className="lg:col-span-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Jenis Luaran (Nama Jurnal/Konferensi/Paten dll)</label>
            <input required type="text" value={form.jenis_luaran} onChange={e => setForm({...form, jenis_luaran: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
          <div className="lg:col-span-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Keterangan (Opsional)</label>
            <textarea value={form.keterangan || ''} onChange={e => setForm({...form, keterangan: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" rows="2" />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
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
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Kategori & Tahun</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Jenis Luaran</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status Target</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {outputs.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Belum ada target luaran ditambahkan.</td></tr>
            ) : (
              outputs.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <span className={`inline-flex mb-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase ${r.kategori_luaran === 'wajib' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                      {r.kategori_luaran}
                    </span>
                    <div className="text-sm font-medium text-gray-900">Tahun {r.tahun_luaran}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{r.jenis_luaran}</div>
                    {r.keterangan && <div className="text-xs text-gray-500 mt-1">{r.keterangan}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-200">{r.status_target}</span>
                  </td>
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
