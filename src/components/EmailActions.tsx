import React, { useState, useEffect } from 'react';
import { EmailData } from '../types/email';
import { Settings, Clock, User, FileText, AlertCircle, Brain, Target, Zap, Shield, MessageSquare, RefreshCw } from 'lucide-react';

interface EmailActionsProps {
  email: EmailData | null;
  onFetchLyzrData?: (emailId: string) => Promise<void>;
}

const EmailActions: React.FC<EmailActionsProps> = ({ email, onFetchLyzrData }) => {
  const [lyzrLoading, setLyzrLoading] = useState(false);
  const [lyzrError, setLyzrError] = useState<string | null>(null);
  const [emailVersion, setEmailVersion] = useState(0);

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

    return (
      <div className="space-y-4">
        {/* AI Classification */}
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

        {/* Key Indicators */}
        {(() => {
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

        {/* Salesforce Action */}
        {(() => {
          const salesforceAction = getValue(extracted_json, 'salesforce_action');
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

        {/* Extracted Entities */}
        {(() => {
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

        {/* Human Review Status */}
        {(() => {
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
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  requiresHumanReview 
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
              'salesforce_action', 'existing_case_number', 'priority_level', 
              'auto_acknowledgment', 'requires_human_review', 'extracted_entities'].includes(key)
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
    <div className="h-full">
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
      </div>
    </div>
  );
};

export default EmailActions;
