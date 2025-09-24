import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Home as HomeIcon } from 'lucide-react';

const Home = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-gray-700 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <HomeIcon className="h-8 w-8 text-blue-600" />
              <h1 className="ml-3 text-xl font-semibold text-white">Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <img className='rounded-full' src={user.avatar} alt="" />
                  </div>
                  <span className="text-sm font-medium text-white">
                    {user.full_name || user.name || 'User'}
                  </span>
                </div>
              )}
              
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-800 transition duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-gray-800 border-gray-700 border rounded-lg shadow-sm p-6">
            {user ? (
              <div className="text-center">
                <div className="mx-auto h-24 w-24 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Welcome, {user.full_name || user.name || 'User'}!
                </h2>
                <p className="text-gray-400">
                  You are successfully logged in to your dashboard.
                </p>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white">Profile</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Manage your account
                    </p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white">Settings</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Configure preferences
                    </p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white">Help</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Get support
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading...</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;