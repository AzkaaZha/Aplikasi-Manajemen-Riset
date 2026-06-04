import { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { getUsers, deleteUser } from '../../api/userApi';
import UserTable from '../../components/admin/UserTable';
import '../../styles/users/UserManagement.css';
import { useNavigate } from 'react-router-dom';

export default function UserListPage() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const navigate = useNavigate();

	const fetchUsers = async () => {
		try {
			const data = await getUsers();
			setUsers(data || []);
		} catch (err) {
			console.error(err);
			setError('Gagal mengambil data pengguna');
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	const handleEdit = (u) => {
		navigate(`/admin/users/edit/${u.id}`);
	};

	const handleDelete = async (u) => {
		const ok = window.confirm(`Apakah Anda yakin ingin menghapus pengguna ${u.nama}?`);
		if (!ok) return;

		try {
			setLoading(true);

			await deleteUser(u.id);
			await fetchUsers();

			alert('Pengguna berhasil dihapus');
		} catch (err) {
			console.error(err);
			alert('Gagal menghapus pengguna');
		} finally {
			setLoading(false);
		}
	};

	return (
		<AdminLayout title="Manajemen Pengguna">
			<div className="users-page-header d-flex align-items-center justify-content-between mb-3">
				<div>
					<h1>Manajemen Pengguna</h1>
					<p className="text-secondary">Kelola akun pengguna aplikasi</p>
				</div>

				<div>
					<button
						className="btn-add-user"
						onClick={() => navigate('/admin/users/create')}
					>
						Tambah Pengguna
					</button>
				</div>
			</div>

			{error && <div className="users-error">{error}</div>}

			<UserTable
				users={users}
				loading={false}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>
		</AdminLayout>
	);
}