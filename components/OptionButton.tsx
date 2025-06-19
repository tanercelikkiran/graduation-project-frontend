import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

type OptionsProps = {
  options: string[];
  onOptionSelect: (option: string) => void;
};

export default function Options({ options, onOptionSelect }: OptionsProps) {
  return (
    <View style={styles.optionsContainer}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={styles.option}
          onPress={() => onOptionSelect(option)}
        >
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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
