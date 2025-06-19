/**
 * Writing evaluation types for the Edifica frontend application.
 * These types correspond to the backend writing models and API structures.
 */

/**
 * Request payload for writing evaluation API calls
 * Matches backend WritingEvaluationRequest
 */
export interface WritingEvaluationRequest {
  text: string;
  question?: string;
}

/**
 * Request payload for answering writing questions
 * Matches backend WritingAnswerRequest
 */
export interface WritingAnswerRequest {
  question_id: string;
  level: string;
  answer: string;
}

/**
 * Individual scenario answer
 * Matches backend ScenarioAnswer
 */
export interface ScenarioAnswer {
  scenario_index: number;
  scenario_text: string;
  answer: string;
}

/**
 * Request payload for answering writing questions with multiple scenarios
 * Matches backend WritingScenarioAnswerRequest
 */
export interface WritingScenarioAnswerRequest {
  question_id: string;
  level: string;
  scenario_answers: ScenarioAnswer[];
}

/**
 * Basic writing response (legacy support)
 * Matches backend WritingResponse
 */
export interface WritingResponse {
  score: number;
  feedback: string;
}

/**
 * Detailed writing evaluation breakdown
 * Matches backend WritingEvaluationDetails
 */
export interface WritingEvaluationDetails {
  content_score: number; // 1-5 scale for content quality
  organization_score: number; // 1-5 scale for organization and structure
  language_score: number; // 1-5 scale for language usage
  total_score: number; // Sum of all scores (max 15)
  xp_earned?: number; // XP awarded to user (total_score × 20, max 300)
}

/**
 * Feedback item for specific writing corrections
 * Matches backend WritingFeedbackItem
 */
export interface WritingFeedbackItem {
  type: "Spelling" | "Grammar" | "Punctuation" | "Style";
  error: string;
  suggestion: string;
}

/**
 * Detailed writing response with breakdown
 * Matches backend DetailedWritingResponse
 */
export interface DetailedWritingResponse extends WritingResponse {
  details: WritingEvaluationDetails;
  criteria?: WritingCriteria;
  feedback_items?: WritingFeedbackItem[];
}

/**
 * Writing criteria category
 * Matches backend WritingCriteriaCategory
 */
export interface WritingCriteriaCategory {
  description: string;
  factors: string[];
}

/**
 * Writing evaluation criteria definitions
 * Matches backend WritingCriteria
 */
export interface WritingCriteria {
  content: WritingCriteriaCategory;
  organization: WritingCriteriaCategory;
  language: WritingCriteriaCategory;
}

/**
 * Types of writing prompts available
 */
export type WritingPromptType = 
  | "general"
  | "essay" 
  | "creative"
  | "descriptive"
  | "narrative"
  | "persuasive"
  | "expository";

/**
 * Writing prompt scenario structure
 * Based on the writingPromts.json structure in the frontend
 */
export interface WritingPrompt {
  question: string;
  scenarios: string[];
}

/**
 * Writing prompt collection
 */
export interface WritingPromptCollection {
  [key: string]: WritingPrompt;
}

/**
 * Writing session state for tracking user progress
 */
export interface WritingSession {
  id: string;
  prompt: WritingPrompt;
  selected_scenario?: string;
  user_text: string;
  evaluation?: WritingResponse;
  started_at: string; // ISO date string
  completed_at?: string; // ISO date string
  is_guest_session: boolean;
}

/**
 * User's response to a specific writing question stored in database
 * Matches backend WritingQuestionResponse
 */
export interface WritingQuestionResponse {
  user_id: string;
  question_id: string;
  level: string;
  question_text: string;
  user_answer: string; // Combined answer for backward compatibility
  scenario_answers?: ScenarioAnswer[]; // Individual scenario answers
  score: number;
  feedback: string;
  content_score: number;
  organization_score: number;
  language_score: number;
  total_score: number;
  xp_earned?: number;
  feedback_items?: WritingFeedbackItem[];
  created_at: string; // ISO date string
  updated_at?: string; // ISO date string
}

/**
 * Response for answering writing questions
 * Matches backend WritingAnswerResponse
 */
export interface WritingAnswerResponse {
  question_id: string;
  question_text: string;
  user_answer: string;
  evaluation: DetailedWritingResponse;
}

/**
 * Response for scenario-based answers with evaluation
 * Matches backend WritingScenarioAnswerResponse
 */
export interface WritingScenarioAnswerResponse {
  question_id: string;
  question_text: string;
  scenario_answers: ScenarioAnswer[];
  combined_answer: string;
  evaluation: DetailedWritingResponse;
}

/**
 * Writing statistics for user progress tracking (simplified for question-based approach)
 */
export interface WritingStats {
  total_questions_answered: number;
  average_score: number;
  highest_score: number;
  total_xp_earned: number;
  answers_by_level: Record<string, number>;
  recent_trend: number[]; // Array of recent scores
  improvement_areas: string[];
}

/**
 * Writing module progress tracking
 */
export interface WritingProgress {
  level: number;
  current_xp: number;
  next_level_xp: number;
  completion_percentage: number;
  strengths: string[];
  areas_for_improvement: string[];
  recommended_prompts: WritingPromptType[];
}

/**
 * API response wrapper for writing endpoints
 */
export interface WritingApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

/**
 * Writing evaluation form state
 */
export interface WritingFormState {
  text: string;
  question: string;
  selectedScenario?: string;
  promptType: WritingPromptType;
  isSubmitting: boolean;
  hasUnsavedChanges: boolean;
}

/**
 * Writing feedback category for structured feedback display
 */
export interface WritingFeedbackCategory {
  category: 'content' | 'organization' | 'language';
  score: number;
  maxScore: number;
  feedback: string;
  suggestions: string[];
}

/**
 * Complete writing evaluation result with categorized feedback
 */
export interface StructuredWritingResult {
  overall_score: number;
  overall_feedback: string;
  categories: WritingFeedbackCategory[];
  xp_earned?: number;
  improvement_tips: string[];
}

/**
 * Writing question structure from backend JSON files
 * Matches backend WritingQuestion
 */
export interface WritingQuestion {
  id: string;
  name: string;
  full_name: string;
  scenarios: string[];
  solved: boolean;
  level: string;
}

/**
 * Response for getting writing questions by level
 * Matches backend WritingQuestionsResponse
 */
export interface WritingQuestionsResponse {
  level: string;
  title: string;
  questions: WritingQuestion[];
  total_questions: number;
}

/**
 * Available writing levels response
 */
export interface WritingLevelsResponse {
  levels: string[];
}

// Export utility types for hook results and component props
export interface WritingHookResult {
  submitWriting: (request: WritingEvaluationRequest) => Promise<DetailedWritingResponse>;
  submitGuestWriting: (request: WritingEvaluationRequest) => Promise<DetailedWritingResponse>;
  answerQuestion: (request: WritingAnswerRequest) => Promise<WritingAnswerResponse>;
  answerScenarioQuestion: (request: WritingScenarioAnswerRequest) => Promise<WritingScenarioAnswerResponse>;
  createWritingEvent: (questionId: string, level: string) => Promise<string | null>;
  completeWritingEvent: (eventId: string, finalAnswer: string) => Promise<{ xpEarned: number; evaluation: any } | null>;
  loading: boolean;
  error: Error | null;
  lastResult: DetailedWritingResponse | null;
  currentEventId: string | null;
}

export interface WritingQuestionsHookResult {
  questions: WritingQuestion[];
  loading: boolean;
  error: Error | null;
  fetchQuestions: (level: string) => Promise<void>;
  availableLevels: string[];
  fetchLevels: () => Promise<void>;
  progress: { [level: string]: { solved: number; total: number } };
  fetchProgress: (level: string) => Promise<void>;
  getFirstUnsolvedQuestion: () => Promise<WritingQuestion | null>;
}

export interface WritingQuestionResponseHookResult {
  response: WritingQuestionResponse | null;
  loading: boolean;
  error: Error | null;
  getUserResponse: (level: string, questionId: string) => Promise<void>;
}

// Default evaluation criteria (could be moved to constants)
export const DEFAULT_WRITING_CRITERIA: WritingCriteria = {
  content: {
    description: "Relevance, completeness, clarity, and precision of ideas",
    factors: ["Relevance to prompt", "Completeness of response", "Clarity of ideas", "Precision of expression"]
  },
  organization: {
    description: "Logical structure, flow, cohesion, and transitions",
    factors: ["Logical structure", "Smooth flow", "Cohesive paragraphs", "Clear transitions"]
  },
  language: {
    description: "Grammar, punctuation, spelling, and word choice",
    factors: ["Grammar accuracy", "Proper punctuation", "Correct spelling", "Appropriate vocabulary"]
  }
};