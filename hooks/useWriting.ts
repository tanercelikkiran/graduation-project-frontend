import { useState, useCallback, useEffect } from "react";
import { Alert } from "react-native";
import { useAuth } from "@/contexts/AuthenticationContext";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { getErrorMessage, logContentError, isInappropriateContentError } from "@/utils/errorHandling";
import type {
  WritingEvaluationRequest,
  WritingAnswerRequest,
  WritingScenarioAnswerRequest,
  DetailedWritingResponse,
  WritingAnswerResponse,
  WritingScenarioAnswerResponse,
  WritingQuestionResponse,
  WritingQuestion,
  WritingQuestionsResponse,
  WritingLevelsResponse,
  WritingHookResult,
  WritingQuestionsHookResult,
  WritingQuestionResponseHookResult,
} from "@/types/writing";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface WritingState {
  loading: boolean;
  error: string | null;
  lastResult: DetailedWritingResponse | null;
  submitting: boolean;
  currentEventId: string | null;
}


interface WritingQuestionsState {
  questions: WritingQuestion[];
  availableLevels: string[];
  loading: boolean;
  error: string | null;
  progress: { [level: string]: { solved: number; total: number } };
}

/**
 * Main writing hook for evaluation and session management
 */
export function useWriting(): WritingHookResult {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [state, setState] = useState<WritingState>({
    loading: false,
    error: null,
    lastResult: null,
    submitting: false,
    currentEventId: null,
  });

  const submitWriting = useCallback(
    async (request: WritingEvaluationRequest): Promise<DetailedWritingResponse> => {
      if (!token) {
        throw new Error("Authentication required for writing evaluation");
      }

      setState(prev => ({ ...prev, submitting: true, error: null }));

      try {
        const response = await axios.post<DetailedWritingResponse>(
          `${API_URL}/writing/evaluate`,
          request,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const result = response.data;
        setState(prev => ({ 
          ...prev, 
          submitting: false, 
          lastResult: result,
          error: null 
        }));

        return result;
      } catch (error) {
        logContentError(error, "writing evaluation");
        const errorMessage = getErrorMessage(error, t);

        setState(prev => ({ 
          ...prev, 
          submitting: false, 
          error: errorMessage 
        }));

        // Show alert for inappropriate content
        if (isInappropriateContentError(error)) {
          Alert.alert(
            t("common.warning"),
            errorMessage,
            [{ text: t("common.ok") }]
          );
        }

        throw new Error(errorMessage);
      }
    },
    [token, t]
  );

  const submitGuestWriting = useCallback(
    async (request: WritingEvaluationRequest): Promise<DetailedWritingResponse> => {
      setState(prev => ({ ...prev, submitting: true, error: null }));

      try {
        const response = await axios.post<DetailedWritingResponse>(
          `${API_URL}/writing/evaluate/guest`,
          request,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = response.data;
        setState(prev => ({ 
          ...prev, 
          submitting: false, 
          lastResult: result,
          error: null 
        }));

        return result;
      } catch (error) {
        logContentError(error, "guest writing evaluation");
        const errorMessage = getErrorMessage(error, t);

        setState(prev => ({ 
          ...prev, 
          submitting: false, 
          error: errorMessage 
        }));

        // Show alert for inappropriate content
        if (isInappropriateContentError(error)) {
          Alert.alert(
            t("common.warning"),
            errorMessage,
            [{ text: t("common.ok") }]
          );
        }

        throw new Error(errorMessage);
      }
    },
    [t]
  );

  const answerQuestion = useCallback(
    async (request: WritingAnswerRequest): Promise<WritingAnswerResponse> => {
      if (!token) {
        throw new Error("Authentication required for answering questions");
      }

      setState(prev => ({ ...prev, submitting: true, error: null }));

      try {
        const response = await axios.post<WritingAnswerResponse>(
          `${API_URL}/writing/answer`,
          request,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const result = response.data;
        setState(prev => ({ 
          ...prev, 
          submitting: false, 
          lastResult: result.evaluation,
          error: null 
        }));

        return result;
      } catch (error) {
        logContentError(error, "writing answer");
        const errorMessage = getErrorMessage(error, t);

        setState(prev => ({ 
          ...prev, 
          submitting: false, 
          error: errorMessage 
        }));

        // Show alert for inappropriate content
        if (isInappropriateContentError(error)) {
          Alert.alert(
            t("common.warning"),
            errorMessage,
            [{ text: t("common.ok") }]
          );
        }

        throw new Error(errorMessage);
      }
    },
    [token, t]
  );

  const answerScenarioQuestion = useCallback(
    async (request: WritingScenarioAnswerRequest): Promise<WritingScenarioAnswerResponse> => {
      if (!token) {
        throw new Error("Authentication required for answering scenario questions");
      }

      setState(prev => ({ ...prev, submitting: true, error: null }));

      try {
        const response = await axios.post<WritingScenarioAnswerResponse>(
          `${API_URL}/writing/answer-scenarios`,
          request,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const result = response.data;
        setState(prev => ({ 
          ...prev, 
          submitting: false, 
          lastResult: result.evaluation,
          error: null 
        }));

        return result;
      } catch (error) {
        const errorMessage = axios.isAxiosError(error)
          ? error.response?.data?.detail || "Failed to answer scenario question"
          : "An unexpected error occurred";

        setState(prev => ({ 
          ...prev, 
          submitting: false, 
          error: errorMessage 
        }));
        throw new Error(errorMessage);
      }
    },
    [token]
  );

  // 1. Create writing event when user starts writing
  const createWritingEvent = useCallback(
    async (questionId: string, level: string): Promise<string | null> => {
      if (!token) {
        throw new Error("Authentication required for writing events");
      }

      try {
        const response = await axios.post(
          `${API_URL}/writing/event/create?question_id=${questionId}&level=${level}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const eventId = response.data.event_id;
        setState(prev => ({ ...prev, currentEventId: eventId }));
        return eventId;
      } catch (error) {
        console.error("Failed to create writing event:", error);
        return null;
      }
    },
    [token]
  );

  // 2. Complete writing event and get XP
  const completeWritingEvent = useCallback(
    async (eventId: string, finalAnswer: string): Promise<{ xpEarned: number; evaluation: any } | null> => {
      if (!token) {
        throw new Error("Authentication required for writing events");
      }

      setState(prev => ({ ...prev, submitting: true, error: null }));

      try {
        const response = await axios.put(
          `${API_URL}/writing/event/${eventId}/complete?final_answer=${encodeURIComponent(finalAnswer)}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setState(prev => ({ ...prev, submitting: false, currentEventId: null }));
        
        return {
          xpEarned: response.data.xp_earned || 0,
          evaluation: response.data.evaluation
        };
      } catch (error) {
        console.error("Failed to complete writing event:", error);
        setState(prev => ({ ...prev, submitting: false }));
        return null;
      }
    },
    [token]
  );

  return {
    submitWriting,
    submitGuestWriting,
    answerQuestion,
    answerScenarioQuestion,
    createWritingEvent,
    completeWritingEvent,
    loading: state.submitting,
    error: state.error ? new Error(state.error) : null,
    lastResult: state.lastResult,
    currentEventId: state.currentEventId,
  };
}

/**
 * Hook for getting user's response to a specific writing question
 */
export function useWritingQuestionResponse(): WritingQuestionResponseHookResult {
  const { token } = useAuth();
  const [state, setState] = useState<{
    response: WritingQuestionResponse | null;
    loading: boolean;
    error: string | null;
  }>({
    response: null,
    loading: false,
    error: null,
  });

  const getUserResponse = useCallback(
    async (level: string, questionId: string): Promise<void> => {
      if (!token) {
        setState(prev => ({ 
          ...prev, 
          error: "Authentication required" 
        }));
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await axios.get<WritingQuestionResponse>(
          `${API_URL}/writing/answer/${level}/${questionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setState(prev => ({
          ...prev,
          loading: false,
          response: response.data,
          error: null,
        }));
      } catch (error) {
        const errorMessage = axios.isAxiosError(error)
          ? error.response?.data?.detail || "Failed to fetch user response"
          : "An unexpected error occurred";

        // If it's a 404, user hasn't answered this question yet
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setState(prev => ({
            ...prev,
            loading: false,
            response: null,
            error: null,
          }));
        } else {
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            error: errorMessage 
          }));
        }
      }
    },
    [token]
  );

  return {
    response: state.response,
    loading: state.loading,
    error: state.error ? new Error(state.error) : null,
    getUserResponse,
  };
}

/**
 * Hook for fetching writing questions by level (requires authentication for language support)
 */
export function useWritingQuestions(): WritingQuestionsHookResult {
  const { token } = useAuth();
  const [state, setState] = useState<WritingQuestionsState>({
    questions: [],
    availableLevels: [],
    loading: false,
    error: null,
    progress: {},
  });

  const fetchQuestions = useCallback(async (level: string): Promise<void> => {
    if (!token) {
      setState(prev => ({ 
        ...prev, 
        error: "Authentication required to fetch questions" 
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await axios.get<WritingQuestionsResponse>(
        `${API_URL}/writing/questions/${level.toLowerCase()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setState(prev => ({
        ...prev,
        loading: false,
        questions: response.data.questions,
        error: null,
      }));
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.detail || "Failed to fetch writing questions"
        : "An unexpected error occurred";

      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
    }
  }, [token]);

  const fetchProgress = useCallback(async (level: string): Promise<void> => {
    if (!token) {
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/writing/progress/${level.toLowerCase()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setState(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          [level.toLowerCase()]: {
            solved: response.data.solved,
            total: response.data.total,
          },
        },
      }));
    } catch (error) {
      console.warn(`Failed to fetch progress for level ${level}:`, error);
    }
  }, [token]);

  const fetchLevels = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await axios.get<WritingLevelsResponse>(
        `${API_URL}/writing/levels`
      );

      setState(prev => ({
        ...prev,
        loading: false,
        availableLevels: response.data.levels,
        error: null,
      }));
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.detail || "Failed to fetch writing levels"
        : "An unexpected error occurred";

      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
    }
  }, []);

  // Auto-fetch levels on mount
  useEffect(() => {
    if (state.availableLevels.length === 0 && !state.loading) {
      fetchLevels();
    }
  }, [state.availableLevels.length, state.loading]);

  const getFirstUnsolvedQuestion = useCallback(async (): Promise<WritingQuestion | null> => {
    if (!token) {
      return null;
    }

    const levels = ["beginner", "elementary", "intermediate", "advanced"];
    
    for (const level of levels) {
      try {
        const response = await axios.get<WritingQuestionsResponse>(
          `${API_URL}/writing/questions/${level.toLowerCase()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const firstUnsolved = response.data.questions.find(q => !q.solved);
        if (firstUnsolved) {
          return firstUnsolved;
        }
      } catch (error) {
        console.warn(`Failed to fetch questions for level ${level}:`, error);
      }
    }
    
    return null;
  }, [token]);

  return {
    questions: state.questions,
    availableLevels: state.availableLevels,
    loading: state.loading,
    error: state.error ? new Error(state.error) : null,
    progress: state.progress,
    fetchQuestions,
    fetchLevels,
    fetchProgress,
    getFirstUnsolvedQuestion,
  };
}

/**
 * Hook for fetching writing submission history
 */
export function useWritingHistory() {
  const { token } = useAuth();
  const [state, setState] = useState<{
    history: any[];
    loading: boolean;
    error: Error | null;
    hasMore: boolean;
    currentPage: number;
  }>({
    history: [],
    loading: false,
    error: null,
    hasMore: true,
    currentPage: 0,
  });

  const fetchHistory = useCallback(async (limit: number = 20, reset: boolean = true): Promise<void> => {
    if (!token) {
      setState(prev => ({ 
        ...prev, 
        error: new Error("Authentication required") 
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const skip = reset ? 0 : state.currentPage * limit;
      
      const response = await axios.get(
        `${API_URL}/writing/history?skip=${skip}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newHistory = response.data.submissions || [];
      
      setState(prev => ({
        ...prev,
        loading: false,
        history: reset ? newHistory : [...prev.history, ...newHistory],
        hasMore: newHistory.length === limit,
        currentPage: reset ? 1 : prev.currentPage + 1,
        error: null,
      }));
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.detail || "Failed to fetch writing history"
        : "An unexpected error occurred";

      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: new Error(errorMessage)
      }));
    }
  }, [token, state.currentPage]);

  const loadMore = useCallback(() => {
    if (state.hasMore && !state.loading) {
      fetchHistory(20, false);
    }
  }, [fetchHistory, state.hasMore, state.loading]);

  return {
    history: state.history,
    loading: state.loading,
    error: state.error,
    hasMore: state.hasMore,
    fetchHistory,
    loadMore,
  };
}