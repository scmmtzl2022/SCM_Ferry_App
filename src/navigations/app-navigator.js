import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UserProfileScreen from "../screens/Login/userProfile";
import BusStopList from "../screens/Login/BusStopList";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

export default function AppNavigator() {

  return (
    <Drawer.Navigator
      drawerContent={(props) => <SideBar {...props} />}
      screenOptions={headerOption}
    >
      {/* <Drawer.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ headerShown: true, title: "Profile" }}
      />
       <Drawer.Screen
        name="busStopList"
        component={BusStopList}
        options={{ headerShown: true, title: "List" }}
      /> */}
        <Drawer.Screen
        name="MapView"
        component={MapView}
        options={{ headerShown: true, title: "MapView" }}
      />
    </Drawer.Navigator>
  );
}
