import { useState, useEffect, useCallback, useMemo } from "react";
import { Keyboard, Alert } from "react-native";
import { router } from "expo-router";
import { useProgress } from "@/contexts/ProgressContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthenticationContext";
import { useXP } from "@/contexts/XPContext";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
  getErrorMessage,
  logContentError,
  isInappropriateContentError,
} from "@/utils/errorHandling";

interface WordItem {
  word: string;
  meaning: string;
  relevantWords: string[];
  emoji: string; // Add emoji field
}

interface VocabularyQuizHookProps {
  wordListArray: WordItem[];
  currentIndex: number;
  isLastStep: boolean;
  vocabularyListId?: string; // Add vocabulary list ID parameter
  existingEventId?: string; // Add parameter for existing event ID
}

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

export const useVocabularyQuiz = ({
  wordListArray,
  currentIndex,
  isLastStep,
  vocabularyListId,
  existingEventId, // Accept existing event ID parameter
}: VocabularyQuizHookProps) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [usedRelevantWords, setUsedRelevantWords] = useState<string[]>([]);
  const [showRelevantPopup, setShowRelevantPopup] = useState(false);
  const [popupWord, setPopupWord] = useState("");
  const [popupEmoji, setPopupEmoji] = useState(""); // Add state for popup emoji
  const [revealedLetterCount, setRevealedLetterCount] = useState<number>(0);
  const [isWrongAnswer, setIsWrongAnswer] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false); // Add bookmark state
  const [eventId, setEventId] = useState<string | null>(
    existingEventId || null
  ); // Initialize with existingEventId if provided
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now()); // Add session start time
  const [isEventCompleted, setIsEventCompleted] = useState<boolean>(false); // Add state to track completion status

  const { updateProgress, resetProgress } = useProgress();
  const { currentLanguage, interfaceLanguage } = useLanguage();
  const { token } = useAuth();
  const { addXP } = useXP(); // Add XP context for updating XP
  const { t } = useTranslation();

  // Safely get the current word with null checks
  const currentWord = useMemo(() => {
    // Safety check for valid array and index
    if (
      !Array.isArray(wordListArray) ||
      wordListArray.length === 0 ||
      currentIndex < 0 ||
      currentIndex >= wordListArray.length
    ) {
      return { word: "", meaning: "", relevantWords: [], emoji: "" };
    }

    const word = wordListArray[currentIndex];
    // Ensure all fields exist to prevent runtime errors
    return {
      word: word?.word || "",
      meaning: word?.meaning || "",
      relevantWords: Array.isArray(word?.relevantWords)
        ? word.relevantWords
        : [],
      emoji: word?.emoji || "",
    };
  }, [wordListArray, currentIndex]);
  // Initialize or check for existing vocabulary event when component mounts
  useEffect(() => {
    // Only proceed if token and vocabularyListId are available
    if (!token || !vocabularyListId || eventId) {
      console.log("[Debug] Event initialization skipped:", {
        hasToken: !!token,
        hasVocabularyListId: !!vocabularyListId,
        hasEventId: !!eventId,
      });
      return;
    }

    let isMounted = true; // Flag to prevent state updates on unmounted component

    const initializeEvent = async () => {
      try {
        // First check if there's an existing event for this vocabulary list
        const response = await axios.get(
          `${apiUrl}/vocabulary/event/${vocabularyListId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (
          isMounted &&
          response.data &&
          response.data.status === "success" &&
          response.data.event?._id
        ) {
          // Use existing event if found
          console.log("[Debug] Found existing event:", response.data.event._id);
          setEventId(response.data.event._id);
          setSessionStartTime(Date.now()); // Reset start time for existing event too
        } else {
          // If no event found or response indicates no event, try creating one
          console.log("[Debug] No existing event found, creating new one");

          // Check if wordListArray is populated before creating
          if (wordListArray.length === 0) {
            console.log(
              "[Debug] Word list array is empty, cannot create event yet"
            );
            return; // Don't proceed if word list is empty
          }

          const words = wordListArray.map((item) => item.word);

          const createResponse = await axios.post(
            `${apiUrl}/vocabulary/event/create`,
            {
              vocabulary_list_id: vocabularyListId,
              words: words,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (
            isMounted &&
            createResponse.data &&
            createResponse.data.status === "success" &&
            createResponse.data.event?._id
          ) {
            console.log(
              "[Debug] Created new event:",
              createResponse.data.event._id
            );
            setEventId(createResponse.data.event._id);
            setSessionStartTime(Date.now()); // Set start time for new event
          } else if (
            createResponse.data &&
            createResponse.data.status !== "success"
          ) {
            // Only log as error if the status is not success
            console.error(
              "[Debug] Failed to create new vocabulary event:",
              createResponse.data
            );
          }
        }
      } catch (error) {
        console.error("Error initializing vocabulary event:", error);

        // Check if error indicates "Not Found" (404), then try creating
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          // Check if wordListArray is populated before creating
          if (wordListArray.length === 0) {
            return; // Don't proceed if word list is empty
          }

          try {
            const words = wordListArray.map((item) => item.word);

            const createResponse = await axios.post(
              `${apiUrl}/vocabulary/event/create`,
              {
                vocabulary_list_id: vocabularyListId,
                words: words,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (
              isMounted &&
              createResponse.data &&
              createResponse.data.status === "success" &&
              createResponse.data.event?._id
            ) {
              setEventId(createResponse.data.event._id);
              setSessionStartTime(Date.now()); // Set start time for new event
            } else if (
              createResponse.data &&
              createResponse.data.status !== "success"
            ) {
              // Only log as error if the status is not success
              console.error(
                "Failed to create new vocabulary event after 404:",
                createResponse.data
              );
            }
          } catch (createError) {
            console.error(
              "Error creating vocabulary event after 404:",
              createError
            );
          }
        }
      }
    };

    initializeEvent();

    return () => {
      isMounted = false; // Set flag to false when component unmounts
    };
  }, [token, vocabularyListId, wordListArray, eventId]);

  // Update event duration every 10 seconds
  useEffect(() => {
    if (!eventId || isEventCompleted) return;

    const updateInterval = setInterval(() => {
      const currentTime = Date.now();
      const durationSeconds = Math.floor(
        (currentTime - sessionStartTime) / 1000
      );

      updateVocabularyEvent({
        duration_seconds: durationSeconds,
      });
    }, 10000); // Update every 10 seconds

    return () => clearInterval(updateInterval);
  }, [eventId, sessionStartTime, isEventCompleted]);

  // Update event when the quiz is completed
  useEffect(() => {
    if (!eventId || isEventCompleted) return;

    // Cleanup function: update the event one last time when component unmounts
    return () => {
      const currentTime = Date.now();
      const durationSeconds = Math.floor(
        (currentTime - sessionStartTime) / 1000
      );

      updateVocabularyEvent({
        duration_seconds: durationSeconds,
      });
    };
  }, [eventId, sessionStartTime, isEventCompleted]);

  // Function to update vocabulary event
  const updateVocabularyEvent = useCallback(
    async (updateData: any) => {
      if (!eventId || !token || isEventCompleted) return;

      try {
        await axios.post(
          `${apiUrl}/vocabulary/event/update`,
          {
            event_id: eventId,
            ...updateData,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error("Error updating vocabulary event:", error);
      }
    },
    [eventId, token, isEventCompleted]
  );
  // Complete the vocabulary event and award XP
  const completeVocabularyEvent = useCallback(async () => {
    if (!eventId || !token || isEventCompleted) {
      console.log("[Debug] Vocabulary event completion skipped:", {
        hasEventId: !!eventId,
        hasToken: !!token,
        isEventCompleted,
      });
      return 0;
    }

    try {
      console.log(
        "[Debug] Making vocabulary event completion request for event:",
        eventId
      );
      const response = await axios.post(
        `${apiUrl}/vocabulary/event/complete`,
        {
          event_id: eventId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.status === "success") {
        const xpEarned = response.data.xp_earned || 0;
        console.log(
          "[Debug] Vocabulary event completion successful, XP earned:",
          xpEarned
        );

        // Update the XP in the UI context
        if (xpEarned > 0) {
          await addXP(xpEarned);
        }

        setIsEventCompleted(true); // Mark the event as completed
        return xpEarned;
      } else {
        console.error(
          "[Debug] Vocabulary event completion failed:",
          response.data
        );
      }
    } catch (error) {
      console.error("[Debug] Error completing vocabulary event:", error);
    }

    return 0;
  }, [eventId, token, addXP, isEventCompleted]);

  // Reset states when current word changes - with safer dependency array
  useEffect(() => {
    // Skip resetting if the word is empty (initial render or error state)
    if (!currentWord.word) return;

    setInputValue("");
    setRevealedLetterCount(0);
    setUsedRelevantWords([]);
    setShowRelevantPopup(false);
    setPopupWord("");
    setPopupEmoji(""); // Also reset the popup emoji
    setIsWrongAnswer(false);
    checkBookmarkStatus(); // Check bookmark status when word changes
  }, [currentWord.word]);

  // Check if the current word is already bookmarked
  const checkBookmarkStatus = useCallback(async () => {
    try {
      if (!token || !currentWord.word || !currentWord.meaning) {
        return;
      }

      // Reset bookmark status to false by default when word changes
      setIsBookmarked(false);

      // Check if this word is already bookmarked
      const response = await axios.post(
        `${apiUrl}/vocabulary/check/saved`,
        {
          word: currentWord.word,
          meaning: currentWord.meaning,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.isBookmarked) {
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Error checking bookmark status:", error);
      // Default to not bookmarked if there's an error
      setIsBookmarked(false);
    }
  }, [token, currentWord.word, currentWord.meaning]);

  // Handle bookmark toggle
  const handleBookmarkToggle = useCallback(async () => {
    try {
      if (!token) {
        console.error("No token found when trying to save vocabulary");
        return;
      }

      if (!currentWord.word || !currentWord.meaning) {
        console.error("No valid word data to save");
        return;
      }

      if (isBookmarked) {
        // Unsave the vocabulary
        await axios.delete(`${apiUrl}/vocabulary/delete/saved`, {
          headers: { Authorization: `Bearer ${token}` },
          data: {
            word: currentWord.word,
            meaning: currentWord.meaning,
          },
        });
      } else {
        // Save the vocabulary
        await axios.post(
          `${apiUrl}/vocabulary/save`,
          {
            word: currentWord.word,
            meaning: currentWord.meaning,
            relevantWords: currentWord.relevantWords || [],
            emoji: currentWord.emoji || "📚",
            system_language: interfaceLanguage, // Using the interface language from context
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      logContentError(error, "vocabulary save");

      // Show user-friendly error for inappropriate content
      if (isInappropriateContentError(error)) {
        Alert.alert(t("common.warning"), getErrorMessage(error, t), [
          { text: t("common.ok") },
        ]);
      }
    }
  }, [token, currentWord, isBookmarked, interfaceLanguage]);

  // Function to track hint usage to the backend
  const trackHintUsage = useCallback(
    async (hintType: string) => {
      try {
        // Skip if current word is empty
        if (!currentWord.word || !currentWord.meaning) return;

        if (!token) {
          console.error("No token found when trying to track hint usage");
          return;
        }

        // Send the hint usage to backend
        await axios.post(
          `${apiUrl}/vocabulary/track-hint`,
          {
            word: currentWord.word,
            meaning: currentWord.meaning,
            hint_type: hintType,
            system_language: currentLanguage,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Also update the vocabulary event
        if (eventId) {
          await updateVocabularyEvent({
            hint_type: hintType,
          });
        }
      } catch (error) {
        console.error("Error tracking hint usage:", error);
        // Silent failure - don't interrupt user experience for tracking
      }
    },
    [currentWord, currentLanguage, token, eventId, updateVocabularyEvent]
  );

  // Function to track attempt results to the backend
  const trackAttemptResult = useCallback(
    async (success: boolean) => {
      try {
        // Skip if current word is empty
        if (!currentWord.word || !currentWord.meaning) return;

        if (!token) {
          console.error("No token found when trying to track attempt result");
          return;
        }

        // Send the attempt result to backend
        await axios.post(
          `${apiUrl}/vocabulary/track-attempt`,
          {
            word: currentWord.word,
            meaning: currentWord.meaning,
            success: success,
            system_language: currentLanguage,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Also update the vocabulary event
        if (eventId) {
          await updateVocabularyEvent({
            is_correct: success,
          });
        }
      } catch (error) {
        console.error("Error tracking attempt result:", error);
        // Silent failure - don't interrupt user experience for tracking
      }
    },
    [currentWord, currentLanguage, token, eventId, updateVocabularyEvent]
  );

  // Clear all inputs
  const clearAllInputs = useCallback(() => {
    setInputValue("");
  }, []);

  // Handle getting relevant word
  const handleGetRelevantWord = useCallback(() => {
    const allRelevantWords = currentWord.relevantWords;

    // No relevant words available - we should never get here as the button should be disabled
    if (!allRelevantWords.length) {
      return;
    }

    const unusedWords = allRelevantWords.filter(
      (word) => !usedRelevantWords.includes(word)
    );

    // If all words have been used, reset the used words array to reuse them
    if (unusedWords.length === 0) {
      setUsedRelevantWords([]);
      // Use a word from the original list after resetting
      const randomIndex = Math.floor(Math.random() * allRelevantWords.length);
      const chosenWord = allRelevantWords[randomIndex];

      // Track the hint usage
      trackHintUsage("relevant_word");

      setUsedRelevantWords([chosenWord]);
      setPopupEmoji(""); // Clear any emoji that might be showing
      setPopupWord(chosenWord);
      setShowRelevantPopup(true);
      return;
    }

    const randomIndex = Math.floor(Math.random() * unusedWords.length);
    const chosenWord = unusedWords[randomIndex];

    // Track the hint usage
    trackHintUsage("relevant_word");

    setUsedRelevantWords((prev) => [...prev, chosenWord]);
    setPopupEmoji(""); // Clear any emoji that might be showing
    setPopupWord(chosenWord);
    setShowRelevantPopup(true);
  }, [currentWord.relevantWords, usedRelevantWords, trackHintUsage]);

  // Handle opening one letter
  const handleOpenOneLetter = useCallback(() => {
    const correctAnswer = currentWord.meaning;
    if (!correctAnswer || revealedLetterCount >= correctAnswer.length) {
      return;
    }

    // Find the next non-space character to reveal
    let nextRevealIndex = revealedLetterCount;
    // Skip spaces when revealing letters
    while (
      nextRevealIndex < correctAnswer.length &&
      correctAnswer[nextRevealIndex] === " "
    ) {
      nextRevealIndex++;
    }

    // If we're at the end of the string after skipping spaces, don't proceed
    if (nextRevealIndex >= correctAnswer.length) {
      return;
    }

    // Track the hint usage
    trackHintUsage("letter");

    // Set the revealed count to the next position after the character we're revealing
    setRevealedLetterCount(nextRevealIndex + 1);
    setInputValue("");
  }, [currentWord.meaning, revealedLetterCount, trackHintUsage]);

  // Handle emoji functionality
  const handleGetEmoji = useCallback(() => {
    // Track the hint usage
    trackHintUsage("emoji");

    setPopupWord(""); // Clear any relevant word that might be showing
    setPopupEmoji(currentWord.emoji);
    setShowRelevantPopup(true);
  }, [currentWord.emoji, trackHintUsage]);

  // Handle checking answer and navigation
  const handleNext = useCallback(() => {
    try {
      // Use a properly internationalized function to normalize answer strings
      // This handles Turkish, Spanish and English characters properly
      const normalizeString = (str: string) => {
        return str
          .normalize("NFD") // Normalize diacritical marks
          .replace(/[\u0300-\u036f]/g, "") // Remove diacritical marks where necessary
          .toLocaleLowerCase();
      };

      // Normalize the correct answer properly
      const correctAnswer = currentWord.meaning;
      const normalizedCorrectAnswer = normalizeString(correctAnswer);

      // Safety check for empty correct answer
      if (!correctAnswer) {
        router.replace("/");
        return;
      }

      // Count actual characters (excluding spaces) in the correct answer
      const actualCharCount = normalizedCorrectAnswer.replace(/\s/g, "").length;

      // If all actual characters have been revealed, consider the answer correct automatically
      const isAllRevealed = revealedLetterCount >= correctAnswer.length;

      // Get user answer and normalize it
      const userAnswer = inputValue;
      const normalizedUserAnswer = normalizeString(userAnswer);

      // We need to compare considering spaces in correctAnswer
      // First, identify the unrevealed part of the correct answer including spaces
      const remainingCorrectAnswer =
        normalizedCorrectAnswer.slice(revealedLetterCount);

      // Then, remove spaces from both to compare only the actual characters
      const remainingCorrectWithoutSpaces = remainingCorrectAnswer.replace(
        /\s/g,
        ""
      );
      const normalizedUserAnswerWithoutSpaces = normalizedUserAnswer.replace(
        /\s/g,
        ""
      );

      // Determine if the answer is correct (comparing without spaces)
      // If all letters are revealed OR the user input matches remaining characters
      const isCorrect =
        isAllRevealed ||
        normalizedUserAnswerWithoutSpaces === remainingCorrectWithoutSpaces;

      // Track the attempt result
      trackAttemptResult(isCorrect);

      if (isCorrect) {
        updateProgress();

        if (isLastStep) {
          resetProgress(); // Complete the vocabulary event if this is the last step
          if (eventId) {
            console.log("[Debug] Completing vocabulary event:", eventId);
            completeVocabularyEvent().then((xpEarned) => {
              console.log("[Debug] Event completed, XP earned:", xpEarned);
              // Navigate to result page with XP information
              router.navigate({
                pathname: "./result",
                params: {
                  xpEarned: String(xpEarned),
                },
              });
            });
          } else {
            console.warn(
              "[Debug] No event ID available, navigating without XP completion"
            );
            router.navigate("./result");
          }
        } else {
          // Go to next question
          const nextIndex = currentIndex + 1;
          // Handle case if wordListArray is not an array
          const safeArray = Array.isArray(wordListArray) ? wordListArray : [];
          const encodedSteps = encodeURIComponent(JSON.stringify(safeArray));

          router.navigate({
            pathname: "./question",
            params: {
              wordList: encodedSteps,
              stepIndex: String(nextIndex),
              vocabularyListId: vocabularyListId, // Pass vocabulary list ID
              eventId: eventId, // Pass event ID
            },
          });
        }
      } else {
        clearAllInputs();

        // Set wrong answer state to true to trigger animation
        setIsWrongAnswer(true);

        // Dismiss keyboard to remove focus
        Keyboard.dismiss();

        // Reset the wrong answer state after a delay to allow animation to complete
        setTimeout(() => {
          setIsWrongAnswer(false);
        }, 800);
      }
    } catch (error) {
      console.error("Error in handleNext:", error);
      // Silent failure - don't interrupt user experience
    }
  }, [
    currentWord.meaning,
    inputValue,
    revealedLetterCount,
    isLastStep,
    currentIndex,
    wordListArray,
    updateProgress,
    resetProgress,
    clearAllInputs,
    trackAttemptResult,
    vocabularyListId,
    eventId,
    completeVocabularyEvent,
  ]);

  // Handle popup close
  const handleCloseRelevantPopup = useCallback(() => {
    setShowRelevantPopup(false);
  }, []);

  // Check if buttons should be disabled
  const hasRelevantWords = useMemo(() => {
    return currentWord.relevantWords && currentWord.relevantWords.length > 0;
  }, [currentWord.relevantWords]);

  const hasEmoji = useMemo(() => {
    return !!currentWord.emoji;
  }, [currentWord.emoji]);

  return {
    inputValue,
    setInputValue,
    usedRelevantWords,
    showRelevantPopup,
    popupWord,
    popupEmoji,
    revealedLetterCount,
    isWrongAnswer,
    isBookmarked,
    clearAllInputs,
    handleGetRelevantWord,
    handleOpenOneLetter,
    handleGetEmoji,
    handleNext,
    handleCloseRelevantPopup,
    handleBookmarkToggle,
    hasRelevantWords,
    hasEmoji,
    eventId,
    sessionStartTime,
    updateVocabularyEvent,
    completeVocabularyEvent,
  };
};
