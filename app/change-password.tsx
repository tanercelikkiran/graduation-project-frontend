import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthenticationContext";
import { useScale } from "@/hooks/useScale";
import axios from "axios";
import { useNavigationBar } from "@/hooks/useNavigationBar";
import CloseButton from "@/components/CloseButton";
import PrimaryButton from "@/components/PrimaryButton";
import ShowPasswordIconLight from "@/assets/icons/Show Password Light.svg";
import HidePasswordIconLight from "@/assets/icons/Hide Password Light.svg";
import ShowPasswordIconDark from "@/assets/icons/Show Password Dark.svg";
import HidePasswordIconDark from "@/assets/icons/Hide Password Dark.svg";

export default function ChangePasswordScreen() {
  // Ensure navigation bar stays hidden during password change
  useNavigationBar();

  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { token, refreshToken, logout } = useAuth();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { horizontalScale, verticalScale } = useScale();

  const styles = createStyles(theme, horizontalScale, verticalScale);

  const toggleOldPasswordVisibility = () => {
    setShowOldPassword(!showOldPassword);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validatePassword = (password: string): string[] => {
    const errors = [];

    if (password.length < 8) {
      errors.push(t("auth.createPassword.requirements.length"));
    }

    if (!/[A-Z]/.test(password)) {
      errors.push(t("auth.createPassword.requirements.uppercase"));
    }

    if (!/[a-z]/.test(password)) {
      errors.push(t("auth.createPassword.requirements.lowercase"));
    }

    if (!/\d/.test(password)) {
      errors.push(t("auth.createPassword.requirements.number"));
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push(t("auth.createPassword.requirements.special"));
    }

    return errors;
  };

  const translateErrorMessage = (errorDetail: string): string => {
    if (errorDetail.includes("incorrect") || errorDetail.includes("yanlış")) {
      return t("profile.changePassword.error.oldPasswordIncorrect");
    } else if (
      errorDetail.includes("match") ||
      errorDetail.includes("eşleşmiyor")
    ) {
      return t("profile.changePassword.error.passwordsDontMatch");
    } else if (
      errorDetail.includes("user not found") ||
      errorDetail.includes("kullanıcı bulunamadı")
    ) {
      return t("profile.changePassword.error.userNotFound");
    } else if (
      errorDetail.includes("expired") ||
      errorDetail.includes("süresi doldu")
    ) {
      return t("profile.changePassword.error.sessionExpired");
    } else if (
      errorDetail.includes("requirements") ||
      errorDetail.includes("gereksinimleri")
    ) {
      return (
        t("profile.changePassword.error.requirements") +
        t("auth.createPassword.requirements.full")
      );
    }
    return errorDetail;
  };

  const handleSave = async () => {
    if (!oldPassword) {
      Alert.alert(
        t("profile.changePassword.error.title"),
        t("auth.passwordRequired")
      );
      return;
    }

    if (!newPassword) {
      Alert.alert(
        t("profile.changePassword.error.title"),
        t("auth.passwordRequired")
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        t("profile.changePassword.error.title"),
        t("profile.changePassword.error.passwordsDontMatch")
      );
      return;
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      Alert.alert(
        t("profile.changePassword.error.title"),
        t("profile.changePassword.error.requirements") +
          passwordErrors.join(", ")
      );
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;

      const response = await axios.post(
        `${apiUrl}/user/change-password`,
        {
          current_password: oldPassword,
          new_password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept-Language": i18n.language || "en",
          },
        }
      );

      Alert.alert(
        t("profile.changePassword.success.title"),
        t("profile.changePassword.success.message"),
        [
          {
            text: t("common.ok"),
            onPress: async () => {
              await logout();
              router.replace("/login");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error changing password:", error);

      let errorMessage = t("profile.changePassword.error.default");

      if (axios.isAxiosError(error) && error.response) {
        const statusCode = error.response.status;
        const errorDetail = error.response.data?.detail;

        if (statusCode === 400 && errorDetail) {
          errorMessage = translateErrorMessage(errorDetail);
        } else if (statusCode === 401) {
          const refreshed = await refreshToken();
          if (refreshed) {
            handleSave();
            return;
          } else {
            errorMessage = t("profile.changePassword.error.sessionExpired");
          }
        } else if (statusCode === 404) {
          errorMessage = t("profile.changePassword.error.userNotFound");
        }
      }

      Alert.alert(t("profile.changePassword.error.title"), errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {t("profile.changePassword.title")}
          </Text>
          <CloseButton onPress={() => router.back()} />
        </View>

        <View style={styles.divider} />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {t("profile.changePassword.oldPassword")}
              </Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  placeholder={t(
                    "profile.changePassword.oldPasswordPlaceholder"
                  )}
                  placeholderTextColor={
                    theme === "dark"
                      ? darkTheme.bodySecondaryColor
                      : lightTheme.bodySecondaryColor
                  }
                  secureTextEntry={!showOldPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIconContainer}
                  onPress={toggleOldPasswordVisibility}
                >
                  {showOldPassword ? (
                    theme === "dark" ? (
                      <HidePasswordIconDark
                        width={horizontalScale(20)}
                        height={verticalScale(20)}
                      />
                    ) : (
                      <HidePasswordIconLight
                        width={horizontalScale(20)}
                        height={verticalScale(20)}
                      />
                    )
                  ) : theme === "dark" ? (
                    <ShowPasswordIconDark
                      width={horizontalScale(20)}
                      height={verticalScale(20)}
                    />
                  ) : (
                    <ShowPasswordIconLight
                      width={horizontalScale(20)}
                      height={verticalScale(20)}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {t("profile.changePassword.newPassword")}
              </Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder={t(
                    "profile.changePassword.newPasswordPlaceholder"
                  )}
                  placeholderTextColor={
                    theme === "dark"
                      ? darkTheme.bodySecondaryColor
                      : lightTheme.bodySecondaryColor
                  }
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIconContainer}
                  onPress={toggleNewPasswordVisibility}
                >
                  {showNewPassword ? (
                    theme === "dark" ? (
                      <HidePasswordIconDark
                        width={horizontalScale(20)}
                        height={verticalScale(20)}
                      />
                    ) : (
                      <HidePasswordIconLight
                        width={horizontalScale(20)}
                        height={verticalScale(20)}
                      />
                    )
                  ) : theme === "dark" ? (
                    <ShowPasswordIconDark
                      width={horizontalScale(20)}
                      height={verticalScale(20)}
                    />
                  ) : (
                    <ShowPasswordIconLight
                      width={horizontalScale(20)}
                      height={verticalScale(20)}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {t("profile.changePassword.confirmPassword")}
              </Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder={t(
                    "profile.changePassword.confirmPasswordPlaceholder"
                  )}
                  placeholderTextColor={
                    theme === "dark"
                      ? darkTheme.bodySecondaryColor
                      : lightTheme.bodySecondaryColor
                  }
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIconContainer}
                  onPress={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? (
                    theme === "dark" ? (
                      <HidePasswordIconDark
                        width={horizontalScale(20)}
                        height={verticalScale(20)}
                      />
                    ) : (
                      <HidePasswordIconLight
                        width={horizontalScale(20)}
                        height={verticalScale(20)}
                      />
                    )
                  ) : theme === "dark" ? (
                    <ShowPasswordIconDark
                      width={horizontalScale(20)}
                      height={verticalScale(20)}
                    />
                  ) : (
                    <ShowPasswordIconLight
                      width={horizontalScale(20)}
                      height={verticalScale(20)}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={t("profile.changePassword.button")}
            onPress={handleSave}
            disabled={isLoading}
          />
        </View>
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
    divider: {
      height: 1,
      backgroundColor:
        theme === "dark" ? darkTheme.borderColor : lightTheme.borderColor,
      marginBottom: verticalScale(15),
    },
    formContainer: {
      paddingHorizontal: horizontalScale(16),
      paddingBottom: verticalScale(20),
    },
    formGroup: {
      marginBottom: verticalScale(16),
    },
    label: {
      fontFamily: "Regular",
      fontSize: verticalScale(14),
      marginBottom: verticalScale(6),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    passwordInputContainer: {
      flexDirection: "row",
      width: "100%",
      height: verticalScale(50),
      borderWidth: 1,
      borderColor: theme === "dark" ? darkTheme.borderColor : "#F2F2F2",
      borderRadius: horizontalScale(12),
      backgroundColor:
        theme === "dark" ? darkTheme.surfaceBlackColor : "#F9F9F9",
      alignItems: "center",
    },
    passwordInput: {
      flex: 1,
      height: "100%",
      paddingHorizontal: horizontalScale(16),
      fontSize: horizontalScale(16),
      fontFamily: "Regular",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    eyeIconContainer: {
      paddingHorizontal: horizontalScale(10),
      height: "100%",
      justifyContent: "center",
    },
    eyeIcon: {
      fontSize: horizontalScale(16),
    },
    buttonContainer: {
      paddingHorizontal: horizontalScale(16),
      paddingBottom: verticalScale(30),
      paddingTop: verticalScale(10),
      backgroundColor:
        theme === "dark"
          ? darkTheme.backgroundColor
          : lightTheme.backgroundColor,
    },
    saveButton: {
      backgroundColor: theme === "dark" ? "#262626" : "#F2F2F2",
      height: verticalScale(50),
      justifyContent: "center",
      alignItems: "center",
      borderRadius: horizontalScale(10),
      width: "100%",
    },
    saveButtonDisabled: {
      opacity: 0.7,
    },
    saveButtonText: {
      color: "#007AFF",
      fontSize: horizontalScale(16),
      fontFamily: "Medium",
      fontWeight: "500",
    },
  });
