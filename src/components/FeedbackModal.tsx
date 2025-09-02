import React, { useState } from 'react';
import { X, Star, ThumbsUp, ThumbsDown, HelpCircle } from 'lucide-react';
import { FeedbackType, CreateFeedbackRequest } from '../types/feedback';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: CreateFeedbackRequest) => Promise<void>;
  emailId: string;
  emailSubject: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  emailId,
  emailSubject
}) => {
  const [rating, setRating] = useState<number>(0);
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackTypes: { type: FeedbackType; label: string; icon: React.ReactNode; color: string }[] = [
    { type: 'positive', label: 'Positive', icon: <ThumbsUp className="h-5 w-5" />, color: 'text-green-600' },
    { type: 'negative', label: 'Negative', icon: <ThumbsDown className="h-5 w-5" />, color: 'text-red-600' },
    { type: 'neutral', label: 'Neutral', icon: <HelpCircle className="h-5 w-5" />, color: 'text-gray-600' },
    { type: 'helpful', label: 'Helpful', icon: <ThumbsUp className="h-5 w-5" />, color: 'text-blue-600' },
    { type: 'not_helpful', label: 'Not Helpful', icon: <ThumbsDown className="h-5 w-5" />, color: 'text-orange-600' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackType) {
      alert('Please select a feedback type');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const feedbackData: CreateFeedbackRequest = {
        email_id: emailId,
        feedback_type: feedbackType,
        rating: rating > 0 ? rating : undefined,
        comment: comment.trim() || undefined
      };

      await onSubmit(feedbackData);
      
      // Reset form
      setRating(0);
      setFeedbackType(null);
      setComment('');
      onClose();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setFeedbackType(null);
      setComment('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Human Review</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Email Subject */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-1">Email:</p>
            <p className="text-gray-900 font-medium line-clamp-2">{emailSubject}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Rating (Optional)
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    disabled={isSubmitting}
                    className="focus:outline-none disabled:opacity-50"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {rating} star{rating !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Review Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Review Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {feedbackTypes.map(({ type, label, icon, color }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFeedbackType(type)}
                    disabled={isSubmitting}
                    className={`p-3 border rounded-lg text-left transition-colors disabled:opacity-50 ${
                      feedbackType === type
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className={color}>{icon}</span>
                      <span className="text-sm font-medium text-gray-900">{label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={isSubmitting}
                placeholder="Share your thoughts about this email..."
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:opacity-50"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {comment.length}/500 characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!feedbackType || isSubmitting}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
