import { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import UserForm from '../../components/admin/UserForm';
import { getUserById, updateUser } from '../../api/userApi';
import { useNavigate, useParams } from 'react-router-dom';
import '../../styles/users/UserManagement.css';

export default function UserEditPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [user, setUser] = useState(null);

	useEffect(() => {
		const fetch = async () => {
			setLoading(true);
			try {
				const data = await getUserById(id);
				setUser(data);
			} catch (err) {
				console.error(err);
				alert('Gagal mengambil data pengguna');
				navigate('/admin/users');
			} finally {
				setLoading(false);
			}
		};
		fetch();
	}, [id]);

	const handleSubmit = async (payload) => {
		try {
			await updateUser(id, payload);
			navigate('/admin/users');
		} catch (err) {
			console.error(err);
			alert('Gagal memperbarui pengguna');
		}
	};

	return (
		<AdminLayout title="Edit Pengguna">


			{loading && <div className="users-loading">Memuat...</div>}
			{user && <UserForm initialData={user} isEdit onCancel={() => navigate('/admin/users')} onSubmit={handleSubmit} />}
		</AdminLayout>
	);
}
