import React from 'react';
import { EmailData } from '../types/email';
import { RefreshCw, AlertCircle, Mail, Clock, User, CheckCircle, Edit3 } from 'lucide-react';

interface DraftEmailListProps {
  emails: EmailData[];
  selectedEmailId: string | null;
  loading: boolean;
  error: string | null;
  onEmailSelect: (emailId: string) => void;
  onRefresh: () => void;
}

const DraftEmailList: React.FC<DraftEmailListProps> = ({
  emails,
  selectedEmailId,
  loading,
  error,
  onEmailSelect,
  onRefresh
}) => {

  const getDraftStatus = (email: EmailData) => {
    const lyzrData = email.lyzrData;
    const draftData = email.draftData;

    // Must have lyzrData for AI-generated content
    if (!lyzrData) return 'no-draft';

    // Check draft data for status
    if (draftData?.acknowledgment_email_sent) {
      return 'sent';
    }

    if (draftData?.draft_edited && draftData?.custom_draft_message) {
      return 'edited';
    }

    return 'generated';
  };

  const getDraftStatusBadge = (email: EmailData) => {
    const status = getDraftStatus(email);

    switch (status) {
      case 'sent':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Sent
          </span>
        );
      case 'edited':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Edit3 className="h-3 w-3 mr-1" />
            Edited
          </span>
        );
      case 'generated':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Mail className="h-3 w-3 mr-1" />
            Draft Ready
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            No Draft
          </span>
        );
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'No date';

    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (error) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Email Drafts</h2>
              <p className="text-sm text-gray-600">Manage customer response drafts</p>
            </div>
            <button
              onClick={onRefresh}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Drafts</h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={onRefresh}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Email Drafts</h2>
            <p className="text-sm text-gray-600">
              {loading ? 'Loading...' : `${emails.length} draft${emails.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 ${loading ? 'animate-spin' : ''
              }`}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {loading && emails.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 text-gray-300 mx-auto mb-4 animate-spin" />
              <p className="text-sm text-gray-500">Loading email drafts...</p>
            </div>
          </div>
        ) : emails.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Email Drafts</h3>
              <p className="text-sm text-gray-500">
                Email drafts will appear here when emails are processed and analyzed
              </p>
            </div>
          </div>
        ) : (
          emails.map((email) => (
            <div
              key={email.id}
              onClick={() => onEmailSelect(email.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedEmailId === email.id
                ? 'bg-blue-50 border-l-4 border-l-blue-500'
                : 'border-l-4 border-l-transparent'
                }`}
            >
              {/* Email Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {email.subject || 'No Subject'}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                      <User className="h-3 w-3" />
                      <span className="truncate max-w-32">{email.sender}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimestamp(email.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Draft Status */}
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-gray-500">
                  {email.lyzrData?.processed_at && (
                    <span>Processed {formatTimestamp(email.lyzrData.processed_at)}</span>
                  )}
                </div>
                {getDraftStatusBadge(email)}
              </div>

              {/* AI Classification Preview */}
              {email.lyzrData?.extracted_json && (
                <div className="mt-2 text-xs text-gray-500">
                  {email.lyzrData.extracted_json.email_analysis?.classification ||
                    email.lyzrData.extracted_json.classification ||
                    'Classified'}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DraftEmailList;
