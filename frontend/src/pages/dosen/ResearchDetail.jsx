import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { researchApi } from '../../lib/api';
import { FileText, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';

export default function ResearchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await researchApi.getDocuments(id);
      setData(res.data);
    } catch (err) {
      setError('Gagal memuat detail penelitian.');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentAction = async (docType, docData) => {
    if (docData.is_created) {
      navigate(`/dosen/dokumen/${docData.id}`);
    } else {
      try {
        let res;
        if (docType === 'proposal') res = await researchApi.createProposal(id);
        else if (docType === 'laporan_kemajuan') res = await researchApi.createProgressReport(id);
        else if (docType === 'laporan_akhir') res = await researchApi.createFinalReport(id);
        
        if (res && res.data.document) {
          navigate(`/dosen/dokumen/${res.data.document.id}`);
        }
      } catch (err) {
        alert(err.response?.data?.detail || 'Gagal membuat dokumen.');
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat detail...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const { research, documents } = data;

  const docTypes = [
    { key: 'proposal', label: 'Proposal', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' },
    { key: 'laporan_kemajuan', label: 'Laporan Kemajuan', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
    { key: 'laporan_akhir', label: 'Laporan Akhir', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <button 
        onClick={() => navigate('/dosen/penelitian')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-medium transition"
      >
        <ArrowLeft size={20} />
        Kembali ke Daftar
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-8">
        <div className="flex justify-between items-start">
          <div>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-semibold rounded-full tracking-wide">
              {research.tahun}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">{research.judul_penelitian}</h1>
            <p className="text-gray-500">Status: <span className="font-medium capitalize text-gray-700">{research.status_penelitian}</span></p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">Dokumen Riset</h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        {docTypes.map((type) => {
          const docInfo = documents[type.key];
          const Icon = type.icon;
          const isCreated = docInfo.is_created;

          return (
            <div key={type.key} className={`bg-white rounded-2xl border ${isCreated ? type.border : 'border-gray-200'} p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col relative overflow-hidden group`}>
              {isCreated && <div className={`absolute top-0 left-0 w-1 h-full ${type.bg.replace('bg-', 'bg-').replace('100', '500')}`} />}
              
              <div className={`w-12 h-12 rounded-xl ${isCreated ? type.bg : 'bg-gray-100'} flex items-center justify-center mb-4`}>
                <Icon size={24} className={isCreated ? type.color : 'text-gray-400'} />
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-1">{type.label}</h3>
              <p className="text-sm text-gray-500 mb-6 flex-1">
                Akses dan kelola dokumen riset Anda di sini.
              </p>
              
              <button
                onClick={() => handleDocumentAction(type.key, docInfo)}
                className={`w-full py-2.5 px-4 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                  isCreated 
                    ? 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-gray-900' 
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                {isCreated ? 'Buka Dokumen' : 'Buat Dokumen'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
