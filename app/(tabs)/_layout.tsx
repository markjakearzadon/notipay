import { Image } from "expo-image";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; 

import bell from "@/assets/images/bell-solid-full.png";
import bahay from "@/assets/images/house-solid-full.png";
import pera from "@/assets/images/money-bills-solid-full.png";

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
      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={bahay}
              contentFit="contain"
              style={{
                width: focused ? 32 : 26,
                height: focused ? 32 : 26,
                tintColor: color,
              }}
            />
          ),
        }}
      />

      {/* DUES */}
      <Tabs.Screen
        name="unpaiddues"
        options={{
          title: "Dues",
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={pera}
              contentFit="contain"
              style={{
                width: focused ? 32 : 26,
                height: focused ? 32 : 26,
                tintColor: color,
              }}
            />
          ),
        }}
      />

      {/* NOTIFICATIONS */}
      <Tabs.Screen
        name="notification"
        options={{
          title: "Notification",
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={bell}
              contentFit="contain"
              style={{
                width: focused ? 30 : 26,
                height: focused ? 30 : 26,
                tintColor: color,
              }}
            />
          ),
        }}
      />

      {/* PAY (hidden from tab bar) */}
      <Tabs.Screen
        name="pay"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      {/* WALLET (hidden) */}
      <Tabs.Screen
        name="wallet"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      {/* RECEIPT (hidden) */}
      <Tabs.Screen
        name="receipt"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      {/* ✅ NEW: PROFILE TAB */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person-circle" : "person-circle-outline"}
              size={focused ? 32 : 26}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
