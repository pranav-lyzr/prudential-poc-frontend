import React, { useState, useEffect } from 'react';
import { EmailData } from '../types/email';
import { Save, Send, X, RefreshCw, AlertCircle, Eye, EyeOff, Edit } from 'lucide-react';

interface DraftEmailEditorProps {
  email: EmailData;
  initialContent: string;
  onSave: (content: string) => Promise<void>;
  onSend: (content: string) => Promise<void>;
  onCancel: () => void;
  isSending?: boolean;
}

const DraftEmailEditor: React.FC<DraftEmailEditorProps> = ({
  email,
  initialContent,
  onSave,
  onSend,
  onCancel,
  isSending = false
}) => {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Helper function to convert HTML to plain text for editing
  const stripHtmlForEditing = (html: string) => {
    if (!html) return '';

    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // First, handle structured content by replacing HTML tags with proper line breaks
    let processedHtml = html
      // Convert closing paragraphs followed by opening paragraphs to double line breaks
      .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
      // Convert standalone paragraph tags
      .replace(/<p[^>]*>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      // Convert div tags to line breaks
      .replace(/<\/div>\s*<div[^>]*>/gi, '\n\n')
      .replace(/<div[^>]*>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      // Convert line breaks
      .replace(/<br\s*\/?>/gi, '\n')
      // Convert horizontal rules to separators
      .replace(/<hr[^>]*>/gi, '\n---\n')
      // Remove other HTML tags but keep their content
      .replace(/<[^>]*>/g, '');

    // Clean up the text
    let cleanText = processedHtml
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      // Clean up excessive whitespace but preserve intentional line breaks
      .replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with single space
      .replace(/\n[ \t]+/g, '\n') // Remove leading whitespace from lines
      .replace(/[ \t]+\n/g, '\n') // Remove trailing whitespace from lines
      .replace(/\n{3,}/g, '\n\n') // Replace 3+ consecutive newlines with 2
      .trim();

    // Remove disclaimer if present
    cleanText = cleanText.replace(/This is an automated acknowledgment.*$/i, '').trim();

    // Ensure proper paragraph spacing
    const paragraphs = cleanText.split('\n').filter(line => line.trim());
    const formattedText = paragraphs.join('\n\n');

    return formattedText;
  };

  useEffect(() => {
    // Initialize content, converting HTML to plain text if needed
    if (initialContent) {
      // Check if content is HTML (contains tags)
      const isHtml = /<[^>]*>/g.test(initialContent);
      let textContent = '';
      if (isHtml) {
        textContent = stripHtmlForEditing(initialContent);
      } else {
        textContent = initialContent;
      }
      setContent(textContent);
      setOriginalContent(textContent);
    } else {
      setContent('');
      setOriginalContent('');
    }
  }, [initialContent]);

  useEffect(() => {
    setHasChanges(content !== originalContent);
  }, [content, originalContent]);

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      await onSave(content);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save draft:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSend = async () => {
    setIsSaving(false);
    setSaveError(null);

    try {
      await onSend(content);
    } catch (error) {
      console.error('Failed to send draft:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to send draft');
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  const convertToHtml = (text: string) => {
    // Convert plain text back to HTML with consistent formatting
    if (!text.trim()) return '';

    // Split by double line breaks to get paragraphs
    const paragraphs = text.split('\n\n').filter(p => p.trim());

    // Process each paragraph
    const htmlParagraphs = paragraphs.map(paragraph => {
      const trimmedParagraph = paragraph.trim();

      // Handle separator lines
      if (trimmedParagraph === '---') {
        return '<hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;">';
      }

      // Convert single line breaks within paragraphs to <br> tags
      const processedParagraph = trimmedParagraph.replace(/\n/g, '<br>');

      return `<p style="margin: 0 0 16px 0; line-height: 1.5;">${processedParagraph}</p>`;
    });

    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 100%;">
        ${htmlParagraphs.join('\n        ')}
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        <p style="font-size: 12px; color: #6b7280; margin: 0; font-style: italic;">This is an automated acknowledgment. Please do not reply to this email.</p>
      </div>
    `.trim();
  };


  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Edit Email Draft</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">To:</span>
                <span className="px-2 py-1 bg-blue-50 text-blue-800 rounded-full text-xs font-medium">
                  {email.sender}
                </span>
              </div>
              <div className="flex items-center space-x-2 w-full">
                <span className="text-gray-500 flex-shrink-0">Subject:</span>
                <span className="text-gray-700 font-medium flex-1 break-words">Re: {email.subject}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Preview Toggle */}
            <button
              onClick={() => setIsPreview(!isPreview)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isPreview
                ? ' bg-white text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }`}
            >
              {isPreview ? <Edit className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{isPreview ? 'Edit Mode' : 'Preview'}</span>
            </button>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving || isSending}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Draft</span>
                </>
              )}
            </button>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={isSending || isSaving}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200"
            >
              {isSending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Now</span>
                </>
              )}
            </button>

            {/* Cancel Button */}
            <button
              onClick={handleCancel}
              disabled={isSending || isSaving}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-all duration-200"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {saveError && (
          <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-400 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Error saving draft</h4>
                <p className="text-xs text-red-700 mt-1">{saveError}</p>
              </div>
            </div>
          </div>
        )}

        {hasChanges && !saveError && (
          <div className="mt-4 p-3 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-amber-400 rounded-full animate-pulse"></div>
              <p className="text-sm text-amber-800 font-medium">You have unsaved changes</p>
            </div>
          </div>
        )}
      </div>

      {/* Editor/Preview Area */}
      <div className="flex-1 overflow-hidden">
        {isPreview ? (
          // Preview Mode
          <div className="h-full overflow-y-auto bg-gray-50">
            <div className="p-4">
              {/* Email Container - Simulated Email Client */}
              <div className="bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden">
                {/* Email Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 relative">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs uppercase font-semibold text-gray-500">From:</span>
                      <span className="text-gray-800 font-medium">support@prudential.com</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs uppercase font-semibold text-gray-500">To:</span>
                      <span className="text-gray-800 font-medium">{email.sender}</span>
                    </div>
                    <div className="flex items-center space-x-2 w-full">
                      <span className="text-xs uppercase font-semibold text-gray-500 flex-shrink-0">Subject:</span>
                      <span className="text-gray-800 font-medium flex-1 truncate">Re: {email.subject}</span>
                    </div>
                  </div>
                  {/* preview indicator at the top right */}
                  <div className="absolute top-4 right-4">
                    <span className="text-xs text-gray-500">Preview</span>
                  </div>
                </div>

                {/* Email Content Preview */}
                <div className="p-8 bg-white">
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: convertToHtml(content)
                    }}
                  />
                </div>
              </div>

            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="h-full bg-gray-50">
            <div className="h-full p-1">
              <div className="h-full flex flex-col">

                {/* Editor Container */}
                <div className="flex-1 flex flex-col bg-white shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Draft Content</label>
                      <div className="text-xs text-gray-500">Plain text editor</div>
                    </div>
                  </div>

                  <div className="flex-1 p-0">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      disabled={isSending || isSaving}
                      className="w-full h-full p-6 border-0 resize-none focus:ring-0 focus:outline-none text-sm leading-relaxed disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Dear [Customer Name],

Thank you for contacting us. We have received your message and...

[Write your response here]

Best regards,
Support Team"
                      style={{
                        minHeight: '400px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                      }}
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DraftEmailEditor;
