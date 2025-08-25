import React from 'react';
import { EmailData } from '../types/email';
import { Settings, Clock, User, FileText, AlertCircle } from 'lucide-react';

interface EmailActionsProps {
  email: EmailData | null;
}

const EmailActions: React.FC<EmailActionsProps> = ({ email }) => {
  if (!email) {
    return (
      <div className="p-6 text-center">
        <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Email Actions</h3>
        <p className="text-gray-500">Select an email to view available actions</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900">Actions</h2>
        <p className="text-sm text-gray-600 mt-1">Available actions for this email</p>
      </div>

      {/* Actions Content */}
      <div className="p-6 space-y-6 overflow-y-auto" style={{ height: 'calc(100% - 80px)' }}>
        {/* Email Info Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Email Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">From: {email.sender}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                {email.timestamp ? new Date(email.timestamp).toLocaleDateString() : 'No date'}
              </span>
            </div>
            
          </div>
        </div>

        {/* Available Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Available Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Process Email</p>
                  <p className="text-xs text-gray-500">Mark as processed and archive</p>
                </div>
              </div>
            </button>

            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Assign to User</p>
                  <p className="text-xs text-gray-500">Assign email to team member</p>
                </div>
              </div>
            </button>

            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Set Priority</p>
                  <p className="text-xs text-gray-500">Mark as high/medium/low priority</p>
                </div>
              </div>
            </button>

            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Flag for Review</p>
                  <p className="text-xs text-gray-500">Mark for later review</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Action History */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Action History</h3>
          <div className="text-center py-6">
            <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No actions taken yet</p>
            <p className="text-xs text-gray-400 mt-1">Actions will appear here when taken</p>
          </div>
        </div>

        {/* Future API Integration Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-blue-600">i</span>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">API Integration Coming Soon</p>
              <p className="text-xs text-blue-700 mt-1">
                Real-time actions and history will be available when the actions API is implemented.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailActions;
