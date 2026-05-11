import React from 'react';
import { documentApi } from '../../../lib/api';
import { Download, CheckCircle2, Save } from 'lucide-react';

export default function StepPreview({ documentId, handleSaveSubstansi, isSaving }) {
  const handleExportPdf = async () => {
    try {
      const res = await documentApi.exportPdf(documentId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dokumen_${documentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      alert('Gagal mengekspor PDF.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-2xl mx-auto py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mb-8 shadow-inner">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-4">Pengisian Selesai!</h3>
        <p className="text-lg text-gray-600 mb-10 leading-relaxed">
          Anda telah melengkapi semua langkah yang diperlukan. Pastikan Anda menyimpan perubahan terakhir sebelum mengekspor dokumen ke format PDF.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={handleSaveSubstansi}
            disabled={isSaving}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition shadow-sm disabled:opacity-50"
          >
            <Save size={22} />
            {isSaving ? 'Menyimpan...' : 'Simpan Draft Terakhir'}
          </button>
          
          <button 
            onClick={handleExportPdf}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition shadow-md"
          >
            <Download size={22} /> Ekspor PDF Resmi
          </button>
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100 text-left">
          <h4 className="font-bold text-blue-900 mb-2">Informasi Penting:</h4>
          <ul className="text-blue-800 text-sm space-y-2 list-disc pl-4">
            <li>Dokumen PDF yang dihasilkan akan mengikuti template resmi STT Terpadu Nurul Fikri.</li>
            <li>Anda tetap dapat mengedit kembali data selama status dokumen masih "Draft".</li>
            <li>Pastikan koneksi internet stabil saat mengunduh PDF.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
