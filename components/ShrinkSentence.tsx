import { useState } from "react";
import { View, StyleSheet, Button } from "react-native";
import SentencePart from "./SentencePart";

type SentenceProps = {
  sentencePartList: string[];
  onUpdateParts: (newParts: string[]) => void;
};

export default function Sentence({ sentencePartList, onUpdateParts }: SentenceProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const toggleSelection = (index: number) => {
    setSelectedIndex((prev) => (prev === index ? null : index));
  };

  const deleteSelectedPart = () => {
    if (selectedIndex !== null) {
      const newParts = sentencePartList.filter((_, index) => index !== selectedIndex);
      onUpdateParts(newParts); // Güncellenmiş listeyi üst bileşene gönder
      setSelectedIndex(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sentenceContainer}>
        {sentencePartList.map((part, index) => (
          <SentencePart
            key={index}
            title={part}
            isSelected={selectedIndex === index}
            onSelect={() => toggleSelection(index)}
          />
        ))}
      </View>

      {selectedIndex !== null && (
        <Button title="Sil" onPress={deleteSelectedPart} color="red" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 10,
  },
  sentenceContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
});
