import React, { useState, useEffect } from 'react';
import { EmailData } from '../types/email';
import { Settings, Clock, User, FileText, AlertCircle, Brain, Target, Zap, Shield, MessageSquare, RefreshCw, Star, ThumbsUp, ThumbsDown, HelpCircle } from 'lucide-react';
import FeedbackModal from './FeedbackModal';
import { CreateFeedbackRequest } from '../types/feedback';
import { apiService } from '../services/api';

interface EmailActionsProps {
  email: EmailData | null;
  onFetchLyzrData?: (emailId: string) => Promise<void>;
}

const EmailActions: React.FC<EmailActionsProps> = ({ email, onFetchLyzrData }) => {
  const [lyzrLoading, setLyzrLoading] = useState(false);
  const [lyzrError, setLyzrError] = useState<string | null>(null);
  const [emailVersion, setEmailVersion] = useState(0);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);


  useEffect(() => {
    console.log('EmailActions received email:', email);
    console.log('Email ID:', email?.id);
    console.log('Email has Lyzr data:', !!email?.lyzrData);

    // Increment email version to force re-render
    setEmailVersion(prev => prev + 1);

    if (email && !email.lyzrData) {
      console.log('Email has no Lyzr data, setting loading state');
      setLyzrLoading(true);
      setLyzrError(null);
    } else if (email && email.lyzrData) {
      console.log('Email has Lyzr data, clearing loading state');
      setLyzrLoading(false);
      setLyzrError(null);
    }
  }, [email]);

  const handleFeedbackSubmit = async (feedbackData: CreateFeedbackRequest) => {
    setFeedbackSubmitting(true);
    try {
      await apiService.createFeedback(feedbackData);
      console.log('Feedback submitted successfully');
      // You could add a success notification here
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      throw error; // Re-throw to let the modal handle the error
    } finally {
      setFeedbackSubmitting(false);
    }
  };


  // Check if human review is required based on AI analysis
  const isHumanReviewRequired = () => {
    if (!email?.lyzrData?.extracted_json) return false;

    const { extracted_json } = email.lyzrData;

    // Check new API structure
    if (extracted_json.internal_routing?.requires_human_review) {
      return extracted_json.internal_routing.requires_human_review;
    }

    // Check legacy structure
    if (extracted_json.requires_human_review !== undefined) {
      return extracted_json.requires_human_review;
    }

    return false;
  };

  if (!email) {
    return (
      <div className="p-6 text-center">
        <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Email Actions</h3>
        <p className="text-gray-500">Select an email to view available actions</p>
      </div>
    );
  }

  const renderLyzrData = () => {
    console.log('renderLyzrData called');
    console.log('lyzrError:', lyzrError);
    console.log('lyzrLoading:', lyzrLoading);
    console.log('email.lyzrData:', email.lyzrData);
    console.log('email.lyzrData type:', typeof email.lyzrData);
    console.log('email.lyzrData keys:', email.lyzrData ? Object.keys(email.lyzrData) : 'null');

    if (lyzrError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-900">Analysis Failed</p>
              <p className="text-xs text-red-700 mt-1">
                {lyzrError}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (lyzrLoading) {
      console.log('Showing loading state');
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
            <div>
              <p className="text-sm font-medium text-blue-900">Loading AI Analysis...</p>
              <p className="text-xs text-blue-700 mt-1">
                Lyzr AI is analyzing this email content.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (!email.lyzrData) {
      console.log('No Lyzr data found, showing processing message');
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-900">Processing...</p>
              <p className="text-xs text-yellow-700 mt-1">
                Lyzr AI analysis is being processed for this email.
              </p>
            </div>
          </div>
        </div>
      );
    }

    const { extracted_json } = email.lyzrData;
    console.log('extracted_json:', extracted_json);

    // Make the component flexible to handle different AI response formats
    const getValue = (obj: any, key: string, defaultValue: any = 'N/A') => {
      if (obj && obj[key] !== undefined && obj[key] !== null) {
        return obj[key];
      }
      return defaultValue;
    };

    const getArrayValue = (obj: any, key: string, defaultValue: string[] = []) => {
      const value = getValue(obj, key, defaultValue);
      return Array.isArray(value) ? value : defaultValue;
    };

    const getObjectValue = (obj: any, key: string, defaultValue: any = {}) => {
      const value = getValue(obj, key, defaultValue);
      return typeof value === 'object' && value !== null ? value : defaultValue;
    };

    // Check if we have the new API structure
    const hasNewStructure = extracted_json.email_analysis || extracted_json.salesforce_action || extracted_json.customer_response || extracted_json.internal_routing;

    return (
      <div className="space-y-4">
        {/* New API Structure - Email Analysis */}
        {hasNewStructure && extracted_json.email_analysis && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-900">Email Analysis</h3>
                <p className="text-xs text-blue-700">AI Classification & Priority</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-1">Classification</p>
                <p className="font-semibold text-blue-900">{extracted_json.email_analysis.classification}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-1">Confidence</p>
                <p className="font-semibold text-blue-900">
                  {(extracted_json.email_analysis.confidence_score * 100).toFixed(0)}%
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-1">Priority Level</p>
                <p className="font-semibold text-blue-900">{extracted_json.email_analysis.priority_level}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-1">Key Indicators</p>
                <p className="font-semibold text-blue-900">{extracted_json.email_analysis.key_indicators.length}</p>
              </div>
            </div>

            {/* Key Indicators */}
            {extracted_json.email_analysis.key_indicators.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-blue-600 mb-2">Key Indicators:</p>
                <div className="flex flex-wrap gap-2">
                  {extracted_json.email_analysis.key_indicators.map((indicator, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {indicator}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Urgency Factors */}
            {extracted_json.email_analysis.urgency_factors && extracted_json.email_analysis.urgency_factors.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-blue-600 mb-2">Urgency Factors:</p>
                <div className="flex flex-wrap gap-2">
                  {extracted_json.email_analysis.urgency_factors.map((factor, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Entities */}
            {extracted_json.email_analysis.extracted_entities && (
              <div>
                <p className="text-xs font-medium text-blue-600 mb-2">Extracted Information:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(extracted_json.email_analysis.extracted_entities).map(([key, value]) => {
                    if (!value || value === null) return null;

                    const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                    if (Array.isArray(value)) {
                      return (
                        <div key={key} className="bg-white rounded p-2 border border-blue-100">
                          <p className="font-medium text-blue-700 mb-1">{displayKey}:</p>
                          <div className="flex flex-wrap gap-1">
                            {value.map((item, index) => (
                              <span
                                key={index}
                                className="px-1 py-0.5 bg-blue-50 text-blue-700 text-xs rounded"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={key} className="bg-white rounded p-2 border border-blue-100">
                        <p className="font-medium text-blue-700">{displayKey}:</p>
                        <p className="text-blue-600">{String(value)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* New API Structure - Salesforce Action */}
        {hasNewStructure && extracted_json.salesforce_action && typeof extracted_json.salesforce_action === 'object' && (() => {
          const salesforceAction = extracted_json.salesforce_action as any;
          return (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-purple-900">Salesforce Action</h3>
                  <p className="text-xs text-purple-700">Case Management Details</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div className="bg-white rounded-lg p-3 border border-purple-100">
                  <p className="text-xs font-medium text-purple-600 mb-1">Action Type</p>
                  <p className="font-semibold text-purple-900">{salesforceAction.action_type}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-purple-100">
                  <p className="text-xs font-medium text-purple-600 mb-1">Case Status</p>
                  <p className="font-semibold text-purple-900">{salesforceAction.case_status}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-purple-100">
                  <p className="text-xs font-medium text-purple-600 mb-1">Case Number</p>
                  <p className="font-semibold text-purple-900">{salesforceAction.case_number}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-purple-100">
                  <p className="text-xs font-medium text-purple-600 mb-1">Routing Team</p>
                  <p className="font-semibold text-purple-900">{salesforceAction.routing_team}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <p className="text-xs font-medium text-purple-600 mb-1">Case ID</p>
                <p className="font-mono text-xs text-purple-900">{salesforceAction.case_id}</p>
              </div>

              <div className="flex space-x-2 mt-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${salesforceAction.comment_added
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
                  }`}>
                  {salesforceAction.comment_added ? 'Comment Added' : 'No Comment'}
                </span>
                {salesforceAction.comment_id && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Comment ID: {salesforceAction.comment_id}
                  </span>
                )}
              </div>
            </div>
          );
        })()}

        {/* New API Structure - Customer Response */}
        {hasNewStructure && extracted_json.customer_response && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-green-900">Customer Response</h3>
                <p className="text-xs text-green-700">Auto-Response & Next Steps</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <p className="text-xs font-medium text-green-600 mb-1">Auto-Acknowledgment Template</p>
                <p className="font-semibold text-green-900">{extracted_json.customer_response.auto_acknowledgment}</p>
              </div>

              <div className="bg-white rounded-lg p-3 border border-green-100">
                <p className="text-xs font-medium text-green-600 mb-1">Estimated Response Time</p>
                <p className="font-semibold text-green-900">{extracted_json.customer_response.estimated_response_time}</p>
              </div>

              <div className="bg-white rounded-lg p-3 border border-green-100">
                <p className="text-xs font-medium text-green-600 mb-1">Case Reference</p>
                <p className="font-semibold text-green-900">{extracted_json.customer_response.case_reference}</p>
              </div>

              <div className="bg-white rounded-lg p-3 border border-green-100">
                <p className="text-xs font-medium text-green-600 mb-1">Next Steps</p>
                <p className="text-sm text-green-900 leading-relaxed">{extracted_json.customer_response.next_steps}</p>
              </div>
            </div>
          </div>
        )}

        {/* New API Structure - Internal Routing */}
        {hasNewStructure && extracted_json.internal_routing && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-orange-900">Internal Routing</h3>
                <p className="text-xs text-orange-700">Team Assignment & Review Status</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div className="bg-white rounded-lg p-3 border border-orange-100">
                <p className="text-xs font-medium text-orange-600 mb-1">Specialist Team</p>
                <p className="font-semibold text-orange-900">{extracted_json.internal_routing.specialist_team}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-orange-100">
                <p className="text-xs font-medium text-orange-600 mb-1">Follow-up Date</p>
                <p className="font-semibold text-orange-900">{extracted_json.internal_routing.follow_up_date}</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${extracted_json.internal_routing.requires_human_review
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
                }`}>
                {extracted_json.internal_routing.requires_human_review ? 'Human Review Required' : 'No Human Review Needed'}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${extracted_json.internal_routing.escalation_needed
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
                }`}>
                {extracted_json.internal_routing.escalation_needed ? 'Escalation Needed' : 'No Escalation'}
              </span>
            </div>
          </div>
        )}

        {/* Legacy Structure - AI Classification (fallback) */}
        {!hasNewStructure && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-900">AI Classification</h3>
                <p className="text-xs text-blue-700">Lyzr AI Analysis Results</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-1">Classification</p>
                <p className="font-semibold text-blue-900">{getValue(extracted_json, 'classification', 'Unknown')}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-1">Confidence</p>
                <p className="font-semibold text-blue-900">
                  {getValue(extracted_json, 'confidence_score', 0) > 0
                    ? `${(getValue(extracted_json, 'confidence_score', 0) * 100).toFixed(0)}%`
                    : 'N/A'
                  }
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-1">Priority</p>
                <p className="font-semibold text-blue-900">{getValue(extracted_json, 'priority_level', 'Unknown')}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-1">Action Required</p>
                <p className="font-semibold text-blue-900">{getValue(extracted_json, 'routing_action', 'Unknown')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Legacy Structure - Key Indicators (fallback) */}
        {!hasNewStructure && (() => {
          const keyIndicators = getArrayValue(extracted_json, 'key_indicators');
          if (keyIndicators.length > 0) {
            return (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                    <Target className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-700">Key Indicators</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {keyIndicators.map((indicator, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                    >
                      {indicator}
                    </span>
                  ))}
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Legacy Structure - Salesforce Action (fallback) */}
        {!hasNewStructure && (() => {
          const salesforceAction = getValue(extracted_json, 'salesforce_action_legacy');
          const autoAcknowledgment = getValue(extracted_json, 'auto_acknowledgment');

          if (salesforceAction && salesforceAction !== 'N/A') {
            return (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Zap className="h-4 w-4 text-purple-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-700">Salesforce Action</h3>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-purple-900">{salesforceAction}</p>
                  {autoAcknowledgment && autoAcknowledgment !== 'N/A' && (
                    <p className="text-xs text-purple-700 mt-1">
                      Auto-acknowledgment: {autoAcknowledgment}
                    </p>
                  )}
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Legacy Structure - Extracted Entities (fallback) */}
        {!hasNewStructure && (() => {
          const extractedEntities = getObjectValue(extracted_json, 'extracted_entities');
          const entityKeys = Object.keys(extractedEntities);

          if (entityKeys.length > 0) {
            return (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-orange-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-700">Extracted Information</h3>
                </div>
                <div className="space-y-2">
                  {entityKeys.map((key) => {
                    const value = extractedEntities[key];
                    if (!value || value === 'N/A') return null;

                    const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                    if (Array.isArray(value)) {
                      return (
                        <div key={key} className="text-sm">
                          <p className="font-medium text-gray-700 mb-1">{displayKey}:</p>
                          <div className="flex flex-wrap gap-1">
                            {value.map((item, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={key} className="text-sm">
                        <p className="font-medium text-gray-700">{displayKey}:</p>
                        <p className="text-gray-600">{String(value)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Legacy Structure - Human Review Status (fallback) */}
        {!hasNewStructure && (() => {
          const requiresHumanReview = getValue(extracted_json, 'requires_human_review', null);

          if (requiresHumanReview !== null && requiresHumanReview !== 'N/A') {
            return (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 text-red-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-700">Review Status</h3>
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${requiresHumanReview
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
                  }`}>
                  {requiresHumanReview ? 'Human Review Required' : 'No Human Review Needed'}
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Additional Fields - Dynamic rendering for any other fields */}
        {(() => {
          const additionalFields = Object.keys(extracted_json).filter(key =>
            !['classification', 'confidence_score', 'routing_action', 'key_indicators',
              'salesforce_action_legacy', 'existing_case_number', 'priority_level',
              'auto_acknowledgment', 'requires_human_review', 'extracted_entities',
              'email_analysis', 'salesforce_action', 'customer_response', 'internal_routing'].includes(key)
          );

          if (additionalFields.length > 0) {
            return (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-gray-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-700">Additional Information</h3>
                </div>
                <div className="space-y-2">
                  {additionalFields.map((key) => {
                    const value = (extracted_json as any)[key];
                    if (!value || value === 'N/A') return null;

                    const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                    if (Array.isArray(value)) {
                      return (
                        <div key={key} className="text-sm">
                          <p className="font-medium text-gray-700 mb-1">{displayKey}:</p>
                          <div className="flex flex-wrap gap-1">
                            {value.map((item, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={key} className="text-sm">
                        <p className="font-medium text-gray-700">{displayKey}:</p>
                        <p className="text-gray-600">{String(value)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }
          return null;
        })()}
      </div>
    );
  };

  return (
    <div className="h-full h-600">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900">Actions</h2>
        <p className="text-sm text-gray-600 mt-1">AI-powered analysis and available actions</p>
      </div>

      {/* Actions Content */}
      <div className="p-6 space-y-6 overflow-y-auto" style={{ height: 'calc(100% - 80px)' }}>
        {/* Email Info Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Email Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">From: {email.sender}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                {email.timestamp ? new Date(email.timestamp).toLocaleDateString() : 'No date'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">ID: {email.id}</span>
            </div>
            {email.messageId && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Message ID: {email.messageId.substring(0, 20)}...</span>
              </div>
            )}

          </div>
        </div>


        {/* Lyzr AI Analysis */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">AI Analysis</h3>
            <div className="flex space-x-2">
              {!email.lyzrData && email.messageId && (
                <button
                  onClick={async () => {
                    if (onFetchLyzrData) {
                      try {
                        setLyzrLoading(true);
                        setLyzrError(null);
                        console.log('Fetching Lyzr data for messageId:', email.messageId);
                        await onFetchLyzrData(email.messageId!);
                        console.log('Lyzr data fetched successfully');
                      } catch (err) {
                        console.error('Error fetching Lyzr data:', err);
                        setLyzrError(err instanceof Error ? err.message : 'Failed to fetch Lyzr data');
                      } finally {
                        setLyzrLoading(false);
                      }
                    } else {
                      console.log('Manual trigger for Lyzr data fetch');
                      alert('Lyzr data fetch would be triggered here. Check console for details.');
                    }
                  }}
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                >
                  Fetch Lyzr Data
                </button>
              )}

            </div>
          </div>

          {/* Status Information */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-600 space-y-1">
              <div>Status: {lyzrLoading ? 'Loading...' : lyzrError ? 'Error' : email.lyzrData ? 'Data Available' : 'No Data'}</div>
              <div>Message ID Available: {email.messageId ? 'Yes' : 'No'}</div>
              <div>onFetchLyzrData Available: {onFetchLyzrData ? 'Yes' : 'No'}</div>
              <div>Email Version: {emailVersion}</div>
              <div>lyzrLoading State: {lyzrLoading ? 'true' : 'false'}</div>
              <div>lyzrError State: {lyzrError || 'null'}</div>
              {lyzrError && <div className="text-red-600">Error: {lyzrError}</div>}
            </div>
          </div>

          {/* Raw Email Data (Debug) */}
          <details className="mb-4">
            <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">Show Raw Email Data</summary>
            <div className="mt-2 p-3 bg-gray-100 rounded-lg">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-40">
                {JSON.stringify(email, null, 2)}
              </pre>
            </div>
          </details>

          {/* Lyzr Data Debug */}
          <details className="mb-4">
            <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">Show Lyzr Data Debug</summary>
            <div className="mt-2 p-3 bg-blue-100 rounded-lg">
              <div className="text-xs text-blue-700 space-y-1">
                <div><strong>Has Lyzr Data:</strong> {email.lyzrData ? 'Yes' : 'No'}</div>
                {email.lyzrData && (
                  <>
                    <div><strong>Lyzr Data ID:</strong> {email.lyzrData._id}</div>
                    <div><strong>Email ID:</strong> {email.lyzrData.email_id}</div>
                    <div><strong>Success:</strong> {email.lyzrData.success ? 'Yes' : 'No'}</div>
                    <div><strong>Error:</strong> {email.lyzrData.error || 'None'}</div>
                    <div><strong>Processed At:</strong> {email.lyzrData.processed_at}</div>
                    <div><strong>Has Extracted JSON:</strong> {email.lyzrData.extracted_json ? 'Yes' : 'No'}</div>
                    {email.lyzrData.extracted_json && (
                      <div><strong>Extracted JSON Keys:</strong> {Object.keys(email.lyzrData.extracted_json).join(', ')}</div>
                    )}
                  </>
                )}
              </div>
            </div>
          </details>

          {renderLyzrData()}
        </div>

        {/* Human Review Section - Only show when human review is required */}
        {isHumanReviewRequired() && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Human Review Required</h3>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Review Needed
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-600">
                AI analysis indicates this email requires human review and validation
              </p>

              {/* Quick Review Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsFeedbackModalOpen(true)}
                  disabled={feedbackSubmitting}
                  className="flex items-center justify-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Approve</span>
                </button>

                <button
                  onClick={() => setIsFeedbackModalOpen(true)}
                  disabled={feedbackSubmitting}
                  className="flex items-center justify-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <ThumbsDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-gray-700">Reject</span>
                </button>

                <button
                  onClick={() => setIsFeedbackModalOpen(true)}
                  disabled={feedbackSubmitting}
                  className="flex items-center justify-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <HelpCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-700">Needs Work</span>
                </button>

                <button
                  onClick={() => setIsFeedbackModalOpen(true)}
                  disabled={feedbackSubmitting}
                  className="flex items-center justify-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <Star className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-gray-700">Rate & Review</span>
                </button>
              </div>

              <button
                onClick={() => setIsFeedbackModalOpen(true)}
                disabled={feedbackSubmitting}
                className="w-full p-2 text-xs text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {feedbackSubmitting ? 'Submitting...' : 'Provide Detailed Review'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={handleFeedbackSubmit}
        emailId={email.id}
        emailSubject={email.subject || 'No Subject'}
      />
    </div>
  );
};

export default EmailActions;
