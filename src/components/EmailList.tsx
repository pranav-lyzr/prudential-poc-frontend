import React from 'react';
import { EmailData } from '../types/email';
import { Mail, Paperclip, Clock, User } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface EmailListProps {
  emails: EmailData[];
  selectedEmailId: string | null;
  loading: boolean;
  error: string | null;
  onEmailSelect: (email: EmailData) => void;
  onRetry: () => void;
}

const EmailList: React.FC<EmailListProps> = ({ emails, selectedEmailId, loading, error, onEmailSelect, onRetry }) => {
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'No date';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Emails</h2>
        </div>
        <ErrorMessage message={error} onRetry={onRetry} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Emails</h2>
            <p className="text-sm text-gray-600 mt-1">{emails.length} emails found</p>
          </div>
          <button
            onClick={onRetry}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh emails"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
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
                <span>{formatTimestamp(email.timestamp)}</span>
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
