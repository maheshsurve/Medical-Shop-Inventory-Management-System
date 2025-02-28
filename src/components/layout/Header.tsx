import React from 'react';
import { Bell, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUnreadAlerts } from '../../utils/localStorage';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onSearch?: (searchTerm: string) => void;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onSearch,
  searchPlaceholder = 'Search...',
  actions,
}) => {
  const navigate = useNavigate();
  const unreadAlerts = getUnreadAlerts();

  return (
    <div className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            {onSearch && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={searchPlaceholder}
                  onChange={(e) => onSearch(e.target.value)}
                />
              </div>
            )}
            <div className="flex items-center space-x-3">
              <button
                className="relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => navigate('/alerts')}
              >
                <span className="sr-only">View alerts</span>
                <Bell className="h-6 w-6" />
                {unreadAlerts.length > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
              </button>
              {actions}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;