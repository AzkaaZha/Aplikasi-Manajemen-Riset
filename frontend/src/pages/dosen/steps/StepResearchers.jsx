import React, { useEffect, useState } from 'react';
import { documentApi } from '../../../lib/api';
import { PlusCircle, Trash2, Edit } from 'lucide-react';

export default function StepResearchers({ documentId }) {
  const [researchers, setResearchers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    nama: '',
    peran: 'anggota',
    institusi: '',
    program_studi: '',
    bidang_tugas: '',
    id_sinta: '',
    h_index: '',
    nidn_nip_nim: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchResearchers();
  }, [documentId]);

  const fetchResearchers = async () => {
    try {
      const res = await documentApi.getResearchers(documentId);
      setResearchers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, h_index: form.h_index ? parseInt(form.h_index) : 0 };
      if (isEditing) {
        await documentApi.updateResearcher(documentId, editId, payload);
      } else {
        await documentApi.addResearcher(documentId, payload);
      }
      resetForm();
      fetchResearchers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Gagal menyimpan data peneliti');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus peneliti ini?')) return;
    try {
      await documentApi.deleteResearcher(documentId, id);
      fetchResearchers();
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
      nama: '', peran: 'anggota', institusi: '', program_studi: '',
      bidang_tugas: '', id_sinta: '', h_index: '', nidn_nip_nim: ''
    });
    setIsEditing(false);
    setEditId(null);
  };

  if (loading) return <div className="text-center py-8">Memuat data peneliti...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">Pengusul / Peneliti</h3>
        <p className="text-gray-500 text-sm">Kelola daftar ketua dan anggota peneliti.</p>
      </div>

      <form onSubmit={handleSave} className="bg-slate-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-4">{isEditing ? 'Edit Peneliti' : 'Tambah Peneliti'}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input required type="text" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Peran</label>
            <select value={form.peran} onChange={e => setForm({...form, peran: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white">
              <option value="ketua">Ketua</option>
              <option value="anggota">Anggota</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Institusi</label>
            <input type="text" value={form.institusi} onChange={e => setForm({...form, institusi: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Program Studi</label>
            <input type="text" value={form.program_studi} onChange={e => setForm({...form, program_studi: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Bidang Tugas</label>
            <input type="text" value={form.bidang_tugas} onChange={e => setForm({...form, bidang_tugas: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">NIDN / NIP / NIM</label>
            <input type="text" value={form.nidn_nip_nim} onChange={e => setForm({...form, nidn_nip_nim: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">ID Sinta</label>
              <input type="text" value={form.id_sinta} onChange={e => setForm({...form, id_sinta: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">H-Index</label>
              <input type="number" value={form.h_index} onChange={e => setForm({...form, h_index: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
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
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Peran</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Institusi</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tugas</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {researchers.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Belum ada peneliti ditambahkan.</td></tr>
            ) : (
              researchers.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{r.nama}</div>
                    <div className="text-xs text-gray-500">{r.nidn_nip_nim}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${r.peran === 'ketua' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {r.peran}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{r.institusi}<br/><span className="text-xs">{r.program_studi}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{r.bidang_tugas}</td>
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
