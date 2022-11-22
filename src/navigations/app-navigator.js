import * as React from "react";

export default function AppNavigator() {

  return (
    <Drawer.Navigator
      drawerContent={(props) => <SideBar {...props} />}
      screenOptions={headerOption}
    >
      <Drawer.Screen
        name="MapView"
        component={MapView}
        options={{ headerShown: true, title: "MapView" }}
      />
    </Drawer.Navigator>
  );
}
