import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationOptions,
  MaterialTopTabNavigationEventMap,
} from "@react-navigation/material-top-tabs";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { withLayoutContext } from "expo-router";

const { Navigator: TopTabNavigator } = createMaterialTopTabNavigator();

const Tabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof TopTabNavigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(TopTabNavigator);

export default function PyramidLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { display: "none" }, // Sekmeleri gizle
        swipeEnabled: true, // Kaydırma özelliğini aktif et
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="saved-sentences" />
      <Tabs.Screen name="create-pyramid" />
    </Tabs>
  );
}
