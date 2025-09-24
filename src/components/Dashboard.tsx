import React, { useState, useEffect } from 'react';
import { EmailData } from '../types/email';
import { apiService } from '../services/api';
import DraftEmailList from './DraftEmailList';
import DraftEmailPreview from './DraftEmailPreview';

const Dashboard: React.FC = () => {
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch emails with draft data
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the new draft emails API
        const emailData = await apiService.getEmailDrafts();

        setEmails(emailData);

        // Auto-select first email if available
        if (emailData.length > 0 && !selectedEmailId) {
          setSelectedEmailId(emailData[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch draft emails:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch emails');
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, []);

  const handleEmailSelect = (emailId: string) => {
    setSelectedEmailId(emailId);
  };

  const handleRefresh = async () => {
    setSelectedEmailId(null); // Reset selection
    const fetchEmails = async () => {
      try {
        setLoading(true);
        setError(null);

        const emailData = await apiService.getEmailDrafts();

        setEmails(emailData);

        if (emailData.length > 0) {
          setSelectedEmailId(emailData[0].id);
        }
      } catch (err) {
        console.error('Failed to refresh draft emails:', err);
        setError(err instanceof Error ? err.message : 'Failed to refresh emails');
      } finally {
        setLoading(false);
      }
    };

    await fetchEmails();
  };

  return (
    <main className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Panel: Draft Email List */}
      <div className="w-96 border-r border-gray-200 bg-white flex-shrink-0">
        <DraftEmailList
          emails={emails}
          selectedEmailId={selectedEmailId}
          loading={loading}
          error={error}
          onEmailSelect={handleEmailSelect}
          onRefresh={handleRefresh}
        />
      </div>

      {/* Right Panel: Draft Preview */}
      <div className="flex-1 bg-white overflow-hidden">
        <DraftEmailPreview
          emailId={selectedEmailId}
          emails={emails}
          onEmailUpdate={handleRefresh}
        />
      </div>
    </main>
  );
};

export default Dashboard;
