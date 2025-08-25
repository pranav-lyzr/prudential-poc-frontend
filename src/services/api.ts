import { EmailData } from '../types/email';

const API_BASE_URL = 'https://prudential-poc-backend.ca.lyzr.app';

class ApiService {
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
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Get all emails
  async getEmails(): Promise<EmailData[]> {
    try {
      console.log('Fetching emails from API...');
      // Call the real API endpoint
      const response = await this.request<{ emails: any[]; count: number }>('/api/v1/webhook/emails/all');
      console.log('API response received:', response);
      
      // Transform the API response to match our EmailData interface
      const transformedEmails = response.emails.map(email => this.transformApiEmail(email));
      
      // Sort emails by timestamp in descending order (latest first)
      const sortedEmails = transformedEmails.sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return dateB - dateA; // Descending order (latest first)
      });
      
      return sortedEmails;
    } catch (error) {
      console.error('Failed to fetch emails from API, falling back to mock data:', error);
      // Fallback to mock data if API fails
      return this.getMockEmails();
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

  // Transform API email format to our EmailData interface
  private transformApiEmail(apiEmail: any): EmailData {
    return {
      id: apiEmail._id || apiEmail.message_id,
      subject: apiEmail.subject || 'No Subject',
      sender: apiEmail.from?.emailAddress?.address || 'Unknown Sender',
      recipients: apiEmail.to?.map((recipient: any) => recipient.emailAddress?.address || 'Unknown Recipient') || [],
      body: apiEmail.body?.content || '', // Keep HTML content for proper display
      timestamp: apiEmail.received_date || apiEmail.extracted_at,
      attachments: apiEmail.attachments || [],
      is_read: apiEmail.is_read || false,
      // Remove action tracking as requested
      action: undefined
    };
  }

  // Mock data for development (will be removed when real API is ready)
  private getMockEmails(): EmailData[] {
    const mockEmails = [
      {
        id: '1',
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
        }
      },
      {
        id: '2',
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
}

export const apiService = new ApiService();
export default apiService;
