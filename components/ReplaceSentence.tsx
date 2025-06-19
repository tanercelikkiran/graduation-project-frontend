import { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import SentencePart from "./SentencePart";
import Options from "./OptionButton";

type SentenceProps = {
  sentencePartList: string[];
  options: string[];
};

export default function Sentence({ sentencePartList: parts, options }: SentenceProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [currentParts, setCurrentParts] = useState<string[]>(parts);

  const handleOptionSelect = (option: string) => {
    if (selectedIndex !== null) {
      const updatedParts = [...currentParts];
      updatedParts[selectedIndex] = option;
      setCurrentParts(updatedParts);
      setSelectedIndex(null); // Seçim sonrası indeksi sıfırla
    }
  };

  return (
    <View style={styles.container}>
      {/* Sentence */}
      <View style={styles.sentenceContainer}>
        {currentParts.map((part, index) => (
          <SentencePart
            key={index}
            title={part}
            isSelected={selectedIndex === index}
            onSelect={() => setSelectedIndex(index)}
          />
        ))}
      </View>

      {/* Options */}
      {selectedIndex !== null && (
        <Options
          options={options}
          onOptionSelect={handleOptionSelect}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
  },
  sentenceContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  option: {
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#e0f7fa",
    alignItems: "center",
    minWidth: 80,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00796b",
    textAlign: "center",
  },
});
