import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { darkTheme, lightTheme } from "@/themes/Themes";
import { Ionicons } from "@expo/vector-icons";
import { useScale } from "@/hooks/useScale";

interface DialogModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  // For information modals, only the confirmButton will be used
  isConfirmation?: boolean;
  confirmButtonText: string;
  cancelButtonText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  destructiveConfirm?: boolean; // For destructive actions like delete
  // Button customization props
  confirmButtonColor?: string;
  confirmButtonTextColor?: string;
  cancelButtonColor?: string;
  cancelButtonTextColor?: string;
}

const DialogModal = ({
  visible,
  onClose,
  title,
  message,
  isConfirmation = false,
  confirmButtonText,
  cancelButtonText,
  onConfirm,
  onCancel,
  destructiveConfirm = false,
  // Button customization props with defaults
  confirmButtonColor,
  confirmButtonTextColor,
  cancelButtonColor,
  cancelButtonTextColor,
}: DialogModalProps) => {
  const { theme } = useTheme();
  const { horizontalScale, verticalScale } = useScale();

  const styles = createStyles(
    theme,
    horizontalScale,
    verticalScale,
    confirmButtonColor,
    confirmButtonTextColor,
    cancelButtonColor,
    cancelButtonTextColor
  );

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            {!isConfirmation && (
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons
                  name="close"
                  size={horizontalScale(24)}
                  color={
                    theme === "dark" ? darkTheme.textColor : lightTheme.textColor
                  }
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.messageText}>{message}</Text>
          </View>

          <View style={styles.buttonContainer}>
            {isConfirmation && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>
                  {cancelButtonText || "Cancel"}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                destructiveConfirm && styles.destructiveButton,
              ]}
              onPress={handleConfirm}
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  destructiveConfirm && styles.destructiveButtonText,
                ]}
              >
                {confirmButtonText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (
  theme: string,
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number,
  confirmButtonColor?: string,
  confirmButtonTextColor?: string,
  cancelButtonColor?: string,
  cancelButtonTextColor?: string
) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: 
        theme === "dark" 
          ? darkTheme.transparentBackgroundColor 
          : lightTheme.transparentBackgroundColor,
    },
    modalContainer: {
      width: "80%",
      backgroundColor:
        theme === "dark"
          ? darkTheme.cardBackgroundColor
          : lightTheme.cardBackgroundColor,
      borderRadius: horizontalScale(16),
      overflow: "hidden",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: horizontalScale(16),
      paddingVertical: verticalScale(16),
      borderBottomWidth: 1,
      borderBottomColor:
        theme === "dark" ? darkTheme.borderColor : lightTheme.borderColor,
    },
    modalTitle: {
      fontSize: horizontalScale(18),
      fontFamily: "Bold",
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
    },
    closeButton: {
      padding: horizontalScale(4),
    },
    modalContent: {
      paddingHorizontal: horizontalScale(16),
      paddingVertical: verticalScale(20),
    },
    messageText: {
      fontSize: horizontalScale(16),
      fontFamily: "Regular",
      lineHeight: verticalScale(22),
      color: theme === "dark" ? darkTheme.textColor : lightTheme.textColor,
      textAlign: "center",
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "center",
      padding: horizontalScale(16),
      borderTopWidth: 1,
      borderTopColor:
        theme === "dark" ? darkTheme.borderColor : lightTheme.borderColor,
    },
    button: {
      paddingVertical: verticalScale(12),
      paddingHorizontal: horizontalScale(20),
      borderRadius: horizontalScale(8),
      marginHorizontal: horizontalScale(8),
      minWidth: horizontalScale(100),
      alignItems: "center",
    },
    cancelButton: {
      backgroundColor: cancelButtonColor || (
        theme === "dark"
          ? darkTheme.surfaceBlackColor
          : lightTheme.surfaceWhiteColor
      ),
    },
    confirmButton: {
      backgroundColor: confirmButtonColor || (
        theme === "dark" 
          ? darkTheme.primaryColor 
          : lightTheme.primaryColor
      ),
    },
    destructiveButton: {
      backgroundColor: theme === "dark" ? "#4D0000" : "#FFDDDD",
    },
    cancelButtonText: {
      color: cancelButtonTextColor || (
        theme === "dark" 
          ? darkTheme.textColor 
          : lightTheme.textColor
      ),
      fontFamily: "Medium",
      fontSize: horizontalScale(16),
    },
    confirmButtonText: {
      color: confirmButtonTextColor || "#FFFFFF",
      fontFamily: "Medium",
      fontSize: horizontalScale(16),
    },
    destructiveButtonText: {
      color: "#FF3B30",
    },
  });

export default DialogModal;