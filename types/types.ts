// Re-export writing types for convenience
export type {
  WritingEvaluationRequest,
  WritingAnswerRequest,
  WritingResponse,
  DetailedWritingResponse,
  WritingEvaluationDetails,
  WritingFeedbackItem,
  WritingSession,
  WritingQuestionResponse,
  WritingStats,
  WritingHookResult,
  WritingQuestionsHookResult,
  WritingQuestionResponseHookResult,
} from "./writing";

export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  example?: string;
  definition?: string;
}

export interface VocabularyListHookResult {
  vocabularyList: VocabularyItem[];
  vocabularyListId?: string; // Add vocabulary list ID to the result
  loading: boolean;
  error: Error | null;
  fetchWordList: () => Promise<void>;
}
