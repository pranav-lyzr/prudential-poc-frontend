import { EmailData, LyzrApiResponse } from '../types/email';
import { FeedbackData, FeedbackStats, CreateFeedbackRequest, UpdateFeedbackRequest } from '../types/feedback';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://prudential-poc-backend.ca.lyzr.app';

// Salesforce authentication types
interface SalesforceLoginResponse {
  login_url: string;
  state: string;
  message: string;
}

interface SalesforceAuthStatus {
  isAuthenticated: boolean;
  expiresAt?: string;
  userInfo?: {
    name: string;
    email: string;
    orgId: string;
  };
}

class ApiService {
  constructor() {
    // No longer need to check localStorage on initialization
  }

  // Salesforce Authentication Methods
  async getSalesforceLoginUrl(): Promise<SalesforceLoginResponse> {
    try {
      console.log('Getting Salesforce login URL...');
      const response = await this.request<SalesforceLoginResponse>('/api/v1/salesforce/login');

      // Store the state for callback verification
      localStorage.setItem('salesforce_state', response.state);

      return response;
    } catch (error) {
      console.error('Failed to get Salesforce login URL:', error);
      throw error;
    }
  }

  async handleSalesforceCallback(code: string, state: string): Promise<void> {
    try {
      console.log('Handling Salesforce callback...');

      // Verify state matches what we stored
      const storedState = localStorage.getItem('salesforce_state');
      if (state !== storedState) {
        throw new Error('Invalid state parameter');
      }

      // Call the callback endpoint
      await this.request('/api/v1/salesforce/callback', {
        method: 'POST',
        body: JSON.stringify({ code, state }),
      });

      // Clear stored state
      localStorage.removeItem('salesforce_state');

      console.log('Salesforce authentication successful');
    } catch (error) {
      console.error('Salesforce callback failed:', error);
      throw error;
    }
  }

  async logoutSalesforce(): Promise<void> {
    try {
      console.log('Logging out from Salesforce...');

      // Call logout endpoint if available
      try {
        await this.request('/api/v1/salesforce/logout', {
          method: 'POST',
        });
      } catch (error) {
        console.log('Logout endpoint not available, proceeding with local logout');
      }

      console.log('Salesforce logout successful');
    } catch (error) {
      console.error('Salesforce logout failed:', error);
      throw error;
    }
  }

  async getSalesforceAuthStatus(): Promise<SalesforceAuthStatus> {
    try {
      // Always check API status instead of localStorage
      const status = await this.getSalesforceStatus();

      return {
        isAuthenticated: status.authenticated || false,
        expiresAt: status.token_expiry_timestamp || undefined,
        userInfo: status.authenticated ? {
          name: status.user_id || 'Unknown',
          email: status.user_id || 'Unknown',
          orgId: status.instance_url || 'Unknown'
        } : undefined
      };
    } catch (error) {
      console.error('Error getting Salesforce auth status:', error);
      return {
        isAuthenticated: false
      };
    }
  }

  async getSalesforceStatus(): Promise<any> {
    try {
      console.log('Getting Salesforce status...');
      const response = await this.request('/api/v1/salesforce/status');
      return response;
    } catch (error) {
      console.error('Failed to get Salesforce status:', error);
      throw error;
    }
  }


  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log('API request: Making request to:', url);
      console.log('API request: Config:', config);

      const response = await fetch(url, config);
      console.log('API request: Response status:', response.status);
      console.log('API request: Response headers:', response.headers);

      if (!response.ok) {
        // Handle 401 errors by checking Salesforce token status
        if (response.status === 401) {
          console.log('API request: Received 401, checking Salesforce token status...');

          try {
            // Check if tokens are still valid via status endpoint
            const status = await this.getSalesforceStatus();
            if (!status.authenticated) {
              console.log('Tokens are invalid, user needs to re-authenticate');
              // Emit event to notify UI of authentication failure
              window.dispatchEvent(new CustomEvent('salesforce-auth-failed'));
            }
          } catch (statusError) {
            console.error('Token status check failed:', statusError);
            // Emit event to notify UI of authentication failure
            window.dispatchEvent(new CustomEvent('salesforce-auth-failed'));
          }
        }

        const errorText = await response.text();
        console.error('API request: Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const responseData = await response.json();
      console.log('API request: Response data:', responseData);

      return responseData;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }


  // Get all emails
  async getEmails(signal?: AbortSignal): Promise<EmailData[]> {
    try {
      console.log('Fetching emails from API...');
      // Call the real API endpoint with abort signal
      const response = await this.request<{ emails: any[]; count: number }>('/api/v1/webhook/emails/all', {
        signal
      });
      console.log('API response received:', response);

      // Transform the API response to match our EmailData interface
      const transformedEmails = response.emails.map(email => {
        console.log('Transforming email:', email);
        const transformed = this.transformApiEmail(email);
        console.log('Transformed email:', transformed);
        return transformed;
      });

      // Sort emails by timestamp in descending order (latest first)
      const sortedEmails = transformedEmails.sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return dateB - dateA; // Descending order (latest first)
      });

      console.log('Final transformed emails:', sortedEmails);
      return sortedEmails;
    } catch (error) {
      console.error('Failed to fetch emails from API, falling back to mock data:', error);
      // Fallback to mock data if API fails
      return this.getMockEmails();
    }
  }

  // Get Lyzr data for email
  async getLyzrData(emailId: string): Promise<LyzrApiResponse> {
    try {
      console.log(`Fetching Lyzr data for email ID: ${emailId}`);
      console.log(`Email ID type: ${typeof emailId}, length: ${emailId.length}`);

      // For Lyzr API, we need to use the message_id, not the _id
      // The emailId parameter should be the message_id from the email
      const encodedEmailId = encodeURIComponent(emailId);
      const url = `/api/v1/webhook/emails/${encodedEmailId}/lyzr-data`;

      console.log(`Lyzr API URL: ${url}`);
      console.log(`Full Lyzr API URL: ${API_BASE_URL}${url}`);
      console.log(`Original emailId: ${emailId}`);
      console.log(`Encoded emailId: ${encodedEmailId}`);

      const response = await this.request<LyzrApiResponse>(url);
      console.log('Lyzr API response received:', response);

      return response;
    } catch (error) {
      console.error(`Failed to fetch Lyzr data for email ${emailId}:`, error);
      throw error;
    }
  }

  // Get email by ID
  async getEmailById(id: string): Promise<EmailData> {
    try {
      const response = await this.request<EmailData>(`/api/v1/email/${id}`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch email ${id}:`, error);
      // Fallback to mock data if API fails
      const mockEmails = this.getMockEmails();
      const email = mockEmails.find(e => e.id === id);
      if (email) {
        return email;
      }
      throw new Error(`Email with ID ${id} not found`);
    }
  }

  // Create new email
  async createEmail(emailData: Omit<EmailData, 'id'>): Promise<EmailData> {
    try {
      const response = await this.request<EmailData>('/api/v1/email', {
        method: 'POST',
        body: JSON.stringify(emailData),
      });
      return response;
    } catch (error) {
      console.error('Failed to create email:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; service: string }> {
    try {
      const response = await this.request<{ status: string; service: string }>('/health');
      return response;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Test Lyzr API endpoint
  async testLyzrEndpoint(): Promise<LyzrApiResponse> {
    try {
      console.log('Testing Lyzr API endpoint...');

      // Use the example message ID from the user's curl command
      const testMessageId = 'AAMkAGFlYjU0ZDcyLTQwN2MtNDY2OC05MDlkLWI1MTYwZDI4Mzk0MQBGAAAAAAAbbYndWHI-TZ_6NpZEpYvyBwCifDyVNCg4RZszsE4CITOpAAAAAAEMAACifDyVNCg4RZszsE4CITOpAAAEoaqSAAA%3D';

      console.log('Test message ID:', testMessageId);
      console.log('Test message ID length:', testMessageId.length);

      const response = await this.getLyzrData(testMessageId);
      console.log('Test Lyzr API response:', response);

      return response;
    } catch (error) {
      console.error('Test Lyzr API failed:', error);
      throw error;
    }
  }

  // Transform API email format to our EmailData interface
  private transformApiEmail(apiEmail: any): EmailData {
    console.log('transformApiEmail: Raw API email:', apiEmail);
    console.log('transformApiEmail: _id:', apiEmail._id);
    console.log('transformApiEmail: message_id:', apiEmail.message_id);

    const transformed = {
      id: apiEmail._id || apiEmail.message_id, // Use _id as primary, fallback to message_id
      messageId: apiEmail.message_id, // Store message_id separately for Lyzr API calls
      subject: apiEmail.subject || 'No Subject',
      sender: apiEmail.from?.emailAddress?.address || 'Unknown Sender',
      recipients: apiEmail.to?.map((recipient: any) => recipient.emailAddress?.address || 'Unknown Recipient') || [],
      body: apiEmail.body?.content || '', // Keep HTML content for proper display
      timestamp: apiEmail.received_date || apiEmail.extracted_at,
      attachments: apiEmail.attachments || [],
      is_read: apiEmail.is_read || false,
      // Action is optional in the type, so we can omit it
    };

    console.log('transformApiEmail: Transformed email:', transformed);
    return transformed;
  }

  // Mock data for development (will be removed when real API is ready)
  private getMockEmails(): EmailData[] {
    const mockEmails: EmailData[] = [
      {
        id: '1',
        messageId: 'AAMkAGFlYjU0ZDcyLTQwN2MtNDY2OC05MDlkLWI1MTYwZDI4Mzk0MQBGAAAAAAAbbYndWHI-TZ_6NpZEpYvyBwCifDyVNCg4RZszsE4CITOpAAAAAAEMAACifDyVNCg4RZszsE4CITOpAAAEoaqSAAA%3D',
        subject: 'Quarterly Financial Report Q4 2024',
        sender: 'finance@prudential.com',
        recipients: ['management@prudential.com', 'board@prudential.com'],
        body: 'Please find attached the quarterly financial report for Q4 2024. This report includes detailed analysis of our performance, key metrics, and projections for the upcoming quarter. Please review and provide feedback by end of week.',
        timestamp: '2024-12-15T10:30:00Z',
        attachments: [
          {
            id: 'att1',
            name: 'Q4_Financial_Report_2024.pdf',
            size: 2048576,
            type: 'application/pdf'
          },
          {
            id: 'att2',
            name: 'Q4_Financial_Summary.xlsx',
            size: 512000,
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        ],
        action: {
          id: 'act1',
          type: 'processed',
          description: 'Email processed and archived in financial records',
          timestamp: '2024-12-15T11:15:00Z',
          user: 'system@prudential.com'
        },
        lyzrData: {
          _id: '68b01c61cec0e676dbbedbe8',
          email_id: 'AAMkAGFlYjU0ZDcyLTQwN2MtNDY2OC05MDlkLWI1MTYwZDI4Mzk0MQBGAAAAAAAbbYndWHI-TZ_6NpZEpYvyBwCifDyVNCg4RZszsE4CITOpAAAAAAEMAACifDyVNCg4RZszsE4CITOpAAAEoaqSAAA%3D',
          session_id: '68afeef999e8c20dd8f25774-54d39dcd023b',
          raw_response: '{"response":"```json\\n{\\n  \\\"classification\\\": \\\"FINANCIAL\\\",\\n  \\\"confidence_score\\\": 0.95,\\n  \\\"routing_action\\\": \\\"finance_team\\\",\\n  \\\"key_indicators\\\": [\\\"quarterly report\\\", \\\"financial analysis\\\", \\\"Q4 2024\\\"],\\n  \\\"salesforce_action\\\": \\\"ARCHIVE_DOCUMENT\\\",\\n  \\\"existing_case_number\\\": null,\\n  \\\"priority_level\\\": \\\"MEDIUM\\\",\\n  \\\"auto_acknowledgment\\\": \\\"template_financial_received\\\",\\n  \\\"requires_human_review\\\": false,\\n  \\\"extracted_entities\\\": {\\n    \\\"report_type\\\": \\\"Quarterly Financial Report\\\",\\n    \\\"period\\\": \\\"Q4 2024\\\",\\n    \\\"department\\\": \\\"Finance\\\",\\n    \\\"action_required\\\": \\\"Review and feedback\\\"\\n  }\\n}\\n```"}',
          extracted_json: {
            classification: 'FINANCIAL',
            confidence_score: 0.95,
            routing_action: 'finance_team',
            key_indicators: ['quarterly report', 'financial analysis', 'Q4 2024'],
            salesforce_action_legacy: 'ARCHIVE_DOCUMENT',
            existing_case_number: null,
            priority_level: 'MEDIUM',
            auto_acknowledgment: 'template_financial_received',
            requires_human_review: false,
            extracted_entities: {
              report_type: 'Quarterly Financial Report',
              period: 'Q4 2024',
              department: 'Finance',
              action_required: 'Review and feedback'
            }
          },
          processed_at: '2024-12-15T10:35:00Z',
          success: true,
          error: null
        }
      },
      {
        id: '2',
        messageId: 'AAMkAGFlYjU0ZDcyLTQwN2MtNDY2OC05MDlkLWI1MTYwZDI4Mzk0MQBGAAAAAAAbbYndWHI-TZ_6NpZEpYvyBwCifDyVNCg4RZszsE4CITOpAAAAAAEMAACifDyVNCg4RZszsE4CITOpAAAEoaqSAAA%3D',
        subject: 'Customer Service Inquiry - Policy #12345',
        sender: 'customer@example.com',
        recipients: ['support@prudential.com'],
        body: 'I have a question about my insurance policy. I recently moved to a new address and need to update my information. Can you please help me with this process?',
        timestamp: '2024-12-15T09:15:00Z',
        action: {
          id: 'act2',
          type: 'replied',
          description: 'Customer service representative replied with policy update instructions',
          timestamp: '2024-12-15T10:00:00Z',
          user: 'sarah.johnson@prudential.com'
        }
      },
      {
        id: '3',
        messageId: 'AAMkAGFlYjU0ZDcyLTQwN2MtNDY2OC05MDlkLWI1MTYwZDI4Mzk0MQBGAAAAAAAbbYndWHI-TZ_6NpZEpYvyBwCifDyVNCg4RZszsE4CITOpAAAAAAEMAACifDyVNCg4RZszsE4CITOpAAAEoaqSAAA%3D',
        subject: 'New Business Partnership Proposal',
        sender: 'partnerships@techcorp.com',
        recipients: ['business@prudential.com', 'strategy@prudential.com'],
        body: 'We would like to discuss a potential partnership opportunity between our companies. We believe there is significant synergy in combining our technology solutions with your insurance expertise.',
        timestamp: '2024-12-15T08:45:00Z',
        attachments: [
          {
            id: 'att3',
            name: 'Partnership_Proposal_2024.pdf',
            size: 1536000,
            type: 'application/pdf'
          }
        ],
        action: {
          id: 'act3',
          type: 'forwarded',
          description: 'Proposal forwarded to business development team for review',
          timestamp: '2024-12-15T09:30:00Z',
          user: 'mike.davis@prudential.com'
        }
      },
      {
        id: '4',
        subject: 'System Maintenance Notification',
        sender: 'it@prudential.com',
        recipients: ['all-staff@prudential.com'],
        body: 'Scheduled system maintenance will occur this weekend from 2:00 AM to 6:00 AM EST. During this time, some services may be temporarily unavailable. We apologize for any inconvenience.',
        timestamp: '2024-12-15T07:30:00Z',
        action: {
          id: 'act4',
          type: 'archived',
          description: 'Notification archived after maintenance completion',
          timestamp: '2024-12-15T06:30:00Z',
          user: 'system@prudential.com'
        }
      },
      {
        id: '5',
        subject: 'Employee Benefits Update',
        sender: 'hr@prudential.com',
        recipients: ['employees@prudential.com'],
        body: 'We are pleased to announce updates to our employee benefits package, effective January 1st, 2025. The new package includes enhanced health coverage and additional wellness programs.',
        timestamp: '2024-12-15T06:00:00Z',
        attachments: [
          {
            id: 'att4',
            name: 'Benefits_Update_2025.pdf',
            size: 1024000,
            type: 'application/pdf'
          }
        ],
        action: {
          id: 'act5',
          type: 'pending',
          description: 'Awaiting final approval from management',
          timestamp: '2024-12-15T06:00:00Z',
          user: 'hr@prudential.com'
        }
      }
    ];

    // Sort mock emails by timestamp in descending order (latest first)
    return mockEmails.sort((a, b) => {
      const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return dateB - dateA; // Descending order (latest first)
    });
  }

  // ===== FEEDBACK API METHODS =====

  // Create feedback
  async createFeedback(feedbackData: CreateFeedbackRequest): Promise<FeedbackData> {
    try {
      console.log('Creating feedback:', feedbackData);
      const response = await this.request<FeedbackData>('/api/v1/feedback/', {
        method: 'POST',
        body: JSON.stringify(feedbackData)
      });
      console.log('Feedback created successfully:', response);
      return response;
    } catch (error) {
      console.error('Failed to create feedback:', error);
      throw error;
    }
  }

  // Get feedback by email ID
  async getFeedbackByEmail(emailId: string): Promise<FeedbackData[]> {
    try {
      console.log('Fetching feedback for email:', emailId);
      const response = await this.request<FeedbackData[]>(`/api/v1/feedback/email/${emailId}`);
      console.log('Feedback fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('Failed to fetch feedback by email:', error);
      throw error;
    }
  }

  // Get feedback statistics for email
  async getFeedbackStatsForEmail(emailId: string): Promise<FeedbackStats> {
    try {
      console.log('Fetching feedback stats for email:', emailId);
      const response = await this.request<FeedbackStats>(`/api/v1/feedback/stats/email/${emailId}`);
      console.log('Feedback stats fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('Failed to fetch feedback stats:', error);
      throw error;
    }
  }

  // Get overall feedback statistics
  async getOverallFeedbackStats(): Promise<FeedbackStats> {
    try {
      console.log('Fetching overall feedback stats');
      const response = await this.request<FeedbackStats>('/api/v1/feedback/stats/overview');
      console.log('Overall feedback stats fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('Failed to fetch overall feedback stats:', error);
      throw error;
    }
  }

  // Get available feedback types
  async getFeedbackTypes(): Promise<string[]> {
    try {
      console.log('Fetching available feedback types');
      const response = await this.request<string[]>('/api/v1/feedback/types/');
      console.log('Feedback types fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('Failed to fetch feedback types:', error);
      throw error;
    }
  }

  // Update feedback
  async updateFeedback(feedbackId: string, updateData: UpdateFeedbackRequest): Promise<FeedbackData> {
    try {
      console.log('Updating feedback:', feedbackId, updateData);
      const response = await this.request<FeedbackData>(`/api/v1/feedback/${feedbackId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      console.log('Feedback updated successfully:', response);
      return response;
    } catch (error) {
      console.error('Failed to update feedback:', error);
      throw error;
    }
  }

  // Delete feedback
  async deleteFeedback(feedbackId: string): Promise<{ message: string }> {
    try {
      console.log('Deleting feedback:', feedbackId);
      const response = await this.request<{ message: string }>(`/api/v1/feedback/${feedbackId}`, {
        method: 'DELETE'
      });
      console.log('Feedback deleted successfully:', response);
      return response;
    } catch (error) {
      console.error('Failed to delete feedback:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
