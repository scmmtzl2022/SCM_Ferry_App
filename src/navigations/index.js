import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import react from "react";
import AuthNavigator from "./auth-navigator";

export default function AppContainer() {
  return (
    <NavigationContainer>
      <AuthNavigator />
    </NavigationContainer>
  );
}
