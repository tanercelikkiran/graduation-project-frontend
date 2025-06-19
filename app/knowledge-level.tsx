import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import LevelIllustrationLight from '../assets/illustrations/Level Illustration Light.svg';
import LevelIllustrationDark from '../assets/illustrations/Level Illustration Dark.svg';

import BottomSheet from '@/components/BottomSheet';
import CustomButton from '@/components/CustomButton';
import OrSeparator from '@/components/OrSeparator';

export default function LanguageLevelScreen(): JSX.Element {
  const [showLevels, setShowLevels] = useState<boolean>(false);

  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Function to open the level selection popup
  const openLevels = (): void => {
    setShowLevels(true);
  };

  // Function to close the level selection popup
  const closeLevels = (): void => {
    setShowLevels(false);
  };

  // Function to select or deselect a language level
  const handleLevelSelect = (level: string): void => {
    setSelectedLevel((prevLevel) => (prevLevel === level ? null : level)); // Toggle selection
  };

  // Function to toggle theme
  const toggleTheme = (): void => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Back Button to navigate to the previous screen */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={isDarkMode ? 'white' : 'black'} />
      </TouchableOpacity>

      {/* Theme Toggle Button */}
      <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
        <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={24} color={isDarkMode ? 'white' : 'black'} />
      </TouchableOpacity>

      {/* Header text */}
      <Text style={[styles.header, isDarkMode && styles.darkHeader]}>
        Do you already know your level?
      </Text>

      { !isDarkMode && <LevelIllustrationLight style={styles.illustration} /> }
      { isDarkMode && <LevelIllustrationDark style={styles.illustration} /> }

      {/* Button to open level selection popup */}
      <TouchableOpacity style={[styles.primaryButton, isDarkMode && styles.darkPrimaryButton]} onPress={openLevels}>
        <Text style={styles.primaryButtonText}>Choose your level</Text>
      </TouchableOpacity>

      {/* OR Separator */}
      <OrSeparator theme={isDarkMode ? 'dark' : 'light'} />

      {/* Button for a screening test */}
      <TouchableOpacity style={[styles.secondaryButton, isDarkMode && styles.darkSecondaryButton]} onPress={() => {}}>
        <Text style={[styles.secondaryButtonText, isDarkMode && styles.darkSecondaryButtonText]}>Take a screening test</Text>
      </TouchableOpacity>

      {/* Level selection popup */}
      <BottomSheet
        visible={showLevels}
        onClose={closeLevels}
        title="Your Level"
        theme={isDarkMode ? 'dark' : 'light'}
      >
        {['A1 - Beginning', 'A2 - Elementary', 'B1 - Intermediate', 'B2 - Upper intermediate', 'C1 - Advanced'].map(
          (level, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.levelOption,
                selectedLevel === level && {
                  backgroundColor: isDarkMode ? 'rgba(0, 123, 255, 0.3)' : 'rgba(0, 123, 255, 0.1)',
                },
              ]}
              onPress={() => handleLevelSelect(level)}
            >
              <Text
                style={[
                  styles.levelText,
                  selectedLevel === level && { color: '#007BFF', fontFamily: 'Semibold' },
                  isDarkMode && styles.darkLevelText,
                ]}
              >
                {level}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={24}
                color={selectedLevel === level ? '#007BFF' : isDarkMode ? 'white' : 'black'}
              />
            </TouchableOpacity>
          )
        )}
        <CustomButton title={'Continue'} onPress={function (): void {
              router.navigate('./pyramids');
              } }>
        </CustomButton>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
    backgroundColor: '#fff',
    overflow: 'visible',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 10,
  },
  themeButton: {
    position: 'absolute',
    top: 20,
    right: 10,
  },
  header: {
    fontSize: 24,
    fontFamily: 'Medium',
    marginBottom: 20,
    alignSelf: 'center',
    color: '#000',
  },
  darkHeader: {
    color: '#fff',
  },
  illustration: {
    marginBottom: 20,
    alignSelf: 'center',
    overflow: 'visible',
    backgroundColor: 'transparent', 
    elevation: 5
  },
  primaryButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  darkPrimaryButton: {
    backgroundColor: '#0056b3',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Semibold',
  },
  secondaryButton: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  darkSecondaryButton: {
    backgroundColor: '#333',
    borderColor: '#555',
  },
  secondaryButtonText: {
    color: '#000',
    fontSize: 20,
    fontFamily: 'Semibold',
  },
  darkSecondaryButtonText: {
    color: '#fff',
  },
  levelOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  levelText: {
    fontSize: 20,
    fontFamily: 'Regular',
    color: '#000',
  },
  darkLevelText: {
    color: '#fff',
  },
});
