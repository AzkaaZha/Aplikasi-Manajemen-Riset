import React, { useState } from 'react';
import { ROLES } from '../../constants/roles';
import '../../styles/admin-form.css';

export default function UserForm({ initialData = {}, onCancel, onSubmit, isEdit = false }) {
  const [form, setForm] = useState({
    nama: initialData.nama || '',
    email: initialData.email || '',
    password: '',
    role_id: initialData.role_id || ROLES.DOSEN,
    nidn: initialData.nidn || '',
    no_hp: initialData.no_hp || '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const validate = () => {
    const err = {};
    if (!form.nama) err.nama = 'Nama wajib diisi';
    if (!form.email) err.email = 'Email wajib diisi';
    if (!isEdit && !form.password) err.password = 'Password wajib diisi';
    if (!form.role_id) err.role_id = 'Role wajib dipilih';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      nama: form.nama,
      email: form.email,
      role_id: Number(form.role_id),
      nidn: form.nidn || undefined,
      no_hp: form.no_hp || undefined,
    };
    if (!isEdit) payload.password = form.password;
    onSubmit(payload);
  };

  return (
    <div className="admin-form-container">
      <div className="admin-form-header">
        <h1 className="admin-form-title">{isEdit ? "Edit Pengguna" : "Tambah Pengguna"}</h1>
        <p className="admin-form-subtitle">{isEdit ? "Perbarui informasi pengguna" : "Isi data pengguna baru di bawah ini"}</p>
      </div>
      <div className="admin-form-card">
        <form onSubmit={submit}>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Nama Lengkap</label>
              <input 
                name="nama" 
                className="admin-form-control" 
                value={form.nama} 
                onChange={handleChange} 
                placeholder="Masukkan nama lengkap"
              />
              {errors.nama && <span className="admin-form-error">{errors.nama}</span>}
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Email</label>
              <input 
                name="email" 
                type="email" 
                className="admin-form-control" 
                value={form.email} 
                onChange={handleChange} 
                placeholder="Masukkan email aktif"
              />
              {errors.email && <span className="admin-form-error">{errors.email}</span>}
            </div>
          </div>

          <div className="admin-form-row">
            {!isEdit && (
              <div className="admin-form-group">
                <label className="admin-form-label">Password</label>
                <input 
                  name="password" 
                  type="password" 
                  className="admin-form-control" 
                  value={form.password} 
                  onChange={handleChange} 
                  placeholder="Masukkan password"
                />
                {errors.password && <span className="admin-form-error">{errors.password}</span>}
              </div>
            )}

            <div className="admin-form-group">
              <label className="admin-form-label">Role Pengguna</label>
              <select 
                name="role_id" 
                className="admin-form-select" 
                value={form.role_id} 
                onChange={handleChange}
              >
                <option value={ROLES.ADMIN}>Admin</option>
                <option value={ROLES.DOSEN}>Dosen</option>
              </select>
              {errors.role_id && <span className="admin-form-error">{errors.role_id}</span>}
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">NIDN (Opsional)</label>
              <input 
                name="nidn" 
                className="admin-form-control" 
                value={form.nidn} 
                onChange={handleChange} 
                placeholder="Masukkan NIDN"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">No Handphone (Opsional)</label>
              <input 
                name="no_hp" 
                className="admin-form-control" 
                value={form.no_hp} 
                onChange={handleChange} 
                placeholder="Masukkan no handphone"
              />
            </div>
          </div>

          <div className="admin-form-actions">
            <button type="button" className="btn-admin-cancel" onClick={onCancel}>
              Batal
            </button>
            <button type="submit" className="btn-admin-save">
              {isEdit ? "Update Pengguna" : "Simpan Pengguna"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
