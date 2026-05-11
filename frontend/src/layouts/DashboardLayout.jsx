import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout({ allowedRoles }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!token || !storedUser) {
      navigate('/login', { state: { from: location } });
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      if (allowedRoles && !allowedRoles.includes(parsedUser.role?.nama)) {
        if (parsedUser.role?.nama === 'admin') navigate('/admin');
        else navigate('/dosen');
      }
    }
    setLoading(false);
  }, [navigate, location, allowedRoles]);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 shadow-sm z-10 px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold capitalize">
            {location.pathname.split('/')[2] ? location.pathname.split('/')[2].replace('-', ' ') : 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{user.nama} ({user.role?.nama})</span>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}
