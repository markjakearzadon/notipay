import { Tabs } from "expo-router";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2b7fff",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          paddingBottom: 12,
          height: 60,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5
              name="home"
              size={focused ? 28 : 24} // bigger when active
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="unpaiddues"
        options={{
          title: "Dues",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5
              name="money-bill-wave"
              size={focused ? 28 : 24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="notification"
        options={{
          title: "Notification",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name="notifications"
              size={focused ? 28 : 24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5
              name="user-circle"
              size={focused ? 28 : 24}
              color={color}
            />
          ),
        }}
      />

      {/* Hidden screens */}
      <Tabs.Screen
        name="pay"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="receipt"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}
