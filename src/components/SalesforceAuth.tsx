import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, User, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';

interface SalesforceAuthProps {
  className?: string;
}

const SalesforceAuth: React.FC<SalesforceAuthProps> = ({ className = '' }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [salesforceStatus, setSalesforceStatus] = useState<any>(null); // Used for status monitoring

  useEffect(() => {
    // Check initial auth status
    checkAuthStatus();

    // Listen for auth failure events
    const handleAuthFailed = () => {
      setIsAuthenticated(false);
      setExpiresAt(null);
      setTimeRemaining('');
      setSalesforceStatus(null);
      // Force re-check status
      checkAuthStatus();
    };

    window.addEventListener('salesforce-auth-failed', handleAuthFailed);

    // Check Salesforce status every 30 seconds
    const statusInterval = setInterval(checkAuthStatus, 30000);

    return () => {
      window.removeEventListener('salesforce-auth-failed', handleAuthFailed);
      clearInterval(statusInterval);
    };
  }, []);

  useEffect(() => {
    let interval: number;
    if (expiresAt) {
      updateTimeRemaining();
      interval = setInterval(updateTimeRemaining, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [expiresAt]);

  const checkAuthStatus = async () => {
    try {
      const status = await apiService.getSalesforceAuthStatus();
      setIsAuthenticated(status.isAuthenticated);
      setExpiresAt(status.expiresAt || null);

      // Also get detailed status for UI
      try {
        const detailedStatus = await apiService.getSalesforceStatus();
        setSalesforceStatus(detailedStatus);
        console.log('Salesforce status updated:', detailedStatus);
      } catch (statusError) {
        console.error('Failed to get detailed Salesforce status:', statusError);
        setSalesforceStatus(null);
      }

      if (status.expiresAt) {
        updateTimeRemaining();
      }
    } catch (error) {
      console.error('Failed to check Salesforce auth status:', error);
      setIsAuthenticated(false);
      setExpiresAt(null);
      setSalesforceStatus(null);
    }
  };

  const updateTimeRemaining = () => {
    if (!expiresAt) return;

    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;

    if (diff <= 0) {
      setTimeRemaining('Expired');
      setIsAuthenticated(false);
      setExpiresAt(null);
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setTimeRemaining(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiService.getSalesforceLoginUrl();

      // Store state for callback verification
      localStorage.setItem('salesforce_state', response.state);

      // Open Salesforce login in a new tab
      window.open(response.login_url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get login URL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logoutSalesforce();
      setIsAuthenticated(false);
      setExpiresAt(null);
      setTimeRemaining('');
      setSalesforceStatus(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still update UI even if logout fails
      setIsAuthenticated(false);
      setExpiresAt(null);
      setTimeRemaining('');
      setSalesforceStatus(null);
    }
  };

  // Check if we're returning from Salesforce OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);

      // Handle the callback
      apiService.handleSalesforceCallback(code, state)
        .then(() => {
          checkAuthStatus();
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Authentication failed');
        });
    }
  }, []);

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-100 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm font-medium text-blue-700">Connecting...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg bg-red-100 ${className}`}>
        <AlertCircle className="h-4 w-4 text-red-600" />
        <span className="text-sm font-medium text-red-700">Error</span>
        <button
          onClick={() => setError(null)}
          className="text-xs text-red-600 hover:text-red-800"
        >
          ×
        </button>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg bg-green-100 ${className}`}>
        {/* Green status circle */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${salesforceStatus?.authenticated ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <User className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">Salesforce</span>
        </div>

        {expiresAt && (
          <div className="flex items-center space-x-1 text-xs text-green-600">
            <Clock className="h-3 w-3" />
            <span>{timeRemaining}</span>
          </div>
        )}

        <button
          onClick={handleLogin}
          className="flex items-center space-x-1 text-xs text-green-700 hover:text-green-900 hover:bg-green-200 px-2 py-1 rounded transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-1 text-xs text-green-700 hover:text-green-900 hover:bg-green-200 px-2 py-1 rounded transition-colors"
        >
          <LogOut className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors ${className}`}
    >
      <LogIn className="h-4 w-4 text-blue-600" />
      <span className="text-sm font-medium text-blue-700">Connect Salesforce</span>
    </button>
  );
};

export default SalesforceAuth;
