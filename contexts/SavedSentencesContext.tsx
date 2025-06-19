import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import axios from 'axios';
import { useAuth } from './AuthenticationContext';
import { useTranslation } from 'react-i18next';
import { getErrorMessage, logContentError, isInappropriateContentError } from '@/utils/errorHandling';

// Interface for a saved sentence
export interface SavedSentence {
  sentence: string;
  meaning: string;
  transformation_type: 'expand' | 'shrink' | 'paraphrase' | 'replace' | 'original';
  source_sentence: string;
  pyramid_id?: string;
  step_number?: number;
  saved_at: string;
}

// Interface for saving a sentence request
export interface SaveSentenceRequest {
  sentence: string;
  meaning: string;
  transformation_type: 'expand' | 'shrink' | 'paraphrase' | 'replace' | 'original';
  source_sentence: string;
  pyramid_id?: string;
  step_number?: number;
}

// Context interface
interface SavedSentencesContextType {
  savedSentences: SavedSentence[];
  savedSentencesCount: number;
  isLoading: boolean;
  error: string | null;
  saveSentence: (sentenceData: SaveSentenceRequest) => Promise<boolean>;
  unsaveSentence: (sentence: string, meaning: string) => Promise<boolean>;
  isSentenceSaved: (sentence: string, meaning: string) => boolean;
  checkSentenceSaved: (sentence: string, meaning: string) => Promise<boolean>;
  fetchSavedSentences: () => Promise<void>;
  refreshSentencesCount: () => Promise<void>;
}

// Create context
const SavedSentencesContext = createContext<SavedSentencesContextType | undefined>(undefined);

// Provider component
export const SavedSentencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  
  const [savedSentences, setSavedSentences] = useState<SavedSentence[]>([]);
  const [savedSentencesCount, setSavedSentencesCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all saved sentences
  const fetchSavedSentences = useCallback(async () => {
    if (!token) {
      console.log("No token available, skipping fetch");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${apiUrl}/saved-sentences/get`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.status === 'success') {
        setSavedSentences(response.data.saved_sentences || []);
        setSavedSentencesCount(response.data.saved_sentences?.length || 0);
      } else {
        setSavedSentences([]);
        setSavedSentencesCount(0);
      }
    } catch (error) {
      console.error('Error fetching saved sentences:', error);
      setError('Failed to load saved sentences');
      setSavedSentences([]);
      setSavedSentencesCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [token, apiUrl]);

  // Refresh sentences count only
  const refreshSentencesCount = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${apiUrl}/saved-sentences/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.status === 'success') {
        setSavedSentencesCount(response.data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching saved sentences count:', error);
    }
  }, [token, apiUrl]);

  // Save a sentence
  const saveSentence = useCallback(async (sentenceData: SaveSentenceRequest): Promise<boolean> => {
    if (!token) {
      setError('Authentication required');
      return false;
    }

    try {
      const response = await axios.post(`${apiUrl}/saved-sentences/save`, sentenceData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.status === 'success') {
        // Optimistically update the local state
        const newSentence: SavedSentence = {
          ...sentenceData,
          saved_at: new Date().toISOString(),
        };
        setSavedSentences(prev => [newSentence, ...prev]);
        setSavedSentencesCount(prev => prev + 1);
        return true;
      } else {
        setError(response.data?.message || 'Failed to save sentence');
        return false;
      }
    } catch (error) {
      console.error('Error saving sentence:', error);
      logContentError(error, "saved sentence");
      
      const errorMessage = getErrorMessage(error, t);
      setError(errorMessage);
      
      // Show alert for inappropriate content
      if (isInappropriateContentError(error)) {
        Alert.alert(
          t("common.warning"),
          errorMessage,
          [{ text: t("common.ok") }]
        );
      }
      
      return false;
    }
  }, [token, apiUrl]);

  // Unsave a sentence
  const unsaveSentence = useCallback(async (sentence: string, meaning: string): Promise<boolean> => {
    if (!token) {
      setError('Authentication required');
      return false;
    }

    try {
      const response = await axios.delete(`${apiUrl}/saved-sentences/delete`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { sentence, meaning },
      });

      if (response.data && response.data.status === 'success') {
        // Optimistically update the local state
        setSavedSentences(prev => 
          prev.filter(s => !(s.sentence === sentence && s.meaning === meaning))
        );
        setSavedSentencesCount(prev => Math.max(0, prev - 1));
        return true;
      } else {
        setError(response.data?.message || 'Failed to remove sentence');
        return false;
      }
    } catch (error) {
      console.error('Error removing sentence:', error);
      setError('Failed to remove sentence');
      return false;
    }
  }, [token, apiUrl]);

  // Check if a sentence is saved (local check)
  const isSentenceSaved = useCallback((sentence: string, meaning: string): boolean => {
    return savedSentences.some(s => s.sentence === sentence && s.meaning === meaning);
  }, [savedSentences]);

  // Check if a sentence is saved (API check)
  const checkSentenceSaved = useCallback(async (sentence: string, meaning: string): Promise<boolean> => {
    if (!token) return false;

    try {
      const response = await axios.post(`${apiUrl}/saved-sentences/check`, 
        { sentence, meaning },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data?.isSaved || false;
    } catch (error) {
      console.error('Error checking sentence saved status:', error);
      return false;
    }
  }, [token, apiUrl]);

  // Load saved sentences when token changes
  useEffect(() => {
    if (token) {
      fetchSavedSentences();
    } else {
      setSavedSentences([]);
      setSavedSentencesCount(0);
    }
  }, [token, fetchSavedSentences]);

  return (
    <SavedSentencesContext.Provider
      value={{
        savedSentences,
        savedSentencesCount,
        isLoading,
        error,
        saveSentence,
        unsaveSentence,
        isSentenceSaved,
        checkSentenceSaved,
        fetchSavedSentences,
        refreshSentencesCount,
      }}
    >
      {children}
    </SavedSentencesContext.Provider>
  );
};

// Custom hook to use the context
export const useSavedSentences = () => {
  const context = useContext(SavedSentencesContext);
  if (context === undefined) {
    throw new Error('useSavedSentences must be used within a SavedSentencesProvider');
  }
  return context;
};