import { StyleSheet, Text, TouchableOpacity } from "react-native";

type SpacePartProps = {
  isSelected: boolean;
  onSelect: () => void;
  selectedText: string | null;
};

export default function SpacePart({ isSelected, onSelect, selectedText }: SpacePartProps) {
  return (
    <TouchableOpacity
      style={[styles.space, isSelected && styles.selectedSpace]}
      onPress={onSelect}
    >
      <Text style={styles.text}>{selectedText || "⠀"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  space: {
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: "#E5F2FF",
    alignItems: "center",
    minWidth: 50,
  },
  selectedSpace: {
    backgroundColor: "#007AFF",
  },
  text: {
    fontSize: 32,
    fontFamily: "Regular",
  },
});
