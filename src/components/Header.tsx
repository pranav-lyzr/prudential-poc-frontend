import React, { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff } from 'lucide-react';
import { apiService } from '../services/api';
import SalesforceAuth from './SalesforceAuth';

const Header: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        setBackendStatus('checking');
        await apiService.healthCheck();
        setBackendStatus('connected');
      } catch (error) {
        setBackendStatus('disconnected');
      }
    };

    checkBackendStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'connected': return 'bg-green-500';
      case 'disconnected': return 'bg-red-500';
      case 'checking': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (backendStatus) {
      case 'connected': return <Wifi className="h-4 w-4 text-green-600" />;
      case 'disconnected': return <WifiOff className="h-4 w-4 text-red-600" />;
      case 'checking': return <Activity className="h-4 w-4 text-yellow-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (backendStatus) {
      case 'connected': return 'Backend Connected';
      case 'disconnected': return 'Backend Disconnected';
      case 'checking': return 'Checking Status';
      default: return 'Unknown Status';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 w-full">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
            <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Prudential Email Dashboard</h1>
            <p className="text-sm text-gray-600">Email Processing & Management System</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Salesforce Authentication */}
          <SalesforceAuth />
          
          {/* Backend Status */}
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
            backendStatus === 'connected' ? 'bg-green-100' : 
            backendStatus === 'disconnected' ? 'bg-red-100' : 'bg-yellow-100'
          }`}>
            {getStatusIcon()}
            <span className={`text-sm font-medium ${
              backendStatus === 'connected' ? 'text-green-700' : 
              backendStatus === 'disconnected' ? 'text-red-700' : 'text-yellow-700'
            }`}>
              {backendStatus === 'connected' ? 'Webhook Connected' : getStatusText()}
            </span>
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
