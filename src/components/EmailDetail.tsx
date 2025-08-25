import React from 'react';
import { EmailData } from '../types/email';
import { Mail, Paperclip, Clock, User, Users, FileText } from 'lucide-react';

interface EmailDetailProps {
  email: EmailData | null;
}

const EmailDetail: React.FC<EmailDetailProps> = ({ email }) => {
  if (!email) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Email Selected</h3>
        <p className="text-gray-500">Select an email from the list to view its details</p>
      </div>
    );
  }

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'No date';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };



  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {email.subject || 'No Subject'}
            </h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="font-medium">From:</span>
                <span>{email.sender}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{formatTimestamp(email.timestamp)}</span>
              </div>
            </div>
          </div>
          
          
        </div>
      </div>

      {/* Recipients */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Recipients:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {email.recipients.map((recipient, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
            >
              {recipient}
            </span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-4 border-b border-gray-200 flex-1 overflow-y-auto" style={{ height: 'calc(100% - 200px)' }}>
        <div className="flex items-center space-x-2 mb-3">
          <FileText className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Email Body:</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          {email.body ? (
            <div 
              className="text-gray-800 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: email.body }}
            />
          ) : (
            <p className="text-gray-500 italic">No email body content</p>
          )}
        </div>
      </div>

      {/* Attachments */}
      {email.attachments && email.attachments.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <Paperclip className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Attachments:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {email.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <Paperclip className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {attachment.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(attachment.size)} • {attachment.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      
    </div>
  );
};

export default EmailDetail;
