export interface EmailData {
  id: string;
  messageId?: string; // Store the message_id for Lyzr API calls
  subject: string;
  sender: string;
  recipients: string[];
  body?: string;
  timestamp?: string;
  attachments?: EmailAttachment[];
  action?: EmailAction;
  is_read?: boolean;
  lyzrData?: LyzrData;
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

export interface LyzrData {
  _id: string;
  email_id: string;
  session_id: string;
  raw_response: string;
  extracted_json: LyzrExtractedData;
  processed_at: string;
  success: boolean;
  error: string | null;
}

export interface LyzrExtractedData {
  classification?: string;
  confidence_score?: number;
  routing_action?: string;
  key_indicators?: string[];
  salesforce_action?: string;
  existing_case_number?: string | null;
  priority_level?: string;
  auto_acknowledgment?: string;
  requires_human_review?: boolean;
  extracted_entities?: {
    customer_name?: string;
    issue_type?: string;
    technical_steps_taken?: string[];
    contact_info?: string;
    [key: string]: any;
  };
  [key: string]: any; // Allow additional dynamic properties
}

export interface LyzrApiResponse {
  email_id: string;
  lyzr_data: LyzrData;
  status: string;
}
