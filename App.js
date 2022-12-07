import React from 'react';
import { StatusBar } from "react-native";
import Navigation from "./src/navigations/AuthNavigator";
import { AuthProvider } from "./src/context/AuthContext";

const App = () => {
  return (
    <AuthProvider>  
      <StatusBar backgroundColor="#06bcee" />
        <Navigation/>
    </AuthProvider>
  );
};

export default App;
