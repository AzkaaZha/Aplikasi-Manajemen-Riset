import React from 'react';

export default function UserTable({ users, loading, onEdit, onDelete }) {
  if (loading) {
    return <div className="users-loading">Memuat data pengguna...</div>;
  }

  if (!users || users.length === 0) {
    return <div className="users-empty">Belum ada pengguna.</div>;
  }

  return (
    <div className="users-table-wrapper">
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>Email</th>
            <th>Role</th>
            <th>NIDN</th>
            <th>No HP</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="user-row">
              <td>{u.id}</td>
              <td>{u.nama}</td>
              <td>{u.email}</td>
              <td>{u.role?.nama || (u.role_id === 1 ? 'Admin' : 'Dosen')}</td>
              <td>{u.nidn || '-'}</td>
              <td>{u.no_hp || '-'}</td>
              <td>{u.status_aktif === 1 ? 'Aktif' : 'Nonaktif'}</td>
              <td>
                <button className="btn btn-sm btn-edit" onClick={() => onEdit(u)}>
                  Edit
                </button>
                <button className="btn btn-sm btn-delete" onClick={() => onDelete(u)}>
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
