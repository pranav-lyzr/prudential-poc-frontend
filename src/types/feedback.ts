export type FeedbackType = 'positive' | 'negative' | 'neutral' | 'helpful' | 'not_helpful';

export interface FeedbackData {
  id: string;
  email_id: string;
  user_id?: string;
  feedback_type: FeedbackType;
  rating?: number; // 1-5
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface FeedbackStats {
  total_feedback: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  helpful_count: number;
  not_helpful_count: number;
  average_rating: number;
  feedback_by_type: {
    positive: number;
    negative: number;
    neutral: number;
    helpful: number;
    not_helpful: number;
  };
}

export interface CreateFeedbackRequest {
  email_id: string;
  user_id?: string;
  feedback_type: FeedbackType;
  rating?: number;
  comment?: string;
}

export interface UpdateFeedbackRequest {
  feedback_type?: FeedbackType;
  rating?: number;
  comment?: string;
}
