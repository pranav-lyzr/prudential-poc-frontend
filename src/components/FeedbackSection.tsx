import React, { useState, useEffect } from 'react';
import { FeedbackData, FeedbackStats } from '../types/feedback';
import { apiService } from '../services/api';
import { Star, ThumbsUp, ThumbsDown, HelpCircle, MessageSquare, Users, Clock } from 'lucide-react';

interface FeedbackSectionProps {
  emailId: string;
  emailSubject: string;
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({ emailId, emailSubject }) => {
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedbackData();
  }, [emailId]);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both feedback and stats in parallel
      const [feedbackData, statsData] = await Promise.all([
        apiService.getFeedbackByEmail(emailId),
        apiService.getFeedbackStatsForEmail(emailId)
      ]);
      
      setFeedback(feedbackData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch feedback data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getFeedbackTypeIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <ThumbsUp className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <ThumbsDown className="h-4 w-4 text-red-600" />;
      case 'helpful':
        return <HelpCircle className="h-4 w-4 text-blue-600" />;
      case 'not_helpful':
        return <ThumbsDown className="h-4 w-4 text-orange-600" />;
      case 'neutral':
        return <HelpCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getFeedbackTypeColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      case 'helpful':
        return 'bg-blue-100 text-blue-800';
      case 'not_helpful':
        return 'bg-orange-100 text-orange-800';
      case 'neutral':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Human Review Dashboard</h3>
            <p className="text-sm text-gray-600">Loading review data...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Human Review Dashboard</h3>
            <p className="text-sm text-red-600">Failed to load review data</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={fetchFeedbackData}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Human Review Dashboard</h3>
          <p className="text-sm text-gray-600">Review data for: {emailSubject}</p>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total_feedback}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <ThumbsUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Positive</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{stats.positive_count}</p>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <ThumbsDown className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">Negative</span>
            </div>
            <p className="text-2xl font-bold text-red-900">{stats.negative_count}</p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Avg Rating</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {stats.average_rating > 0 ? stats.average_rating.toFixed(1) : 'N/A'}
            </p>
          </div>
        </div>
      )}

      {/* Feedback List */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4">Recent Reviews</h4>
        
        {feedback.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No reviews yet</p>
            <p className="text-sm text-gray-400 mt-1">Be the first to provide a review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedback.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getFeedbackTypeIcon(item.feedback_type)}
                    <div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFeedbackTypeColor(item.feedback_type)}`}>
                        {item.feedback_type.replace('_', ' ')}
                      </span>
                      {item.rating && (
                        <div className="flex items-center space-x-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= item.rating!
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-xs text-gray-600 ml-1">({item.rating}/5)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimestamp(item.created_at)}</span>
                  </div>
                </div>
                
                {item.comment && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">{item.comment}</p>
                  </div>
                )}
                
                {item.user_id && (
                  <div className="mt-2 text-xs text-gray-500">
                    User: {item.user_id}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackSection;
