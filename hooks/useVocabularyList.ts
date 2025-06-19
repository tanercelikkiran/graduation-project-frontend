import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthenticationContext";
import { VocabularyItem, VocabularyListHookResult } from "@/types/types";

export const useVocabularyList = (
  vocabularyListId?: string,
  isRework: boolean = false
): VocabularyListHookResult => {
  const [vocabularyList, setVocabularyList] = useState<VocabularyItem[]>([]);
  const [extractedVocabListId, setExtractedVocabListId] = useState<
    string | undefined
  >(vocabularyListId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const { token, refreshToken } = useAuth();
  const { t, i18n } = useTranslation();

  const fetchWordList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const systemLanguage = i18n.language;

      console.log(`[Debug] fetchWordList called with params:`, {
        vocabularyListId,
        isRework,
        retryCount,
        hasToken: !!token,
        apiUrl,
      });

      let response;

      // If vocabularyListId and isRework are provided, use the rework endpoint
      if (vocabularyListId && isRework) {
        console.log(
          `[Debug] Making rework request to: ${apiUrl}/vocabulary/rework/${vocabularyListId}`
        );

        // Add a delay and log the exact time for debugging purposes
        console.log(
          `[Debug] Sending rework request at ${new Date().toISOString()}`
        );

        response = await axios.post(
          `${apiUrl}/vocabulary/rework/${vocabularyListId}`,
          { system_language: systemLanguage },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            // Add a longer timeout for rework requests
            timeout: 30000,
          }
        );

        console.log(
          `[Debug] Received rework response at ${new Date().toISOString()}`
        );
        console.log("[Debug] Rework response status:", response.status);
        console.log("[Debug] Rework response headers:", response.headers);

        // Log the structure of the response data
        if (response.data) {
          console.log("[Debug] Rework response data structure:", {
            hasVocabularyList: !!response.data.vocabulary_list,
            responseKeys: Object.keys(response.data),
            dataType: typeof response.data,
          });

          if (response.data.vocabulary_list) {
            // Check if vocabulary_list is an object with words array or directly an array
            if (
              response.data.vocabulary_list.words &&
              Array.isArray(response.data.vocabulary_list.words)
            ) {
              console.log(
                "[Debug] Rework vocabulary list is an object with words array, length:",
                response.data.vocabulary_list.words.length
              );
              // Set the words array as the vocabulary list
              setVocabularyList(response.data.vocabulary_list.words);
            } else if (Array.isArray(response.data.vocabulary_list)) {
              console.log(
                "[Debug] Rework vocabulary list is directly an array, length:",
                response.data.vocabulary_list.length
              );
              setVocabularyList(response.data.vocabulary_list);
            } else {
              console.log(
                "[Debug] Rework vocabulary list has unexpected structure:",
                response.data.vocabulary_list
              );
              setVocabularyList([]);
            }

            if (response.data.vocabulary_list.length === 0) {
              console.log("[Debug] Rework returned empty list!");
            }
          } else {
            console.log("[Debug] Rework response missing vocabulary_list key");
          }
        } else {
          console.log("[Debug] Rework response data is undefined or null");
        }
      } else if (vocabularyListId) {
        // If only vocabularyListId is provided, get that specific vocabulary list
        console.log("Fetching specific vocabulary list:", vocabularyListId);
        response = await axios.get(
          `${apiUrl}/vocabulary/get/${vocabularyListId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // Default case: create a new vocabulary list
        console.log("Creating new vocabulary list");
        response = await axios.post(
          `${apiUrl}/vocabulary/create`,
          { system_language: systemLanguage },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } // Check if the response has the expected structure
      if (response.data) {
        // Extract vocabulary list ID from response if available
        let responseVocabListId: string | undefined;

        // Handle different response formats
        if (response.data.vocabulary_list) {
          // Original expected format with vocabulary_list property
          if (response.data.vocabulary_list._id) {
            responseVocabListId = response.data.vocabulary_list._id;
          }
          if (
            response.data.vocabulary_list.words &&
            Array.isArray(response.data.vocabulary_list.words)
          ) {
            console.log(
              `[Debug] Setting vocabulary list from words property with ${response.data.vocabulary_list.words.length} items`
            );
            setVocabularyList(response.data.vocabulary_list.words);
          } else if (Array.isArray(response.data.vocabulary_list)) {
            console.log(
              `[Debug] Setting vocabulary list directly with ${response.data.vocabulary_list.length} items`
            );
            setVocabularyList(response.data.vocabulary_list);
          }
        }
        // New API format: response with _id and words array directly
        else if (
          response.data._id &&
          response.data.words &&
          Array.isArray(response.data.words)
        ) {
          responseVocabListId = response.data._id;
          console.log(
            `[Debug] Setting vocabulary list from direct response words array with ${response.data.words.length} items`
          );
          setVocabularyList(response.data.words);
        } else {
          console.warn(
            "[Debug] Unexpected API response format:",
            response.data
          );
          setVocabularyList([]);

          // For rework scenarios, retry if no words were returned and we haven't exceeded max retries
          if (isRework && retryCount < 3) {
            console.log(
              "[Debug] Retrying rework request, attempt:",
              retryCount + 1
            );
            setRetryCount((prev) => prev + 1);
            // Will trigger the useEffect to retry
          }
        }

        // Update extracted vocabulary list ID if we got one from the response
        if (responseVocabListId) {
          console.log(
            `[Debug] Extracted vocabulary list ID from response: ${responseVocabListId}`
          );
          setExtractedVocabListId(responseVocabListId);
        }
      } else {
        console.warn("[Debug] Empty API response");
        setVocabularyList([]);
      }
    } catch (error) {
      console.error("[Debug] Error in fetchWordList:", error);

      if (axios.isAxiosError(error)) {
        console.log("[Debug] Axios error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          responseData: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            timeout: error.config?.timeout,
          },
        });
      }

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.log("[Debug] Got 401, trying to refresh token");
        const refreshed = await refreshToken();
        if (refreshed) {
          // Try again if token was refreshed
          console.log("[Debug] Token refreshed, retrying request");
          return fetchWordList();
        }
      }

      setError(
        error instanceof Error ? error : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [token, refreshToken, t, i18n, vocabularyListId, isRework, retryCount]);

  useEffect(() => {
    console.log(
      "[Debug] useEffect triggered for fetchWordList with token:",
      !!token
    );
    if (token) {
      fetchWordList();
    } else {
      setLoading(false);
    }
  }, [token, fetchWordList, retryCount]); // Add retryCount as dependency
  return {
    vocabularyList,
    vocabularyListId: extractedVocabListId,
    loading,
    error,
    fetchWordList,
  };
};
