import React from 'react';
import { Text, TouchableOpacity, StyleSheet, Image, ViewStyle } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  icon?: string | any;
  buttonColor?: string;
  textColor?: string;
  isBottom?: boolean;
  iconType?: 'default' | 'image';
  isBold?: boolean;
}

export default function CustomButton({
  title,
  onPress,
  icon,
  buttonColor = '#fff',
  textColor = '#000',
  isBottom = false,
  iconType = 'default',
  isBold = false,
}: CustomButtonProps) {
  const buttonStyle: ViewStyle[] = [
    styles.button,
    { backgroundColor: buttonColor },
    ...(isBottom ? [styles.bottomButton] : []),
  ];

  const textStyle = [
    styles.buttonText,
    { color: textColor },
    isBold && { fontFamily: 'Bold' },
  ];

  return (
    <TouchableOpacity 
      style={buttonStyle} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {iconType === 'image' ? (
        <Image source={icon} style={styles.icon} />
      ) : icon ? (
        <FontAwesome
          name={icon}
          size={24}
          style={[styles.buttonIcon, { color: textColor }]}
        />
      ) : null}
      <Text 
        style={textStyle}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 50,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginVertical: 5,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Medium',
    flexShrink: 1,
    flexGrow: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  bottomButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
    resizeMode: 'contain',
  },
});