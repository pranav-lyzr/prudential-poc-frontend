export interface EmailData {
  id: string;
  subject: string;
  sender: string;
  recipients: string[];
  body?: string;
  timestamp?: string;
  attachments?: EmailAttachment[];
  action?: EmailAction;
  is_read?: boolean;
}

export interface EmailAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface EmailAction {
  id: string;
  type: 'processed' | 'archived' | 'forwarded' | 'replied' | 'pending';
  description: string;
  timestamp: string;
  user?: string;
}
