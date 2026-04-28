import { StyleSheet, Platform, StatusBar } from "react-native";

export default StyleSheet.create({
  pageHeaderContainer: {
    backgroundColor: "#8E48BB",
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 16,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,

    // 🔥 rounded bottom (modern feel)
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },

  pageHeaderText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#fff",

    // 🔥 spacing
    letterSpacing: 0.5,
  },

  heading: {
    fontSize: 12,
    fontWeight: "500",
    color: "#111827",

    // 🔥 better readability
    letterSpacing: 0.3,
    marginBottom: 4,
  },
});
