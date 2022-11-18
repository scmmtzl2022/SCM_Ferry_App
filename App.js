import { StatusBar, StyleSheet, Text, View } from "react-native";
import AppContainer from "./src/navigations";
import * as React from 'react'
import { AuthProvider } from "./src/hooks/provider/AuthProvider";

export default function App() {
  return (
    <AuthProvider>  
        <AppContainer />
    </AuthProvider>
  );
}
