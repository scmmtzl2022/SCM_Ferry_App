import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";

const SplashScreen = () => {
  return (
    <View style={SplashScreenStyle.mainWrapper}>
      <ActivityIndicator size="large" color="#034c0" />
    </View>
  );
};
const SplashScreenStyle = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
});
export default SplashScreen;
