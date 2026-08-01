import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, LogOut, Menu, X, Users as UsersIcon, Shield, Tags, LayoutList, Undo2, Headphones, Bell, Settings as SettingsIcon, ShieldAlert } from 'lucide-react';

interface LayoutProps {
  onLogout: () => void;
}

const ROLE_LABEL: Record<string, string> = {
  super_admin: 'Super Admin',
  order_manager: 'Order Manager',
  support: 'Support',
};

const ROLE_COLOR: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-700',
  order_manager: 'bg-blue-100 text-blue-700',
  support: 'bg-gray-100 text-gray-600',
};

export default function Layout({ onLogout }: LayoutProps) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const adminName = localStorage.getItem('adminName') || 'Admin';
  const adminRole = localStorage.getItem('adminRole') || 'support';
  const isSuperAdmin = adminRole === 'super_admin';

  const isOrderManager = adminRole === 'order_manager';
  const isSupport = adminRole === 'support';

  const navItems = [
    ...(isSuperAdmin || isOrderManager ? [{ name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> }] : []),
    ...(isSuperAdmin || isOrderManager ? [{ name: 'Products', path: '/products', icon: <Package size={20} /> }] : []),
    ...(isSuperAdmin || isOrderManager ? [{ name: 'Categories', path: '/categories', icon: <LayoutList size={20} /> }] : []),
    ...(isSuperAdmin ? [{ name: 'Coupons', path: '/coupons', icon: <Tags size={20} /> }] : []),
    ...(isSuperAdmin || isOrderManager ? [{ name: 'Orders', path: '/orders', icon: <ShoppingCart size={20} /> }] : []),
    ...(isSuperAdmin || isOrderManager ? [{ name: 'Returns', path: '/returns', icon: <Undo2 size={20} /> }] : []),
    ...(isSuperAdmin || isSupport ? [{ name: 'Tickets', path: '/tickets', icon: <Headphones size={20} /> }] : []),
    { name: 'Users', path: '/users', icon: <UsersIcon size={20} /> },
    { name: 'Notifications', path: '/notifications', icon: <Bell size={20} /> },
    ...(isSuperAdmin ? [{ name: 'Audit Logs', path: '/audit-logs', icon: <ShieldAlert size={20} /> }] : []),
    ...(isSuperAdmin ? [{ name: 'Settings', path: '/settings', icon: <SettingsIcon size={20} /> }] : []),
    ...(isSuperAdmin ? [{ name: 'Admin Users', path: '/admin-users', icon: <Shield size={20} /> }] : []),
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-40">
        <h1 className="text-xl font-bold tracking-tight text-primary-600">Store Admin</h1>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-500 hover:text-gray-900">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col shadow-xl md:shadow-sm transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <h1 className="text-xl font-bold tracking-tight text-primary-600">Store Admin</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-gray-900">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-primary-50 text-primary-600 font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Admin identity footer */}
        <div className="p-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{adminName}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${ROLE_COLOR[adminRole] || ROLE_COLOR.support}`}>
                {ROLE_LABEL[adminRole] || adminRole}
              </span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-left text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50/50 mt-16 md:mt-0 relative w-full">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
