import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import SentencePart from "@/components/SentencePart";
import SpacePart from "@/components/SpacePart";
import Options from "@/components/OptionButton";

type SentenceProps = {
  sentencePartList: string[];
  spaceOptions: string[][];
};

export default function Sentence({ sentencePartList, spaceOptions }: SentenceProps) {
  const [selectedSpaceIndex, setSelectedSpaceIndex] = useState<number | null>(null);
  const [spaceTexts, setSpaceTexts] = useState<(string | null)[]>(Array(sentencePartList.length - 1).fill(null));

  const handleOptionSelect = (option: string) => {
    if (selectedSpaceIndex !== null) {
      const updatedTexts = [...spaceTexts];
      updatedTexts[selectedSpaceIndex] = option;
      setSpaceTexts(updatedTexts);
      setSelectedSpaceIndex(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Sentence */}
      <View style={styles.sentenceContainer}>
        {sentencePartList.map((part, index) => (
          <View key={index} style={styles.row}>
            <SentencePart title={part} isSelected={false} onSelect={() => {}} />
            {index < sentencePartList.length - 1 && (
              <SpacePart
                isSelected={selectedSpaceIndex === index}
                onSelect={() => setSelectedSpaceIndex(index)}
                selectedText={spaceTexts[index]}
              />
            )}
          </View>
        ))}
      </View>

      {/* Options */}
      {selectedSpaceIndex !== null && (
        <Options
          options={spaceOptions[selectedSpaceIndex]}
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
  row: {
    flexDirection: "row",
    alignItems: "center",
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
