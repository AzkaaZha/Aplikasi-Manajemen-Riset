import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { researchApi } from '../../lib/api';
import { PlusCircle, Search, Calendar, ChevronRight, Filter, SortAsc, Trash2 } from 'lucide-react';

export default function ResearchList() {
  const [researches, setResearches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newYear, setNewYear] = useState(new Date().getFullYear().toString());
  
  // Filter & Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [sortBy, setSortBy] = useState('terbaru');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchResearches();
  }, []);

  const fetchResearches = async () => {
    try {
      const res = await researchApi.getAll();
      setResearches(res.data);
    } catch (error) {
      console.error('Failed to fetch researches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await researchApi.create({
        judul_penelitian: newTitle,
        tahun: newYear
      });
      setResearches([res.data, ...researches]);
      setShowModal(false);
      setNewTitle('');
    } catch (error) {
      console.error('Failed to create research:', error);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevent navigating to detail
    if (window.confirm('Apakah Anda yakin ingin menghapus penelitian ini beserta seluruh dokumen di dalamnya?')) {
      try {
        await researchApi.delete(id);
        setResearches(researches.filter(r => r.id !== id));
      } catch (error) {
        console.error('Failed to delete research:', error);
        alert('Gagal menghapus penelitian.');
      }
    }
  };

  // Process data (Filter & Sort)
  const getProcessedResearches = () => {
    let result = [...researches];

    // Filter by Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r => r.judul_penelitian.toLowerCase().includes(query));
    }

    // Filter by Status
    if (statusFilter !== 'semua') {
      result = result.filter(r => r.status_penelitian === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'terbaru') {
        return parseInt(b.tahun) - parseInt(a.tahun);
      } else if (sortBy === 'terlama') {
        return parseInt(a.tahun) - parseInt(b.tahun);
      } else if (sortBy === 'judul-az') {
        return a.judul_penelitian.localeCompare(b.judul_penelitian);
      }
      return 0;
    });

    return result;
  };

  const processedResearches = getProcessedResearches();

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat data penelitian...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daftar Penelitian</h2>
          <p className="text-gray-500 mt-1">Kelola seluruh kegiatan penelitian Anda</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-sm font-medium whitespace-nowrap"
        >
          <PlusCircle size={20} />
          Tambah Penelitian
        </button>
      </div>

      {researches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-500 mb-4">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum ada penelitian</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">Mulai perjalanan riset Anda dengan menambahkan entri penelitian baru ke dalam sistem.</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-blue-600 font-medium hover:text-blue-700"
          >
            + Buat Penelitian Pertama
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          
          {/* Controls Bar */}
          <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col lg:flex-row gap-4 justify-between items-center">
            
            {/* Search */}
            <div className="relative w-full lg:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari judul penelitian..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition"
              />
            </div>

            {/* Filters & Sort */}
            <div className="flex w-full lg:w-auto items-center gap-3">
              <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition">
                <Filter size={16} className="text-gray-400 mr-2" />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent border-none text-sm text-gray-700 focus:outline-none cursor-pointer pr-4"
                >
                  <option value="semua">Semua Status</option>
                  <option value="berjalan">Berjalan</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>
              
              <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition">
                <SortAsc size={16} className="text-gray-400 mr-2" />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-sm text-gray-700 focus:outline-none cursor-pointer pr-4"
                >
                  <option value="terbaru">Tahun Terbaru</option>
                  <option value="terlama">Tahun Terlama</option>
                  <option value="judul-az">Judul (A-Z)</option>
                </select>
              </div>
            </div>

          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                    No
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Judul Penelitian
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                    Tahun
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-4 w-32">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processedResearches.length > 0 ? (
                  processedResearches.map((r, index) => (
                    <tr 
                      key={r.id} 
                      className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/dosen/penelitian/${r.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {r.judul_penelitian}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar size={14} className="mr-1.5 text-gray-400" />
                          {r.tahun}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                          r.status_penelitian === 'selesai' ? 'bg-green-100 text-green-700 border border-green-200' :
                          r.status_penelitian === 'berjalan' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {r.status_penelitian.charAt(0).toUpperCase() + r.status_penelitian.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-3">
                          <div className="text-blue-600 hover:text-blue-900 inline-flex items-center">
                            Detail <ChevronRight size={16} className="ml-1" />
                          </div>
                          <button
                            onClick={(e) => handleDelete(e, r.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                            title="Hapus Penelitian"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      Tidak ada penelitian yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Penelitian Baru</h3>
            <form onSubmit={handleCreate}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul Penelitian</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="Masukkan judul..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Pelaksanaan</label>
                  <input
                    type="text"
                    required
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition shadow-sm"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
