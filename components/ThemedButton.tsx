import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EnglishIcon from '../assets/flags/England Sign.svg';
import SpanishIcon from '../assets/flags/Spain Sign.svg';
import TurkishIcon from '../assets/flags/Turkey Sign.svg';

interface CustomButtonProps {
  text: string;
  icon?: keyof typeof Ionicons.glyphMap; // Geçerli Ionicons adlarını kullanır
  whichIcon?: 'english' | 'spanish' | 'turkish';
  onPress: () => void;
  theme?: 'theme1' | 'theme2' | 'theme3';
  backgroundColor?: string; // Background color override
}

export default function ThemedButton({
  text,
  icon,
  whichIcon,
  onPress,
  theme = 'theme1',
  backgroundColor,
}: CustomButtonProps): JSX.Element {
  const getBackgroundColor = (defaultColor: string) => {
    return backgroundColor || defaultColor;
  };

  if (theme === 'theme1') {
    return (
      <TouchableOpacity
        style={[styles.button, { backgroundColor: getBackgroundColor('#007BFF') }]}
        onPress={onPress}
      >
        {icon && (
          <Ionicons name={icon} size={24} color="white" style={styles.iconTheme1} />
        )}
        <Text style={[styles.text, styles.theme1Text]}>{text}</Text>
      </TouchableOpacity>
    );
  } else if (theme === 'theme2') {
    return (
      <TouchableOpacity
        style={[styles.button, styles.theme2ModifiedButton, { backgroundColor: getBackgroundColor('#F9F9F9') }]}
        onPress={onPress}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color="black" style={styles.iconTheme2Modified} />
        </View>
        <Text style={[styles.text, styles.theme2TextModified]}>{text}</Text>
      </TouchableOpacity>
    );
  } else if (theme === 'theme3') {
    return (
      <TouchableOpacity
        style={[styles.button, styles.theme3Button, { backgroundColor: getBackgroundColor('#F9F9F9') }]}
        onPress={onPress}>
        {whichIcon === 'english' && <EnglishIcon width={64} height={40} />}
        {whichIcon === 'spanish' && <SpanishIcon width={64} height={40} />}
        {whichIcon === 'turkish' && <TurkishIcon width={64} height={40} />}
        <View style={styles.textContainer}>
          <Text style={[styles.text, styles.theme3Text]}>{text}</Text>
        </View>
        <Ionicons name="arrow-forward" size={24} color="#000" style={styles.arrowIcon} />
      </TouchableOpacity>
    );
  }

  return <></>;
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  theme1Button: {
    backgroundColor: '#007BFF',
  },
  theme2ModifiedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginVertical: 5,
  },
  theme3Button: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  text: {
    fontSize: 18,
    fontFamily: 'Medium',
  },
  theme1Text: {
    color: 'white',
  },
  theme2TextModified: {
    width: '90%',
    color: 'black',
    marginLeft: 10,
  },
  theme3Text: {
    color: 'black',
    marginLeft: 10,
  },
  iconTheme1: {
    marginRight: 8,
    color: 'white',
  },
  iconTheme2Modified: {
    color: 'black',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  arrowIcon: {
    marginLeft: 10,
  },
});
