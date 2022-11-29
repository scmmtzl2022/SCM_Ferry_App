import * as React from "react";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/Login/login";
import DriverLogin from "../screens/Login/DriverLogin";
import { AuthContext } from "../hooks/context/Context";
import { useContext } from "react";
import SplashScreen from "../screens/Splash/SplashScreen";
import MapView from "../screens/Login/MapView";
import BusSchedule from "../screens/Login/BusSchedule";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  const { userInfo, splashLoading } = useContext(AuthContext);
  const Tab = createMaterialTopTabNavigator();
  return (
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
  );
}
