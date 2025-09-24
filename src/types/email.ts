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
  draftData?: DraftData;
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

export interface DraftData {
  _id?: string;
  email_id: string;
  custom_draft_message?: string;
  draft_edited: boolean;
  draft_edited_at?: string;
  acknowledgment_email_sent: boolean;
  acknowledgment_email_sent_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LyzrExtractedData {
  // Legacy fields (keeping for backward compatibility)
  classification?: string;
  confidence_score?: number;
  routing_action?: string;
  key_indicators?: string[];
  salesforce_action_legacy?: string;
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

  // New API fields
  email_analysis?: {
    classification: string;
    confidence_score: number;
    key_indicators: string[];
    extracted_entities: {
      policy_number?: string | null;
      claim_id?: string | null;
      amount?: string;
      dates?: string[];
      customer_email?: string | null;
      [key: string]: any;
    };
    priority_level: string;
    urgency_factors: string[];
  };

  salesforce_action?: {
    action_type: string;
    case_id: string;
    case_number: string;
    case_status: string;
    routing_team: string;
    comment_added: boolean;
    comment_id: string | null;
  };

  customer_response?: {
    auto_acknowledgment: string;
    estimated_response_time: string;
    case_reference: string;
    next_steps: string;
  };

  internal_routing?: {
    specialist_team: string;
    requires_human_review: boolean;
    escalation_needed: boolean;
    follow_up_date: string;
  };

  [key: string]: any; // Allow additional dynamic properties
}

export interface LyzrApiResponse {
  email_id: string;
  lyzr_data: LyzrData;
  status: string;
}
