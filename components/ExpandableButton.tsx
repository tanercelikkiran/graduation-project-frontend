import React, { useState, useRef, ReactNode } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";

interface ExpandableButtonProps {
  children: ReactNode;
}

export default function ExpandableButton({ children }: ExpandableButtonProps): JSX.Element {
  const [expanded, setExpanded] = useState<boolean>(false);
  const animation = useRef<Animated.Value>(new Animated.Value(0)).current;

  const toggleExpand = () => {
    Animated.timing(animation, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  const heightInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200], // Adjust height when expanded
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={toggleExpand}>
        <Text style={styles.buttonText}>{expanded ? "Hide Content" : "Show Content"}</Text>
      </TouchableOpacity>

      <Animated.View style={[styles.contentContainer, { height: heightInterpolate }]}>
        {expanded && <View style={styles.content}>{children}</View>}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  contentContainer: {
    overflow: "hidden",
    width: 250,
    marginTop: 10,
  },
  content: {
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 8,
  },
});
