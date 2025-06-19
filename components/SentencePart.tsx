import { StyleSheet, Text, TouchableOpacity } from "react-native";

type SentencePartProps = {
  title: string;
  isSelected: boolean;
  onSelect: () => void;
};

export default function SentencePart({ title, isSelected, onSelect }: SentencePartProps) {
  return (
    <TouchableOpacity 
      style={[styles.part, isSelected && styles.selectedPart]} 
      onPress={onSelect} 
      disabled={isSelected}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  part: {
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    minWidth: 50,
  },
  selectedPart: {
    backgroundColor: "#E5F2FF",
  },
  text: {
    fontSize: 32,
    fontFamily: "Regular",
  },
});