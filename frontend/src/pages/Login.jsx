import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff, Github } from 'lucide-react';
import axios from "axios";

const API_URL = 'https://api-ai.rakarawr.com/public/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: email,
        password: password
      });
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (error) {
      alert('Login gagal: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "https://api-ai.rakarawr.com/api/auth/google";
  };

  const handleGithubLogin = () => {
    window.location.href = "https://api-ai.rakarawr.com/api/auth/github"
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#161618' }}>
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">

          <h2 className="text-4xl font-bold text-white mb-2">
              rakarawr.ai
          </h2>

          <p className="text-sm text-gray-400">
            Sign in to continue to your AI assistant
          </p>
        </div>

        {/* Form */}
        <div className="border rounded-2xl shadow-2xl p-8 backdrop-blur-sm" style={{ backgroundColor: '#212121', borderColor: '#505050' }}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white mb-3">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-300" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-12 pr-4 py-4 border text-white placeholder-gray-300 focus:border-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 transition duration-300"
                  style={{ 
                    backgroundColor: '#161618', 
                    borderColor: '#606060',
                  }}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white mb-3">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-300" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full pl-12 pr-12 py-4 border text-white placeholder-gray-300 focus:border-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 transition duration-300"
                  style={{ 
                    backgroundColor: '#161618', 
                    borderColor: '#606060',
                  }}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-300 hover:text-white transition duration-200" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-300 hover:text-white transition duration-200" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-4 px-4 text-lg font-semibold rounded-xl text-black transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-[1.02]"
              style={{ backgroundColor: '#ffffff' }}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <div className="flex items-center">
                  <LogIn className="h-5 w-5 mr-3" />
                  Sign In
                </div>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: '#606060' }}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 text-gray-300 font-medium" style={{ backgroundColor: '#404040' }}>
                  Or continue with
                </span>
              </div>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="mt-6 space-y-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="group relative w-full flex justify-center py-4 px-4 border text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 transition duration-300 hover:shadow-lg transform hover:scale-[1.02]"
              style={{ 
                backgroundColor: '#161618', 
                borderColor: '#606060'
              }}
            >
              <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              onClick={handleGithubLogin}
              className="group relative w-full flex justify-center py-4 px-4 border text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 transition duration-300 hover:shadow-lg transform hover:scale-[1.02]"
              style={{ 
                backgroundColor: '#161618', 
                borderColor: '#606060'
              }}
            >
              <Github className="h-5 w-5 mr-3" />
              Continue with Github
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              By continuing, you agree to RakaRawrai's Terms of Service
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;