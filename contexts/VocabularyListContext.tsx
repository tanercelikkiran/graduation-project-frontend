import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthenticationContext';

// Vocabulary için tip tanımlaması
export interface VocabularyItem {
  id: string;
  title: string;
  whichIcon: "turkish" | "spanish" | "english" | "vocab";
  statusIcon: "empty" | "first" | "second";
}

// Interface for API response
interface UserVocabularyList {
  id: string;
  title: string;
  word_count: number;
  created_at: string;
}

// Interface for popular vocabulary API response
interface PopularVocabularyList {
  id: string;
  title: string;
  learning_language: string;
  system_language: string;
  words: any[];
  word_count: number;
  source: string;
}

// Context için tip tanımlaması
interface VocabularyContextType {
  popularVocabularies: VocabularyItem[];
  yourVocabularies: VocabularyItem[];
  selectedVocabId: string;
  expandedVocabId: string | null;
  activeTab: "popular" | "your";
  setSelectedVocabId: (id: string) => void;
  setExpandedVocabId: (id: string | null) => void;
  setActiveTab: (tab: "popular" | "your") => void;
  addVocabulary: (vocabulary: VocabularyItem, isPopular: boolean) => void;
  updateVocabulary: (vocabulary: VocabularyItem, isPopular: boolean) => void;
  deleteVocabulary: (id: string, isPopular: boolean) => void;
  isLoading: boolean;
  fetchUserVocabularyLists: () => Promise<void>;
  fetchPopularVocabularies: () => Promise<void>;
  refreshAllVocabularies: () => Promise<void>;
}

// Context'i oluştur
const VocabularyListContext = createContext<VocabularyContextType | undefined>(undefined);

// Provider bileşeni
export const VocabularyListProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token } = useAuth(); // Correctly use the useAuth hook at the component level
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  
  // Initialize popular vocabularies as empty array - will be loaded from API
  const [popularVocabularies, setPopularVocabularies] = useState<VocabularyItem[]>([]);

  // Initialize with empty array instead of hardcoded test data since we'll load from backend
  const [yourVocabularies, setYourVocabularies] = useState<VocabularyItem[]>([]);
  
  // Başlangıçta hiçbir öğenin seçili olmaması için boş string olarak değiştir
  const [selectedVocabId, setSelectedVocabId] = useState<string>("");
  // Genişletilen öğe için yeni durum değişkeni
  const [expandedVocabId, setExpandedVocabId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"popular" | "your">("popular");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Toggleable seçim fonksiyonu ekle
  const toggleSelectedVocabulary = (id: string) => {
    // Eğer zaten seçili olan kelime listesine tıklandıysa, seçimi kaldır
    if (selectedVocabId === id) {
      setSelectedVocabId("");
    } else {
      // Değilse, yeni kelime listesini seç
      setSelectedVocabId(id);
    }
  };

  // Vocabulary ekleme fonksiyonu
  const addVocabularyList = (vocabulary: VocabularyItem, isPopular: boolean) => {
    if (isPopular) {
      setPopularVocabularies([...popularVocabularies, vocabulary]);
    } else {
      setYourVocabularies([...yourVocabularies, vocabulary]);
    }
  };

  // Vocabulary güncelleme fonksiyonu
  const updateVocabularyList = (updatedVocabulary: VocabularyItem, isPopular: boolean) => {
    if (isPopular) {
      setPopularVocabularies(
        popularVocabularies.map((vocab) => 
          vocab.id === updatedVocabulary.id ? updatedVocabulary : vocab
        )
      );
    } else {
      setYourVocabularies(
        yourVocabularies.map((vocab) => 
          vocab.id === updatedVocabulary.id ? updatedVocabulary : vocab
        )
      );
    }
  };

  // Vocabulary silme fonksiyonu
  const deleteVocabularyList = async (id: string, isPopular: boolean) => {
    // We don't allow deleting popular vocabularies, they're system defined
    if (isPopular) {
      setPopularVocabularies(popularVocabularies.filter((vocab) => vocab.id !== id));
      return;
    }
    
    // For user vocabularies, call the backend API to delete
    if (token) {
      try {
        setIsLoading(true);
        const response = await axios.delete(`${apiUrl}/vocabulary/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.data && response.data.status === "success") {
          // Remove the vocabulary list from the local state
          setYourVocabularies(yourVocabularies.filter((vocab) => vocab.id !== id));
          
          // If the deleted vocabulary was selected, clear the selection
          if (selectedVocabId === id) {
            setSelectedVocabId("");
          }
          
          // If the deleted vocabulary was expanded, collapse it
          if (expandedVocabId === id) {
            setExpandedVocabId(null);
          }
        } else {
          console.error('Error deleting vocabulary list:', response.data.message);
        }
      } catch (error) {
        console.error('Error deleting vocabulary list:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Fallback for when not authenticated - just update the UI
      setYourVocabularies(yourVocabularies.filter((vocab) => vocab.id !== id));
    }
  };

  // Fetch popular vocabulary lists - use useCallback to avoid unnecessary recreations
  const fetchPopularVocabularies = useCallback(async () => {
    if (!token) {
      console.log("No token available, skipping popular vocabularies fetch");
      return;
    }
    
    try {
      const response = await axios.get(`${apiUrl}/vocabulary/popular`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.popular_vocabularies) {
        // Convert API response to our VocabularyItem format
        const vocabularyItems: VocabularyItem[] = response.data.popular_vocabularies.map(
          (list: PopularVocabularyList) => ({
            id: list.id,
            title: list.title,
            whichIcon: "vocab", // Use vocab icon for popular lists
            statusIcon: list.word_count > 0 ? "first" : "empty" // Status based on word count
          })
        );
        
        // Update state with the new data
        setPopularVocabularies(vocabularyItems);
      }
    } catch (error) {
      console.error('Error fetching popular vocabulary lists:', error);
    }
  }, [token, apiUrl]);

  // Fetch user vocabulary lists - use useCallback to avoid unnecessary recreations
  const fetchUserVocabularyLists = useCallback(async () => {
    if (!token) {
      console.log("No token available, skipping fetch");
      return;
    }
    
    try {
      const response = await axios.get(`${apiUrl}/vocabulary/user-lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.vocabulary_lists) {
        // Convert API response to our VocabularyItem format
        const vocabularyItems: VocabularyItem[] = response.data.vocabulary_lists.map(
          (list: UserVocabularyList) => ({
            id: list.id,
            title: list.title,
            whichIcon: "vocab", // Use vocab icon for user-created lists
            statusIcon: list.word_count > 0 ? "first" : "empty" // Status based on word count
          })
        );
        
        // Update state with the new data
        setYourVocabularies(vocabularyItems);
      }
    } catch (error) {
      console.error('Error fetching user vocabulary lists:', error);
    }
  }, [token, apiUrl]);

  // Combined fetch function to load both popular and user vocabularies
  const fetchAllVocabularies = useCallback(async () => {
    if (!token) {
      console.log("No token available, skipping vocabulary fetch");
      return;
    }
    
    setIsLoading(true);
    try {
      await Promise.all([
        fetchPopularVocabularies(),
        fetchUserVocabularyLists()
      ]);
    } catch (error) {
      console.error('Error fetching vocabularies:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, fetchPopularVocabularies, fetchUserVocabularyLists]);
  
  // Load vocabulary lists when the component mounts or when token changes
  useEffect(() => {
    if (token) {
      fetchAllVocabularies();
    }
  }, [token, fetchAllVocabularies]);

  return (
    <VocabularyListContext.Provider
      value={{
        popularVocabularies,
        yourVocabularies,
        selectedVocabId,
        expandedVocabId,
        activeTab,
        setSelectedVocabId: toggleSelectedVocabulary,
        setExpandedVocabId,
        setActiveTab,
        addVocabulary: addVocabularyList,
        updateVocabulary: updateVocabularyList,
        deleteVocabulary: deleteVocabularyList,
        isLoading,
        fetchUserVocabularyLists,
        fetchPopularVocabularies,
        refreshAllVocabularies: fetchAllVocabularies,
      }}
    >
      {children}
    </VocabularyListContext.Provider>
  );
};

// Context'i kullanmak için özel hook
export const useVocabulary = () => {
  const context = useContext(VocabularyListContext);
  if (context === undefined) {
    throw new Error('useVocabulary hook must be used within a VocabularyProvider');
  }
  return context;
};
