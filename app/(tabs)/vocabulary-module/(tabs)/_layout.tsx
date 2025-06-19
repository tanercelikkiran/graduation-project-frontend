import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationOptions,
  MaterialTopTabNavigationEventMap,
} from "@react-navigation/material-top-tabs";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { withLayoutContext } from "expo-router";
import { VocabularyStatsProvider } from "@/contexts/VocabularyStatsContext";
import { VocabularyListProvider } from "@/contexts/VocabularyListContext";

const { Navigator: TopTabNavigator } = createMaterialTopTabNavigator();

const Tabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof TopTabNavigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(TopTabNavigator);

export default function VocabularyLayout() {
  return (
    <VocabularyListProvider>
      <VocabularyStatsProvider>
        <Tabs
          screenOptions={{
            tabBarStyle: { display: "none" }, // Sekmeleri gizle
            swipeEnabled: true, // Kaydırma özelliğini aktif et
          }}
        >
          <Tabs.Screen name="home" />
          <Tabs.Screen name="saved-vocabularies" />
          <Tabs.Screen name="create-vocabulary" />
        </Tabs>
      </VocabularyStatsProvider>
    </VocabularyListProvider>
  );
}
