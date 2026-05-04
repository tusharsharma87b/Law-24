import { apiGet, apiPost } from './api';

export interface Lawyer {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  city: string;
  availability: boolean;
  // Additional fields from backend
  pricePerMin?: number;
  experienceYears?: number;
  barCouncilId?: string;
  languages?: string[];
  bio?: string;
  responseTimeMinutes?: number;
  isOnline?: boolean;
}

export interface CallRequestPayload {
  lawyerId: string;
  userId: string;
}

export interface CallRequestResponse {
  success: boolean;
  message: string;
  session: {
    sessionId: string;
    lawyerId: string;
    userId: string;
    status: string;
    scheduledAt: string;
    estimatedWaitTime: string;
    callDetails: {
      type: string;
      maxDuration: number;
      costPerMinute: number;
    };
  };
}

export interface ReviewPayload {
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  success: boolean;
  review: {
    reviewId: string;
    rating: number;
    comment: string;
    status: string;
    submittedAt: string;
    message: string;
  };
}

export interface AIConsultPayload {
  issue: string;
}

export interface AIConsultResponse {
  summary: string;
  suggestedLawyerType?: string;
  explanation?: string;
  sections?: string[];
  suggestedCases?: string[];
  lawyers?: any[];
}

/**
 * Fetch all lawyers from backend
 */
export async function fetchLawyers(): Promise<Lawyer[]> {
  try {
    const data = await apiGet('/lawyers');
    if (Array.isArray(data)) {
      return data as Lawyer[];
    }
    console.warn('Unexpected response format for /lawyers:', data);
    return [];
  } catch (error) {
    console.error('Failed to fetch lawyers:', error);
    throw error;
  }
}

/**
 * Submit a call request to a lawyer
 */
export async function submitCallRequest(payload: CallRequestPayload): Promise<CallRequestResponse> {
  try {
    const data = await apiPost('/lawyers/call-request', payload);
    return data as CallRequestResponse;
  } catch (error) {
    console.error('Failed to submit call request:', error);
    throw error;
  }
}

/**
 * Submit a review for a lawyer
 */
export async function submitReview(payload: ReviewPayload): Promise<ReviewResponse> {
  try {
    const data = await apiPost('/lawyers/review', payload);
    return data as ReviewResponse;
  } catch (error) {
    console.error('Failed to submit review:', error);
    throw error;
  }
}

/**
 * Get AI consultation summary
 */
export async function getAIConsult(payload: AIConsultPayload): Promise<AIConsultResponse> {
  try {
    const data = await apiPost('/ai-consult', payload);
    return data as AIConsultResponse;
  } catch (error) {
    console.error('Failed to get AI consult:', error);
    throw error;
  }
}