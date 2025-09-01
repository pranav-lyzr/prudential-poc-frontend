import { useState, useEffect, useCallback, useRef } from 'react';
import { EmailData } from '../types/email';
import { apiService } from '../services/api';
import { getApiConfig } from '../config/api';

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
  
  // Add refs to track ongoing requests and prevent overlapping calls
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  
  // Get API configuration
  const apiConfig = getApiConfig();

  const fetchEmails = useCallback(async (showLoading = true) => {
    // Prevent overlapping requests
    if (isFetchingRef.current) {
      console.log('Email fetch already in progress, skipping...');
      return;
    }

    try {
      isFetchingRef.current = true;
      
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      
      console.log('Starting email fetch...');
      const fetchedEmails = await apiService.getEmails(abortControllerRef.current.signal);
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        console.log('Email fetch was aborted');
        return;
      }
      
      console.log('Email fetch completed successfully');
      setEmails(fetchedEmails);
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
      
      // Reset retry count on successful fetch
      retryCountRef.current = 0;
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Email fetch was aborted');
        return;
      }
      
      console.error('Error fetching emails:', err);
      
      // Implement retry logic for failed requests
      if (retryCountRef.current < apiConfig.MAX_RETRY_ATTEMPTS) {
        retryCountRef.current++;
        console.log(`Retrying email fetch (attempt ${retryCountRef.current}/${apiConfig.MAX_RETRY_ATTEMPTS})...`);
        
        // Wait before retrying
        setTimeout(() => {
          fetchEmails(showLoading);
        }, apiConfig.RETRY_DELAY);
        
        return;
      }
      
      // Set error after all retries exhausted
      setError(err instanceof Error ? err.message : 'Failed to fetch emails');
      retryCountRef.current = 0; // Reset retry count
    } finally {
      isFetchingRef.current = false;
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [isInitialLoad, apiConfig.MAX_RETRY_ATTEMPTS, apiConfig.RETRY_DELAY]);

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
    
    // Auto-refresh using configured interval
    const interval = setInterval(() => {
      // Only fetch if not currently fetching
      if (!isFetchingRef.current) {
        fetchEmails(false);
      } else {
        console.log('Skipping scheduled fetch - previous request still in progress');
      }
    }, apiConfig.EMAIL_REFRESH_INTERVAL);
    
    return () => {
      clearInterval(interval);
      // Abort any ongoing request when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchEmails, apiConfig.EMAIL_REFRESH_INTERVAL]);

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
