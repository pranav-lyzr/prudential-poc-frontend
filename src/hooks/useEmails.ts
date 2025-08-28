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
  fetchLyzrData: (emailId: string) => Promise<void>;
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

  const fetchLyzrData = useCallback(async (emailId: string) => {
    try {
      console.log('useEmails: fetchLyzrData called with emailId:', emailId);
      console.log('useEmails: emailId type:', typeof emailId, 'length:', emailId.length);
      
      const lyzrResponse = await apiService.getLyzrData(emailId);
      console.log('useEmails: Lyzr response received:', lyzrResponse);
      
      // Update the selected email with Lyzr data
      setSelectedEmail(prev => {
        if (prev) {
          console.log('useEmails: Updating selected email with Lyzr data');
          return {
            ...prev,
            lyzrData: lyzrResponse.lyzr_data
          };
        }
        return prev;
      });
      
      // Also update the email in the emails list
      setEmails(prev => prev.map(email => 
        (email.messageId === emailId || email.id === emailId)
          ? { ...email, lyzrData: lyzrResponse.lyzr_data }
          : email
      ));
      
      console.log('useEmails: Lyzr data updated successfully');
    } catch (err) {
      console.error('useEmails: Failed to fetch Lyzr data:', err);
      throw err;
    }
  }, []);

  const selectEmail = useCallback(async (email: EmailData) => {
    console.log('selectEmail called with:', email);
    console.log('selectEmail: email.messageId:', email.messageId);
    console.log('selectEmail: email.id:', email.id);
    setSelectedEmail(email);
    
    // Fetch Lyzr data for the selected email
    try {
      // Use messageId if available, otherwise fall back to id
      const emailIdForLyzr = email.messageId || email.id;
      console.log(`Selected email - ID: ${email.id}, MessageID: ${email.messageId}, Using for Lyzr: ${emailIdForLyzr}`);
      
      if (email.messageId) {
        console.log('Calling fetchLyzrData with messageId:', email.messageId);
        await fetchLyzrData(email.messageId);
      } else {
        console.log('No messageId found, skipping Lyzr data fetch');
      }
    } catch (err) {
      console.error('Failed to fetch Lyzr data:', err);
      // Don't show error to user, just log it
    }
  }, [fetchLyzrData]);

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
    fetchLyzrData,
  };
};
