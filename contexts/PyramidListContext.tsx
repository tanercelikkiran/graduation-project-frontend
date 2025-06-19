import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./AuthenticationContext";

// Piramit için tip tanımlaması
export interface Pyramid {
  id: string;
  title: string;
}

// API response interface - matches PyramidOut from backend
interface PyramidApiResponse {
  id: string;
  step_types: string[];
  steps: any[];
  total_steps: number;
  last_step: number;
  completed: boolean;
}

// Context için tip tanımlaması
interface PyramidContextType {
  pyramids: Pyramid[];
  selectedPyramidId: string;
  expandedPyramidId: string | null;
  isLoading: boolean;
  setSelectedPyramidId: (id: string) => void;
  setExpandedPyramidId: (id: string | null) => void;
  addPyramid: (pyramid: Pyramid) => void;
  updatePyramid: (pyramid: Pyramid) => void;
  deletePyramid: (id: string) => Promise<void>;
  fetchUserPyramids: () => Promise<void>;
}

// Context'i oluştur
const PyramidContext = createContext<PyramidContextType | undefined>(undefined);

// Provider bileşeni
export const PyramidProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { token } = useAuth();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  
  // Initialize with empty array since we'll load from backend
  const [pyramids, setPyramids] = useState<Pyramid[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [selectedPyramidId, setSelectedPyramidId] = useState<string>("");
  const [expandedPyramidId, setExpandedPyramidId] = useState<string | null>(
    null
  );

  // Seçili piramidi değiştirme fonksiyonu - toggle işlevi ekleyeceğiz
  const toggleSelectedPyramid = (id: string) => {
    // Eğer zaten seçili olan piramite tıklandıysa, seçimi kaldır
    if (selectedPyramidId === id) {
      setSelectedPyramidId("");
    } else {
      // Değilse, yeni piramidi seç
      setSelectedPyramidId(id);
    }
  };

  // Fetch user pyramids from backend
  const fetchUserPyramids = useCallback(async () => {
    if (!token) {
      console.log("No token available, skipping pyramid fetch");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/pyramid/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && Array.isArray(response.data)) {
        // Convert API response to our Pyramid format with numbered titles
        const pyramidItems: Pyramid[] = response.data.map(
          (pyramid: PyramidApiResponse, index: number) => ({
            id: pyramid.id,
            title: `Pyramid List ${index + 1}`,
          })
        );
        
        setPyramids(pyramidItems);
      }
    } catch (error) {
      console.error('Error fetching user pyramids:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, apiUrl]);


  // Fetch pyramids when token becomes available
  useEffect(() => {
    if (token) {
      fetchUserPyramids();
    }
  }, [token, fetchUserPyramids]);

  // Piramit ekleme fonksiyonu - refresh the list to get updated data and correct numbering
  const addPyramid = (pyramid: Pyramid) => {
    // Instead of adding manually, refresh the list to ensure correct numbering
    fetchUserPyramids();
  };

  // Piramit güncelleme fonksiyonu - refresh the list to ensure consistency
  const updatePyramid = (updatedPyramid: Pyramid) => {
    // Refresh the list to ensure data consistency
    fetchUserPyramids();
  };

  // Piramit silme fonksiyonu - refresh the list to ensure correct numbering
  const deletePyramid = async (id: string) => {
    if (!token) {
      console.log("No token available, skipping pyramid deletion");
      return;
    }

    try {
      await axios.delete(`${apiUrl}/pyramid/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Refresh the list to ensure correct numbering after deletion
      await fetchUserPyramids();
    } catch (error) {
      console.error('Error deleting pyramid:', error);
      throw error;
    }
  };

  return (
    <PyramidContext.Provider
      value={{
        pyramids,
        selectedPyramidId,
        expandedPyramidId,
        isLoading,
        setSelectedPyramidId: toggleSelectedPyramid,
        setExpandedPyramidId,
        addPyramid,
        updatePyramid,
        deletePyramid,
        fetchUserPyramids,
      }}
    >
      {children}
    </PyramidContext.Provider>
  );
};

// Context'i kullanmak için özel hook
export const usePyramidList = () => {
  const context = useContext(PyramidContext);
  if (context === undefined) {
    throw new Error(
      "usePyramidList hook must be used within a PyramidProvider"
    );
  }
  return context;
};
