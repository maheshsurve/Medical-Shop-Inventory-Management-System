import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Users, 
  Truck, 
  ShoppingCart, 
  BarChart2, 
  Settings, 
  Bell, 
  LogOut, 
  Menu, 
  X,
  Pill,
  FileText,
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUnreadAlerts } from '../../utils/localStorage';

interface SidebarProps {
  isMobile: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile, isOpen, onToggle }) => {
  const { user, logout, isAdmin, isManager } = useAuth();
  const [unreadAlerts] = useState(getUnreadAlerts().length);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'Medicines', path: '/medicines', icon: <Pill size={20} /> },
    { name: 'Suppliers', path: '/suppliers', icon: <Truck size={20} /> },
    { name: 'Purchase Orders', path: '/purchase-orders', icon: <Package size={20} /> },
    { name: 'Sales', path: '/sales', icon: <ShoppingCart size={20} /> },
    { name: 'Reports', path: '/reports', icon: <BarChart2 size={20} /> },
    { name: 'Alerts', path: '/alerts', icon: <Bell size={20} />, badge: unreadAlerts },
    { name: 'Backup', path: '/backup', icon: <Database size={20} />, requiresAdmin: true },
    { name: 'Users', path: '/users', icon: <Users size={20} />, requiresAdmin: true },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} />, requiresAdmin: true },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.requiresAdmin || (item.requiresAdmin && isAdmin)
  );

  const sidebarClasses = isMobile
    ? `fixed inset-0 z-40 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`
    : `relative transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`;

  return (
    <>
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-30" onClick={onToggle}></div>
      )}

      <div className={sidebarClasses}>
        <div className="h-full flex flex-col w-64 bg-gray-800">
          <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-white font-semibold text-lg">MediTrack</span>
            </div>
            {isMobile && (
              <button
                className="text-gray-300 hover:text-white focus:outline-none"
                onClick={onToggle}
              >
                <X size={24} />
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {filteredNavItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                  onClick={isMobile ? onToggle : undefined}
                >
                  <div className="mr-3">{item.icon}</div>
                  <span>{item.name}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="px-2 py-4 border-t border-gray-700">
              <div className="flex items-center px-2 py-2 text-sm font-medium text-gray-300">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center text-white">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <p className="text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                className="mt-2 w-full flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={logout}
              >
                <LogOut size={20} className="mr-3" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMobile && (
        <div className="fixed top-0 left-0 z-20 p-4">
          <button
            className={`text-gray-500 hover:text-gray-600 focus:outline-none ${isOpen ? 'hidden' : 'block'}`}
            onClick={onToggle}
          >
            <Menu size={24} />
          </button>
        </div>
      )}
    </>
  );
};

export default Sidebar;