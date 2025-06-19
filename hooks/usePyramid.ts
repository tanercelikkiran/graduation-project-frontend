import { useState, useCallback, useEffect } from "react";
import { Alert } from "react-native";
import { useAuth } from "@/contexts/AuthenticationContext";
import { useProgress } from "@/contexts/ProgressContext";
import { useTranslation } from "react-i18next";
import axios from "axios";
import type {
  PyramidOut,
  PyramidItem, // Bu, backend'deki PyramidItem Union tipine karşılık gelmeli
} from "@/types/pyramid"; // Frontend'deki type tanımlarınızın backend ile uyumlu olduğundan emin olun.
import { router } from "expo-router";
import { getErrorMessage, logContentError, isInappropriateContentError } from "@/utils/errorHandling";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Helper function to format duration
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

interface PyramidCompletionResult {
  steps: PyramidItem[]; // Tamamlanmış adımlar
  score: number; // Örnek bir alan
  feedback: string; // Örnek bir alan
  xpEarned: number; // XP earned from completion
  duration_seconds?: number; // Duration of the session
  accuracy_rate?: number; // Success rate
  avg_time_per_step?: number; // Average time per step
}

interface PyramidState {
  currentPyramid: PyramidOut | null;
  loading: boolean;
  error: string | null;
  selectedOption: number | null;
  creatingNextStep: boolean; // Sonraki adımın önizlemeleri yüklenirken
  transitioning: boolean; // Adım türü değiştirilirken (sayfa değiştirme sırasında)
  previewData: {
    // preview_next_step_options'dan dönen veri yapısı
    pyramid_id: string;
    next_step_type: string | null;
    current_step: number;
    preview_steps: PyramidItem[]; // Önizlenen adımlar (backend'deki PyramidItem yapısında)
    message?: string;
  } | null;
  eventId: string | null; // Event tracking ID
  sessionStartTime: Date | null; // Session start time for tracking
}

interface PyramidResult {
  pyramidData: PyramidOut | null;
  loading: boolean;
  error: string | null;
  currentStep: number;
  totalSteps: number;
  selectedOption: number | null;
  pyramidId: string | null;
  creatingNextStep: boolean;
  transitioning: boolean;
  previewData: PyramidState["previewData"] | null;
  createPyramid: (startSentence?: string) => Promise<void>;
  loadPyramid: (pyramidId: string) => Promise<void>;
  selectOption: (optionIndex: number) => void;
  submitSelection: () => Promise<void>;
  completePyramid: () => Promise<PyramidCompletionResult | null>;
  resetPyramid: () => void;
  fetchPreviewOptionsForCurrentStep: () => Promise<void>;
  isLastStep: boolean;
  getCurrentStepType: () => string | null;
  getCurrentStepItem: () => PyramidItem | null;
}

export const usePyramid = (): PyramidResult => {
  const { token } = useAuth();
  const { updateProgress, setTotalSteps, setCurrentStep, resetProgress } = useProgress();
  const { t } = useTranslation();

  const [state, setState] = useState<PyramidState>({
    currentPyramid: null,
    loading: false,
    error: null,
    selectedOption: null,
    creatingNextStep: false,
    transitioning: false,
    previewData: null,
    eventId: null,
    sessionStartTime: null,
  });

  const fetchPreviewOptions = useCallback(
    async (pyramidId: string) => {
      if (!pyramidId) return;
      setState((prev) => ({ ...prev, creatingNextStep: true, error: null }));
      try {
        const response = await axios.post<PyramidState["previewData"]>(
          `${API_URL}/pyramid/preview/next-step-options`,
          { pyramid_id: pyramidId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Preview options fetched:", response.data);
        setState((prev) => ({
          ...prev,
          previewData: response.data,
          creatingNextStep: false,
        }));
      } catch (error) {
        console.error("Failed to fetch preview options:", error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch preview options",
          creatingNextStep: false,
        }));
      }
    },
    [token]
  );

  const loadPyramid = useCallback(
    async (pyramidId: string) => {
      try {
        const response = await axios.get<PyramidOut>(
          `${API_URL}/pyramid/get/${pyramidId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const loadedPyramid = response.data;
        setState((prev) => ({
          ...prev,
          currentPyramid: loadedPyramid,
          loading: false,
        }));
          // Initialize progress tracking
        setTotalSteps(loadedPyramid.total_steps);
        setCurrentStep(loadedPyramid.last_step);
        
        // Get existing event for tracking if pyramid is not completed
        if (!loadedPyramid.completed && loadedPyramid.id) {
          await getExistingPyramidEvent(loadedPyramid.id);
        }
      } catch (error) {
        console.error("Failed to load pyramid:", error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "Failed to load pyramid",
          loading: false,
        }));
      }    },
    [token, setTotalSteps, setCurrentStep]
  );

  const createPyramid = useCallback(
    async (startSentence?: string) => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        selectedOption: null,
        previewData: null,
      }));
      try {
        const response = await axios.post<PyramidOut>(
          `${API_URL}/pyramid/create`,
          { start_sentence: startSentence || "" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const newPyramid = response.data;
        setState((prev) => ({
          ...prev,
          currentPyramid: newPyramid,
          loading: false,
        }));
          // Initialize progress tracking for new pyramid
        setTotalSteps(newPyramid.total_steps);
        setCurrentStep(newPyramid.last_step);
        
        // Event is automatically created by backend during pyramid creation
        // No need to create it manually here anymore
      } catch (error) {
        console.error("Failed to create pyramid:", error);
        logContentError(error, "pyramid creation");
        
        const errorMessage = getErrorMessage(error, t);
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
        
        // Show alert for inappropriate content
        if (isInappropriateContentError(error)) {
          Alert.alert(
            t("common.warning"),
            errorMessage,
            [{ text: t("common.ok") }]
          );
        }
      }    },
    [token, setTotalSteps, setCurrentStep, fetchPreviewOptions]
  );  // Event tracking functions
  const getExistingPyramidEvent = useCallback(async (pyramidId: string) => {
    try {
      // First, try to get existing event for this pyramid
      const response = await axios.get(
        `${API_URL}/pyramid/event/pyramid/${pyramidId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.event_id) {
        // Existing event found
        setState((prev) => ({
          ...prev,
          eventId: response.data.event_id,
          sessionStartTime: new Date(response.data.session_start || Date.now()),
        }));
        return response.data.event_id;
      }
    } catch (error) {
      // If no existing event found (404), create a new one
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log("No existing event found, creating new one");
        return await createPyramidEvent(pyramidId);
      }
      console.error("Failed to get existing pyramid event:", error);
    }
    
    // Fallback: create new event
    return await createPyramidEvent(pyramidId);
  }, [token]);

  const createPyramidEvent = useCallback(async (pyramidId: string) => {
    try {
      const response = await axios.post(
        `${API_URL}/pyramid/event/create`,
        { pyramid_id: pyramidId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setState((prev) => ({
        ...prev,
        eventId: response.data.event_id,
        sessionStartTime: new Date(),
      }));
      
      return response.data.event_id;
    } catch (error) {
      console.error("Failed to create pyramid event:", error);
      return null;
    }
  }, [token]);

  const addStepToEvent = useCallback(async (stepData: any, stepType: string) => {
    if (!state.eventId) return;
    
    try {
      await axios.put(
        `${API_URL}/pyramid/event/${state.eventId}/add-step`,
        { step: stepData, step_type: stepType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Failed to add step to event:", error);
    }
  }, [state.eventId, token]);

  const completeEvent = useCallback(async (): Promise<PyramidCompletionResult | null> => {
    if (!state.eventId) return null;
    
    try {
      const response = await axios.put(
        `${API_URL}/pyramid/event/${state.eventId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return {
        steps: state.currentPyramid?.steps || [],
        score: 100,
        feedback: response.data.message || "Pyramid completed successfully!",
        xpEarned: response.data.xp_earned || 0,
        duration_seconds: response.data.duration_seconds || 0,
        accuracy_rate: response.data.accuracy_rate || 1.0,
        avg_time_per_step: response.data.avg_time_per_step || 0,
      };
    } catch (error) {
      console.error("Failed to complete pyramid event:", error);
      return null;
    }
  }, [state.eventId, state.currentPyramid, token]);

  const markPyramidCompleted = useCallback(async () => {
    if (!state.currentPyramid) return;
    
    try {
      // Just mark the pyramid as completed without XP calculation
      await axios.post(
        `${API_URL}/pyramid/complete`,
        { 
          pyramid_id: state.currentPyramid.id,
          skip_xp: true // Add flag to skip XP awarding
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setState((prev) => ({
        ...prev,
        currentPyramid: prev.currentPyramid 
          ? { ...prev.currentPyramid, completed: true }
          : null,
      }));
    } catch (error) {
      console.error("Failed to mark pyramid as completed:", error);
    }
  }, [state.currentPyramid, token]);

  const submitSelection = useCallback(async () => {
    if (state.selectedOption === null) {
      setState((prev) => ({ ...prev, error: "Lütfen bir seçenek seçin." }));
      return;
    }
    if (!state.currentPyramid) {
      setState((prev) => ({ ...prev, error: "Aktif piramit bulunmuyor." }));
      return;
    }
    if (state.currentPyramid.completed) {
      setState((prev) => ({
        ...prev,
        error: "Bu piramit zaten tamamlanmış.",
        loading: false,
      }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, error: null, creatingNextStep: true }));

      await axios.post(
        `${API_URL}/pyramid/update-step-selection`,
        {
          pyramid_id: state.currentPyramid.id,
          selected_option_index: state.selectedOption,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Check if this is the last step
      const isLastStep =
        state.currentPyramid.last_step >= state.currentPyramid.total_steps - 1;

      if (isLastStep) {
        setState((prev) => ({ ...prev, loading: false, previewData: null }));
        updateProgress(); // Update progress for the final step
        
        // Complete the event and get real statistics
        const eventResult = await completeEvent();
        if (eventResult) {
          // Mark pyramid as completed in the old system (without XP award)
          await markPyramidCompleted();
          
          // Calculate real completion time
          const completionTime = state.sessionStartTime 
            ? formatDuration(eventResult.duration_seconds || 0)
            : "Unknown";
          
          // Navigate to result page with real statistics
          router.replace({
            pathname: `/(tabs)/pyramid-module/pyramid/result`,
            params: { 
              pyramidId: state.currentPyramid.id,
              xpEarned: eventResult.xpEarned.toString(),
              completionTime: completionTime,
              successRate: `${Math.round((eventResult.accuracy_rate || 1.0) * 100)}%`
            },
          });
        } else {
          // Fallback to old completion method if event completion fails
          const completionResult = await completePyramid();
          if (completionResult) {
            router.replace({
              pathname: `/(tabs)/pyramid-module/pyramid/result`,
              params: { 
                pyramidId: state.currentPyramid.id,
                xpEarned: completionResult.xpEarned.toString(),
                completionTime: "Unknown",
                successRate: "100%"
              },
            });
          }
        }
        return;
      }

      if (
        state.previewData &&
        state.previewData.preview_steps &&
        state.selectedOption !== null &&
        state.previewData.preview_steps.length > state.selectedOption &&
        state.selectedOption >= 0
      ) {
        const nextStepItemFromPreview =
          state.previewData.preview_steps[state.selectedOption];

        if (nextStepItemFromPreview) {
          const advanceResponse = await axios.post<PyramidOut>(
            `${API_URL}/pyramid/append-step`,
            {
              pyramid_id: state.currentPyramid.id,
              next_step_item: nextStepItemFromPreview,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const updatedPyramid = advanceResponse.data;

          // Check if step type changed
          const currentStepType = state.currentPyramid.steps[state.currentPyramid.last_step]?.step_type;
          const nextStepType = updatedPyramid.steps[updatedPyramid.last_step]?.step_type;
          const stepTypeChanged = currentStepType !== nextStepType;

          if (stepTypeChanged) {
            // Set transitioning flag to prevent rendering mismatched data
            setState((prev) => ({
              ...prev,
              transitioning: true,
              selectedOption: null,
              previewData: null,
              loading: false,
            }));

            // Navigate to new page first
            if (!updatedPyramid.completed) {
              router.replace({
                pathname: `/(tabs)/pyramid-module/pyramid/${nextStepType}`,
                params: { pyramidId: updatedPyramid.id },
              });
            } else {
              router.replace({
                pathname: `/(tabs)/pyramid-module/pyramid/result`,
                params: { pyramidId: updatedPyramid.id },
              });
            }

            // Update pyramid data after a short delay to allow navigation
            setTimeout(() => {
              setState((prev) => ({
                ...prev,
                currentPyramid: updatedPyramid,
                transitioning: false,
              }));
              
              // Update progress when step advances
              updateProgress();
            }, 100);
          } else {
            // Same step type, update directly
            setState((prev) => ({
              ...prev,
              currentPyramid: updatedPyramid,
              selectedOption: null,
              previewData: null,
              loading: false,
            }));
            
            // Update progress when step advances
            updateProgress();
          }
        } else {
          throw new Error("Seçilen önizleme adım verisi hatalı veya eksik.");
        }
      } else {
        console.error(
          "Önizleme verisi bulunamadı veya geçersiz. Hızlı geçiş yapılamıyor."
        );
        setState((prev) => ({
          ...prev,
          error:
            "Bir sonraki adım için önizleme verisi bulunamadı. Lütfen tekrar deneyin.",
          loading: false,
          transitioning: false,
        }));
      }
    } catch (error) {
      console.error("Failed to submit selection:", error);
      const errorMessage =
        error instanceof axios.AxiosError && error.response?.data?.detail
          ? error.response.data.detail
          : error instanceof Error
          ? error.message
          : "Seçim gönderilemedi.";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false, transitioning: false }));
    }  }, [
    state.selectedOption,
    state.currentPyramid,
    state.previewData,
    token,
    updateProgress,
    fetchPreviewOptions,
  ]);

  const completePyramid =
    useCallback(async (): Promise<PyramidCompletionResult | null> => {
      if (!state.currentPyramid) {
        setState((prev) => ({
          ...prev,
          error: "Tamamlanacak aktif piramit yok.",
        }));
        return null;
      }
      if (state.currentPyramid.completed) {
        setState((prev) => ({
          ...prev,
          error: "Bu piramit zaten daha önce tamamlanmış.",
        }));
        return null;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await axios.post<{ message: string; xp_earned: number }>(
          `${API_URL}/pyramid/complete`,
          { pyramid_id: state.currentPyramid.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Piramidi lokalde de tamamlanmış olarak işaretle
        const updatedPyramidData = state.currentPyramid
          ? { ...state.currentPyramid, completed: true }
          : null;

        setState((prev) => ({
          ...prev,
          currentPyramid: updatedPyramidData,
          previewData: null,
          selectedOption: null,
          loading: false,
        }));
        
        // Reset progress when pyramid is completed
        resetProgress();
        return {
          steps: state.currentPyramid?.steps || [],
          score: 100,
          feedback: response.data.message || "Piramit başarıyla tamamlandı!",
          xpEarned: response.data.xp_earned || 0,
        };
      } catch (error) {
        console.error("Failed to complete pyramid:", error);
        const errorMessage =
          error instanceof axios.AxiosError && error.response?.data?.detail
            ? error.response.data.detail
            : error instanceof Error
            ? error.message
            : "Piramit tamamlanamadı.";
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
        return null;
      }
    }, [state.currentPyramid, token, resetProgress]);

  const resetPyramid = useCallback(() => {
    setState({
      currentPyramid: null,
      loading: false,
      error: null,
      selectedOption: null,
      creatingNextStep: false,
      transitioning: false,
      previewData: null,
      eventId: null,
      sessionStartTime: null,
    });
    
    // Reset progress when pyramid is reset
    resetProgress();
  }, [resetProgress]);

  const selectOption = useCallback((optionIndex: number) => {
    setState((prev) => ({ ...prev, selectedOption: optionIndex, error: null }));
  }, []);

  const getCurrentStepItem = useCallback((): PyramidItem | null => {
    if (!state.currentPyramid || state.currentPyramid.steps.length === 0) {
      return null;
    }
    return state.currentPyramid.steps[state.currentPyramid.last_step] || null;
  }, [state.currentPyramid]);

  const getCurrentStepType = useCallback((): string | null => {
    // Pydantic modelinde PyramidItem'ın step_type alanı var.
    const currentItem = getCurrentStepItem();
    return currentItem?.step_type || null;
  }, [getCurrentStepItem]);

  const fetchPreviewOptionsForCurrentStep = useCallback(() => {
    if (
      state.currentPyramid &&
      !state.currentPyramid.completed &&
      state.currentPyramid.last_step < state.currentPyramid.total_steps - 1
    ) {
      return fetchPreviewOptions(state.currentPyramid.id);
    }
    return Promise.resolve();
  }, [state.currentPyramid, fetchPreviewOptions]);

  const isLastStep = state.currentPyramid
    ? state.currentPyramid.last_step >= state.currentPyramid.total_steps - 1
    : false;

  return {
    pyramidData: state.currentPyramid,
    loading: state.loading,
    error: state.error,
    currentStep: state.currentPyramid?.last_step || 0,
    totalSteps: state.currentPyramid?.total_steps || 0,
    selectedOption: state.selectedOption,
    pyramidId: state.currentPyramid?.id || null,
    creatingNextStep: state.creatingNextStep,
    transitioning: state.transitioning,
    previewData: state.previewData,
    createPyramid,
    loadPyramid,
    selectOption,
    submitSelection,
    completePyramid,
    resetPyramid,
    fetchPreviewOptionsForCurrentStep,
    isLastStep,
    getCurrentStepType,
    getCurrentStepItem,
  };
};
