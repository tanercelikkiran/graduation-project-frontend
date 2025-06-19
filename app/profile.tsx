import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthenticationContext";
import { useScale } from "@/hooks/useScale";
import CloseButton from "@/components/CloseButton";
import axios from "axios";
import PrimaryButton from "@/components/PrimaryButton";
import DialogModal from "@/components/DialogModal";
import { useNavigationBar } from "@/hooks/useNavigationBar";

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { logout, token } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [originalUsername, setOriginalUsername] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Dialog states
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: "",
    message: "",
    isConfirmation: false,
    confirmButtonText: "",
    cancelButtonText: "",
    onConfirm: () => {},
    onCancel: () => {},
    destructiveConfirm: false,
  });

  const { horizontalScale, verticalScale } = useScale();

  const styles = createStyles(theme, horizontalScale, verticalScale);

  // Ensure navigation bar stays hidden in profile
  useNavigationBar();

  // Fetch user data from backend using JWT token
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const apiUrl = process.env.EXPO_PUBLIC_API_URL;
        const response = await axios.get(`${apiUrl}/user/get/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.data && response.status === 200) {
          const userData = response.data;
          setUsername(userData.username || "");
          setEmail(userData.email || "");
          setOriginalUsername(userData.username || "");
          setOriginalEmail(userData.email || "");
          setUserId(userData.id || "");
        } else {
          setError("Failed to load user data");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Error loading user profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  // Check if user has made changes to profile
  useEffect(() => {
    if (username !== originalUsername || email !== originalEmail) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [username, email, originalUsername, originalEmail]);

  const handleChangePassword = () => {
    router.push("/change-password");
  };

  // Validate email format
  const isEmailValid = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Save profile changes
  const handleSaveChanges = async () => {
    // Validate inputs
    if (!username.trim()) {
      showErrorDialog(t("common.error"), t("profile.errors.usernameRequired"));
      return;
    }

    if (!email.trim()) {
      showErrorDialog(t("common.error"), t("profile.errors.emailRequired"));
      return;
    }

    if (!isEmailValid(email)) {
      showErrorDialog(t("common.error"), t("profile.errors.invalidEmail"));
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      const response = await axios.put(
        `${apiUrl}/user/update`,
        {
          username,
          email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        // Update original values to match current values
        setOriginalUsername(username);
        setOriginalEmail(email);
        setHasChanges(false);
        showSuccessDialog(
          t("profile.updateSuccess.title"),
          t("profile.updateSuccess.message")
        );
      } else {
        setError(t("profile.errors.updateFailed"));
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);
      // Handle specific error cases like duplicate username/email
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError(t("profile.errors.updateFailed"));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (!userId) {
      showErrorDialog(
        t("profile.deleteAccount.error"),
        t("profile.deleteAccount.errorNoId")
      );
      return;
    }

    try {
      setIsDeleting(true);
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;

      // Corrected API endpoint path with user prefix
      const response = await axios.delete(`${apiUrl}/user/delete/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // If account deletion is successful
      if (response.status === 200) {
        showDeleteSuccessDialog(
          t("profile.deleteAccount.success"),
          t("profile.deleteAccount.successMessage")
        );
      } else {
        showErrorDialog(
          t("profile.deleteAccount.error"),
          t("profile.deleteAccount.errorMessage")
        );
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      showErrorDialog(
        t("profile.deleteAccount.error"),
        t("profile.deleteAccount.errorMessage")
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAccount = () => {
    showConfirmDialog(
      t("profile.deleteAccount.title"),
      t("profile.deleteAccount.confirmMessage"),
      t("profile.deleteAccount.confirm"),
      t("common.cancel"),
      deleteAccount,
      () => {},
      true
    );
  };

  // Helper functions for dialog modals
  const showErrorDialog = (title: string, message: string) => {
    setDialogConfig({
      title,
      message,
      isConfirmation: false,
      confirmButtonText: t("common.ok"),
      cancelButtonText: "",
      onConfirm: () => {},
      onCancel: () => {},
      destructiveConfirm: false,
    });
    setDialogVisible(true);
  };

  const showSuccessDialog = (title: string, message: string) => {
    setDialogConfig({
      title,
      message,
      isConfirmation: false,
      confirmButtonText: t("common.ok"),
      cancelButtonText: "",
      onConfirm: () => {},
      onCancel: () => {},
      destructiveConfirm: false,
    });
    setDialogVisible(true);
  };

  const showDeleteSuccessDialog = (title: string, message: string) => {
    setDialogConfig({
      title,
      message,
      isConfirmation: false,
      confirmButtonText: t("common.ok"),
      cancelButtonText: "",
      onConfirm: () => {
        // Make sure to log out the user and clear any stored credentials
        logout();
        // Navigate to login screen
        router.replace("/login");
      },
      onCancel: () => {},
      destructiveConfirm: false,
    });
    setDialogVisible(true);
  };

  const showConfirmDialog = (
    title: string,
    message: string,
    confirmText: string,
    cancelText: string,
    onConfirm: () => void,
    onCancel: () => void,
    isDestructive = false
  ) => {
    setDialogConfig({
      title,
      message,
      isConfirmation: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      onConfirm,
      onCancel,
      destructiveConfirm: isDestructive,
    });
    setDialogVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header with Profile title and X button */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t("profile.title")}</Text>
          <CloseButton onPress={() => router.back()} />
        </View>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={
                theme === "dark" ? darkTheme.textColor : lightTheme.textColor
              }
            />
            <Text style={styles.loadingText}>{t("common.loading")}</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <View style={styles.formContainer}>
            {/* Editable form fields */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>{t("profile.username")}</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder={t("profile.usernameLabel")}
                placeholderTextColor={theme === "dark" ? "#777" : "#999"}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t("profile.email")}</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder={t("profile.emailLabel")}
                placeholderTextColor={theme === "dark" ? "#777" : "#999"}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Save Button - only visible when changes are made */}
            {hasChanges && (
              <PrimaryButton
                title={t("profile.saveChanges")}
                onPress={handleSaveChanges}
                loading={isSaving}
              />
            )}

            {/* Change Password Button */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>{t("profile.password")}</Text>
              <TouchableOpacity
                style={styles.changePasswordButton}
                onPress={handleChangePassword}
              >
                <Text style={styles.changePasswordButtonText}>
                  {t("profile.changePassword.button")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Spacer to push delete button to bottom */}
        <View style={styles.spacer} />

        {/* Delete Account Button moved to bottom */}
        <TouchableOpacity
          style={[
            styles.deleteButtonContainer,
            {
              backgroundColor:
                theme === "dark"
                  ? darkTheme.surfaceBlackColor
                  : lightTheme.surfaceWhiteColor,
            },
          ]}
          onPress={handleDeleteAccount}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={darkTheme.errorTextColor} />
          ) : (
            <Text style={styles.deleteButtonText}>
              {t("profile.deleteAccount.button")}
            </Text>
          )}
        </TouchableOpacity>

        {/* Dialog Modal */}
        <DialogModal
          visible={dialogVisible}
          onClose={() => setDialogVisible(false)}
          title={dialogConfig.title}
          message={dialogConfig.message}
          isConfirmation={dialogConfig.isConfirmation}
          confirmButtonText={dialogConfig.confirmButtonText}
          cancelButtonText={dialogConfig.cancelButtonText}
          onConfirm={dialogConfig.onConfirm}
          onCancel={dialogConfig.onCancel}
          destructiveConfirm={dialogConfig.destructiveConfirm}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        theme === "dark"
          ? darkTheme.backgroundColor
          : lightTheme.backgroundColor,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: horizontalScale(20),
      paddingTop: verticalScale(40),
      paddingBottom: verticalScale(10),
      borderBottomWidth: 1,
      borderBottomColor:
        theme === "dark" ? darkTheme.borderColor : lightTheme.borderColor,
    },
    headerTitle: {
      fontSize: horizontalScale(20),
      fontFamily: "Bold",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: verticalScale(10),
      fontSize: horizontalScale(16),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      fontFamily: "Regular",
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: horizontalScale(20),
    },
    errorText: {
      fontSize: horizontalScale(16),
      color:
        theme === "dark" ? darkTheme.errorTextColor : lightTheme.errorTextColor,
      textAlign: "center",
      fontFamily: "Regular",
    },
    formContainer: {
      flex: 1,
      paddingHorizontal: horizontalScale(20),
      paddingTop: verticalScale(20),
    },
    formGroup: {
      marginBottom: verticalScale(20),
    },
    label: {
      fontSize: horizontalScale(14),
      marginBottom: verticalScale(12),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      fontFamily: "Regular",
    },
    input: {
      backgroundColor:
        theme === "dark"
          ? darkTheme.surfaceBlackColor
          : lightTheme.surfaceWhiteColor,
      borderRadius: horizontalScale(12),
      padding: horizontalScale(12),
      fontSize: horizontalScale(16),
      fontFamily: "Regular",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    changePasswordButton: {
      paddingVertical: verticalScale(10),
      backgroundColor:
        theme === "dark"
          ? darkTheme.surfaceBlackColor
          : lightTheme.surfaceWhiteColor,
      borderRadius: horizontalScale(12),
      alignItems: "center",
    },
    changePasswordButtonText: {
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      fontSize: horizontalScale(16),
      fontFamily: "Medium",
    },
    spacer: {
      flex: 1,
    },
    deleteButtonContainer: {
      width: horizontalScale(320),
      height: verticalScale(50),
      borderRadius: horizontalScale(12),
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
      marginBottom: verticalScale(50),
    },
    deleteButtonText: {
      color: "#FF3B30",
      fontFamily: "Medium",
      fontSize: horizontalScale(16),
    },
  });
