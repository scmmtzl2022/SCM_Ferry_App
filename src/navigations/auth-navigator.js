import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext } from "../context/AuthContext";
import LoginScreen from "../screens/login";
import DriverLogin from "../screens/DriverLogin";
import SplashScreen from "../screens/SplashScreen";
import MapView from "../screens/MapView";
import BusSchedule from "../screens/BusSchedule";

const Stack = createNativeStackNavigator();

const Navigation = ({}) => {
  const { userInfo, splashLoading } = useContext(AuthContext);
  return (
    <NavigationContainer>
    <Stack.Navigator>
      {splashLoading ? (
        <Stack.Screen
          name="Splash Screen"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
      ) : userInfo?.token ? (
        <>
          <Stack.Screen
            name="BusScheduleScreen"
            component={BusSchedule}
            options={{ headerShown: false }}
          />        
          <Stack.Screen
            name="MapView"
            component={MapView}
            options={{ headerShown: false }}
          />
        </>

      ) : (
        <>
          <Stack.Screen
            name="UserLogin"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="DriverLogin"
            component={DriverLogin}
            options={{ headerShown: false }}
          />          
          
        </>
      )}
    </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigation;