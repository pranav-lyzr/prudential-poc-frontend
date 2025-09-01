import React from 'react';
import { EmailData } from '../types/email';
import { Mail, Paperclip, Clock, User, RefreshCw } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
// import ErrorMessage from './ErrorMessage';
import { getApiConfig } from '../config/api';

interface EmailListProps {
  emails: EmailData[];
  selectedEmailId: string | null;
  loading: boolean;
  error: string | null;
  onEmailSelect: (email: EmailData) => void;
  onRetry: () => void;
}

const EmailList: React.FC<EmailListProps> = ({
  emails,
  selectedEmailId,
  loading,
  error,
  onEmailSelect,
  onRetry,
}) => {
  const apiConfig = getApiConfig();
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // const getEmailPreview = (body: string) => {
  //   return body.length > 100 ? `${body.substring(0, 100)}...` : body;
  // };

  const formatRefreshInterval = (intervalMs: number) => {
    const seconds = Math.floor(intervalMs / 1000);
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Emails</h2>
        </div>
        <LoadingSpinner text="Loading emails..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 mb-2">Failed to load emails</p>
          <button
            onClick={onRetry}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with status indicator */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Emails</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Fetching...</span>
              </>
            ) : (
              <>
                <Clock className="h-4 w-4" />
                <span>Auto-refresh: {formatRefreshInterval(apiConfig.EMAIL_REFRESH_INTERVAL)}</span>
              </>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {emails.length} email{emails.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="flex-1 divide-y divide-gray-200 overflow-y-auto">
        {emails.map((email) => (
          <div
            key={email.id}
            className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedEmailId === email.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
            }`}
            onClick={() => onEmailSelect(email)}
          >
            <div className="space-y-2">
              {/* Subject */}
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-gray-900 truncate flex-1">
                  {email.subject || 'No Subject'}
                </p>
              </div>
              
              {/* Sender */}
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <User className="h-3 w-3" />
                <span className="truncate">{email.sender}</span>
              </div>
              
                             {/* Timestamp */}
               <div className="flex items-center space-x-1 text-xs text-gray-500">
                 <Clock className="h-3 w-3" />
                 <span>{email.timestamp ? formatTimestamp(email.timestamp) : 'No date'}</span>
               </div>
              
              {/* Attachments indicator */}
              {email.attachments && email.attachments.length > 0 && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Paperclip className="h-3 w-3" />
                  <span>{email.attachments.length} attachment(s)</span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {emails.length === 0 && (
          <div className="px-6 py-8 text-center">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No emails found</p>
            <p className="text-sm text-gray-400 mt-1">Emails will appear here when they are processed</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailList;
