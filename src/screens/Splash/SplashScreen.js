import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { WHITE, PRIMARY } from "../../utils/styles/colors";

const SplashScreen = () => {
  return (
    <View style={SplashScreenStyle.mainWrapper}>
      <ActivityIndicator size="large" color={PRIMARY} />
    </View>
  );
};
const SplashScreenStyle = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: { WHITE },
  },
});
export default SplashScreen;
