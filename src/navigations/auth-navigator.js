import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/Login/login";
import DriverLogin from "../screens/Login/DriverLogin";
import AppNavigator from "./app-navigator";
import { AuthContext } from "../hooks/context/Context";
import { useContext } from "react";
import SplashScreen from "../screens/Splash/SplashScreen";
import BusStopList from "../screens/Login/BusStopList";
import UserProfileScreen from "../screens/Login/userProfile";
import MapView from "../screens/Login/MapView";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  const { userInfo, splashLoading } = useContext(AuthContext);
  function UserProfileScreen() {
    return (
      <Tab.Navigator tabBarPosition="top">
        <Tab.Screen name="List" component={BusStopList} />
        <Tab.Screen name="Map" component={MapView} />
      </Tab.Navigator>
    );
  }
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
            name="UserProfile"
            component={UserProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BusStopList"
            component={BusStopList}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MapView"
            component={MapView}
            options={{ headerShown:  false }}
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
