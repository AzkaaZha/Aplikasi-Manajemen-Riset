import { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import UserForm from '../../components/admin/UserForm';
import { createUser } from '../../api/userApi';
import { useNavigate } from 'react-router-dom';
import '../../styles/users/UserManagement.css';

export default function UserCreatePage() {
	const navigate = useNavigate();
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (payload) => {
		setSubmitting(true);

		try {
			await createUser(payload);

			alert('Pengguna berhasil ditambahkan');
			navigate('/admin/users');
		} catch (err) {
			console.error(err);
			alert('Gagal menyimpan pengguna');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<AdminLayout title="Tambah Pengguna">
			<UserForm
				onCancel={() => navigate('/admin/users')}
				onSubmit={handleSubmit}
			/>
		</AdminLayout>
	);
}