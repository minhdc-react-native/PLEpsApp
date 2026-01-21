import { StyleSheet } from "react-native";

export const detailFieldStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
    flex: 1,
  },
  contentContainer: {
    flexDirection: "column",
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: "gray",
    marginBottom: 8,
  },
  text: {
    color: "black",
    lineHeight: 20,
  },
  textError: {
    color: "red",
    lineHeight: 20,
    fontStyle: "italic",
  },
  description: {
    color: "black",
  },
});
