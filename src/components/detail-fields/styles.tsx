import { StyleSheet } from "react-native";

export const detailFieldStyles = StyleSheet.create({
  container: {
    minHeight: 60,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  contentContainer: {
    flex: 1.2,
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 4,
  },
  label: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: "right",
    flexShrink: 1,
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
