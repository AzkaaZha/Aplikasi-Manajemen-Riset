import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  LogOut, 
  Users 
} from 'lucide-react';

export default function Sidebar({ user }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = user?.role?.nama === 'admin' 
    ? [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Manajemen Pengguna', path: '/admin/users', icon: Users },
      ]
    : [
        { name: 'Dashboard', path: '/dosen', icon: LayoutDashboard },
        { name: 'Daftar Penelitian', path: '/dosen/penelitian', icon: FileText },
      ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-full shadow-lg">
      <div className="h-16 flex items-center px-6 font-bold text-xl tracking-wider border-b border-slate-800">
        Riset<span className="text-blue-400">AI</span>
      </div>
      
      <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                           (item.path !== '/dosen' && item.path !== '/admin' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Keluar</span>
        </button>
      </div>
    </div>
  );
}
