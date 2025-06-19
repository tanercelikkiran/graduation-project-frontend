import React, { createContext, useContext, useState, useMemo } from "react";

interface ProgressContextType {
  progress: number;
  updateProgress: () => void;
  resetProgress: () => void;
  totalSteps: number;
  currentStep: number;
  setTotalSteps: (total: number) => void;
  setCurrentStep: (step: number) => void;
  isLastStep: () => boolean;
}

const ProgressContext = createContext<ProgressContextType>(
  {} as ProgressContextType
);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [progress, setProgress] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  // Üslü ağırlık dağılımı ile adım ağırlıklarını hesapla
  const stepWeights = useMemo(() => {
    if (totalSteps === 0) return [];

    return Array.from({ length: totalSteps }, (_, index) => {
      // Her adımın ağırlığını (kalan adım sayısının karesi) olarak belirle
      return Math.pow(totalSteps - index, 1.4);
    });
  }, [totalSteps]);

  // Normalize edilmiş yüzdeleri hesapla
  const stepPercentages = useMemo(() => {
    const totalWeight = stepWeights.reduce((sum, weight) => sum + weight, 0);
    return stepWeights.map((weight) => (weight / totalWeight) * 100);
  }, [stepWeights]);

  const updateProgress = () => {
    if (currentStep < totalSteps - 1) {
      const increment = stepPercentages[currentStep] || 0;
      setProgress((prev) => Math.min(prev + increment, 100));
      setCurrentStep((prev) => prev + 1);
    }
  };

  const resetProgress = () => {
    setProgress(0);
    setTotalSteps(0);
    setCurrentStep(0);
  };

  const isLastStep = () => {
    return currentStep === totalSteps - 1;
  };

  return (
    <ProgressContext.Provider
      value={{
        progress,
        updateProgress,
        resetProgress,
        totalSteps,
        currentStep,
        setTotalSteps,
        setCurrentStep,
        isLastStep,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => useContext(ProgressContext);
