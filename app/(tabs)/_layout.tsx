import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface TabConfig {
  name: string;
  title: string;
  icon: IoniconsName;
  activeIcon: IoniconsName;
}

const tabs: TabConfig[] = [
  {
    name: "index",
    title: "Home",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    name: "items",
    title: "Items",
    icon: "cube-outline",
    activeIcon: "cube",
  },
  {
    name: "warehouses",
    title: "Warehouses",
    icon: "business-outline",
    activeIcon: "business",
  },
  {
    name: "transactions",
    title: "Transactions",
    icon: "swap-horizontal-outline",
    activeIcon: "swap-horizontal",
  },
  {
    name: "profile",
    title: "Profile",
    icon: "person-outline",
    activeIcon: "person",
  },
];

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#94A3B8",

        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E2E8F0",
          //   borderTopWidth: 1,
          //   height: 64,
          height: Platform.OS === "ios" ? 78 : 55,
          paddingTop: 5,
          position: "absolute",
          borderRadius: 50,
          marginBottom:
            Platform.OS === "ios" ? 20 : Math.max(insets.bottom, 20),
          marginLeft: 5,
          marginRight: 5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: "Inter_500Medium",
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? tab.activeIcon : tab.icon}
                size={24}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
