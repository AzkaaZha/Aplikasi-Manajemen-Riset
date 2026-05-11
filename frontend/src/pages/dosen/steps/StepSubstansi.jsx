import React, { useMemo, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import api from '../../../lib/api';

export default function StepSubstansi({ fields, contents, handleContentChange }) {
  const quillRef = useRef(null);

  const getPlaceholder = (fieldName, label) => {
    switch (fieldName) {
      case 'ringkasan':
        return 'Ringkasan berisi uraian singkat mengenai tujuan, metode, dan hasil yang diharapkan dari penelitian ini...';
      case 'latar_belakang':
        return 'Latar belakang berisi penjelasan mengenai fenomena, masalah utama, urgensi riset, serta kaitannya dengan kondisi saat ini...';
      case 'tinjauan_pustaka':
        return 'Tinjauan pustaka berisi kajian teori, literatur terdahulu, serta state of the art yang mendasari penelitian ini...';
      case 'metode_penelitian':
        return 'Metode berisi penjelasan alur riset, pendekatan yang digunakan, teknik pengumpulan data, serta metode analisis data...';
      case 'daftar_pustaka':
        return 'Daftar pustaka berisi referensi literatur yang digunakan (disarankan menggunakan format standar seperti APA atau IEEE)...';
      case 'kata_kunci':
        return 'Masukkan kata kunci, pisahkan dengan koma (contoh: Sistem Informasi, Pendidikan, Evaluasi)...';
      case 'lama_penelitian':
        return 'Contoh: 6 Bulan / 1 Tahun...';
      default:
        return `${label} berisi penjelasan mengenai...`;
    }
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: function() {
          const editor = this.quill;
          const range = editor.getSelection();
          
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();

          input.onchange = async () => {
            const file = input.files[0];
            if (file) {
              const formData = new FormData();
              formData.append('file', file);
              try {
                const res = await api.post('/uploads/images', formData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                const url = 'http://localhost:8002' + res.data.url;
                
                const index = range ? range.index : editor.getLength();
                editor.insertEmbed(index, 'image', url);
                editor.setSelection(index + 1);
              } catch (err) {
                console.error("Image upload failed:", err);
                alert('Gagal mengunggah gambar');
              }
            }
          };
        }
      }
    }
  }), []);

  if (fields.length === 0) {
    return <div className="text-center text-gray-500 py-12">Tidak ada form substansi (data inti) untuk dokumen ini.</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">Substansi / Data Inti</h3>
        <p className="text-gray-500 text-sm">Isi bidang-bidang berikut sesuai dengan template dokumen Anda.</p>
      </div>

      {fields.map((field) => (
        <div key={field.id} className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {field.label_field} {field.wajib ? <span className="text-red-500">*</span> : ''}
          </label>
          
          {field.tipe_field === 'textarea' ? (
            <div className="prose-editor border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shadow-sm">
              <ReactQuill 
                ref={quillRef}
                theme="snow"
                value={contents[field.id] || ''}
                onChange={(val) => handleContentChange(field.id, val)}
                modules={modules}
                className="bg-white"
                placeholder={getPlaceholder(field.nama_field, field.label_field)}
              />
            </div>
          ) : (
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm bg-white"
              value={contents[field.id] || ''}
              onChange={(e) => handleContentChange(field.id, e.target.value)}
              placeholder={getPlaceholder(field.nama_field, field.label_field)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
