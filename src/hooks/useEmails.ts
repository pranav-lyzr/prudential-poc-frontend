import { useState, useEffect, useCallback } from 'react';
import { EmailData } from '../types/email';
import { apiService } from '../services/api';

interface UseEmailsReturn {
  emails: EmailData[];
  selectedEmail: EmailData | null;
  loading: boolean;
  error: string | null;
  selectEmail: (email: EmailData) => void;
  refreshEmails: () => Promise<void>;
  createEmail: (emailData: Omit<EmailData, 'id'>) => Promise<void>;
}

export const useEmails = (): UseEmailsReturn => {
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchEmails = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      const fetchedEmails = await apiService.getEmails();
      setEmails(fetchedEmails);
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch emails');
      console.error('Error fetching emails:', err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [isInitialLoad]);

  const selectEmail = useCallback((email: EmailData) => {
    setSelectedEmail(email);
  }, []);

  const refreshEmails = useCallback(async () => {
    await fetchEmails(true); // Manual refresh shows loading
  }, [fetchEmails]);

  const createEmail = useCallback(async (emailData: Omit<EmailData, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const newEmail = await apiService.createEmail(emailData);
      setEmails(prev => [newEmail, ...prev]);
      setSelectedEmail(newEmail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create email');
      console.error('Error creating email:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails(true); // Initial load with loading indicator
    
    // Auto-refresh every 5 seconds without loading indicator
    const interval = setInterval(() => fetchEmails(false), 5000);
    
    return () => clearInterval(interval);
  }, [fetchEmails]);

  return {
    emails,
    selectedEmail,
    loading,
    error,
    selectEmail,
    refreshEmails,
    createEmail,
  };
};
