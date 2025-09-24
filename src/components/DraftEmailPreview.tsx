import React, { useState, useEffect } from 'react';
import { EmailData } from '../types/email';
import { Edit3, Send, CheckCircle, XCircle, RefreshCw, Mail, User, Clock, AlertTriangle, MessageSquare } from 'lucide-react';
import { apiService } from '../services/api';
import { FeedbackData, CreateFeedbackRequest } from '../types/feedback';
import FeedbackModal from './FeedbackModal';
// @ts-ignore
import DraftEmailEditor from './DraftEmailEditor';

interface DraftEmailPreviewProps {
  emailId: string | null;
  emails: EmailData[];
  onEmailUpdate: () => void;
}

const DraftEmailPreview: React.FC<DraftEmailPreviewProps> = ({
  emailId,
  emails,
  onEmailUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [customDraft, setCustomDraft] = useState<string>('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState<FeedbackData[]>([]);

  const email = emails.find(e => e.id === emailId);

  // Clear success/error messages when email changes
  useEffect(() => {
    setSendSuccess(null);
    setSendError(null);
    setCustomDraft('');
    setIsEditing(false);
  }, [emailId]);

  // Fetch feedback data when email changes
  useEffect(() => {
    const fetchFeedbackData = async () => {
      if (!emailId) {
        setFeedbackData([]);
        return;
      }

      try {
        const feedback = await apiService.getFeedbackByEmail(emailId);
        setFeedbackData(feedback);
      } catch (error) {
        console.error('Failed to fetch feedback data:', error);
        setFeedbackData([]);
      }
    };

    fetchFeedbackData();
  }, [emailId]);

  // Generate email content from Lyzr data
  const generateEmailContent = (email: EmailData): string => {
    if (!email.lyzrData?.extracted_json) {
      return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <p>Thank you for your email. We have received your message and are processing it.</p>
          <p>Our team will review your request and get back to you shortly.</p>
          <br>
          <p>Best regards,<br>Support Team</p>
        </div>
      `.trim();
    }

    const { extracted_json } = email.lyzrData;

    // Check for new API structure first
    if (extracted_json.customer_response) {
      const response = extracted_json.customer_response;
      return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <p>Thank you for your email. We have received your message and our team will review your request and get back to you in the next ${response.estimated_response_time || '24 hours'}.</p>
          <br>
          <p>${response.next_steps || 'We are processing your request and will contact you soon.'}</p>
          ${response.case_reference ? `
          <br>
          <p><strong>Reference: ${response.case_reference}</strong></p>
          ` : ''}
          <br>
          <p>Best regards,<br>Support Team</p>
          <br>
        </div>
      `.trim();
    }

    // Fallback to default template
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p>Thank you for your email. We have received your message and are processing it.</p>
        <p>Our team will review your request and get back to you shortly.</p>
        <br>
        <p>Best regards,<br>Support Team</p>
        <br>
      </div>
    `.trim();
  };

  const handleApprove = async () => {
    if (!email) return;

    setSendingEmail(true);
    setSendSuccess(null);
    setSendError(null);

    try {
      // Get the current draft content
      const currentContent = getDraftContent();

      // Send custom draft (which includes any edits made)
      await handleSendCustomDraft(currentContent, true); // Skip loading state since we're managing it here
    } catch (error) {
      console.error('Failed to send email:', error);
      setSendError(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSaveDraft = async (content: string) => {
    if (!email) return;

    try {
      // Save draft using the API
      const response = await apiService.saveEmailDraft(email.messageId || email.id, content);
      setCustomDraft(response.custom_draft_message);

      // Update the email's draft data
      if (email.draftData) {
        email.draftData.custom_draft_message = response.custom_draft_message;
        email.draftData.draft_edited = response.draft_edited;
        email.draftData.draft_edited_at = response.draft_edited_at;
      } else {
        // Create draft data if it doesn't exist
        email.draftData = {
          email_id: email.messageId || email.id,
          custom_draft_message: response.custom_draft_message,
          draft_edited: response.draft_edited,
          draft_edited_at: response.draft_edited_at,
          acknowledgment_email_sent: false
        };
      }

      setIsEditing(false);
      console.log('Draft saved successfully:', response);
    } catch (error) {
      console.error('Failed to save draft:', error);
      throw error;
    }
  };

  const handleSendCustomDraft = async (content: string, skipLoadingState = false) => {
    if (!email) return;

    if (!skipLoadingState) {
      setSendingEmail(true);
      setSendSuccess(null);
      setSendError(null);
    }

    try {
      // First save the draft
      await apiService.saveEmailDraft(email.messageId || email.id, content);

      // Then send the custom draft
      const response = await apiService.sendCustomDraft(email.messageId || email.id);

      if (response.success) {
        setSendSuccess(`Custom email sent successfully to ${response.sender_email}`);

        // Update the email's draft data
        if (email.draftData) {
          email.draftData.acknowledgment_email_sent = true;
          email.draftData.acknowledgment_email_sent_at = response.sent_at;
        } else {
          // Create draft data if it doesn't exist
          email.draftData = {
            email_id: email.messageId || email.id,
            acknowledgment_email_sent: true,
            acknowledgment_email_sent_at: response.sent_at,
            draft_edited: false
          };
        }

        setIsEditing(false);
        onEmailUpdate();
      } else {
        setSendError(response.error || 'Failed to send custom draft');
      }
    } catch (error) {
      console.error('Failed to send custom draft:', error);
      setSendError(error instanceof Error ? error.message : 'Failed to send custom email');
      throw error; // Re-throw to let handleApprove catch it
    } finally {
      if (!skipLoadingState) {
        setSendingEmail(false);
      }
    }
  };

  const isEmailSent = () => {
    return email?.draftData?.acknowledgment_email_sent === true;
  };

  const handleFeedbackSubmit = async (feedbackData: CreateFeedbackRequest) => {
    try {
      await apiService.createFeedback(feedbackData);
      // Refresh feedback data after submission
      if (emailId) {
        const updatedFeedback = await apiService.getFeedbackByEmail(emailId);
        setFeedbackData(updatedFeedback);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      throw error;
    }
  };

  const getDraftContent = () => {
    // Use custom draft from database if available (highest priority)
    if (email?.draftData?.custom_draft_message) {
      return email.draftData.custom_draft_message;
    }
    // Use local custom draft if being edited (second priority)
    if (customDraft) return customDraft;
    // Generate from Lyzr data (fallback)
    if (email) return generateEmailContent(email);
    return '';
  };

  if (!emailId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select an Email</h3>
          <p className="text-sm text-gray-500">Choose an email from the list to view and manage its draft response</p>
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Not Found</h3>
          <p className="text-sm text-gray-500">The selected email could not be loaded</p>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <DraftEmailEditor
        email={email}
        initialContent={getDraftContent()}
        onSave={handleSaveDraft}
        onSend={handleSendCustomDraft}
        onCancel={() => setIsEditing(false)}
        isSending={sendingEmail}
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with Edit/Approve buttons */}
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-xl font-semibold text-gray-900">Response Email</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">To:</span>
                <span className="px-2 py-1 bg-white text-blue-800 rounded-full text-xs font-medium shadow-sm">
                  {email.sender}
                </span>
              </div>
              <div className="flex items-center space-x-2 w-full">
                <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-500 flex-shrink-0">Subject:</span>
                <span className="text-gray-700 font-medium flex-1 truncate">Re: {email.subject}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isEmailSent() ? (
              <div className="flex items-center space-x-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Email has been sent</span>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsFeedbackModalOpen(true)}
                  disabled={sendingEmail}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 shadow-sm transition-all duration-200"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Feedback</span>
                </button>

                <button
                  onClick={() => setIsEditing(true)}
                  disabled={sendingEmail}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 shadow-sm transition-all duration-200"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={handleApprove}
                  disabled={sendingEmail}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200"
                >
                  {sendingEmail ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Approve & Send</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Email metadata */}
        <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
          {email.lyzrData?.processed_at && (
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Draft generated {new Date(email.lyzrData.processed_at).toLocaleString()}</span>
            </div>
          )}
          {isEmailSent() && email.draftData?.acknowledgment_email_sent_at && (
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3" />
              <span>Sent {new Date(email.draftData.acknowledgment_email_sent_at).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {sendSuccess && (
        <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">Success!</p>
              <p className="text-xs text-green-700 mt-1">{sendSuccess}</p>
            </div>
          </div>
        </div>
      )}

      {sendError && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-xs text-red-700 mt-1">{sendError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Email Preview */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-1">
          {/* Email Content */}
          <div className="bg-white border border-gray-200 min-h-96">
            <div
              className="p-6"
              dangerouslySetInnerHTML={{
                __html: getDraftContent()
              }}
            />
          </div>

          {/* Feedback Summary */}
          {feedbackData.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <MessageSquare className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-yellow-900 mb-2">Human Review Summary</h4>
                  <div className="space-y-2">
                    {feedbackData.slice(0, 3).map((feedback) => (
                      <div key={feedback.id} className="text-xs text-yellow-800">
                        <span className="font-medium capitalize">{feedback.feedback_type.replace('_', ' ')}</span>
                        {feedback.rating && <span className="ml-1">({feedback.rating}/5)</span>}
                        {feedback.comment && <span className="ml-2 italic">"{feedback.comment.slice(0, 100)}{feedback.comment.length > 100 ? '...' : ''}"</span>}
                      </div>
                    ))}
                    {feedbackData.length > 3 && (
                      <div className="text-xs text-yellow-700 font-medium">
                        +{feedbackData.length - 3} more review{feedbackData.length - 3 !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Draft Info */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Mail className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Draft Information</p>
                <p className="text-xs text-blue-700 mt-1">
                  {customDraft
                    ? 'This draft has been customized and edited'
                    : 'This draft was automatically generated based on AI analysis'
                  }
                  {email.lyzrData?.extracted_json?.email_analysis?.classification && (
                    <span> • Classification: {email.lyzrData.extracted_json.email_analysis.classification}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={handleFeedbackSubmit}
        emailId={emailId || ''}
        emailSubject={email?.subject || ''}
      />
    </div>
  );
};

export default DraftEmailPreview;
