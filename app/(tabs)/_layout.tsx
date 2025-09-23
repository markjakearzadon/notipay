import { Image } from "expo-image";
import { Tabs } from "expo-router";

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
	    <Tabs.Screen
		name="index"
		options={{
		    title: "Home",
		    tabBarIcon: ({ color }) => (
			<Image
			    source={bahay}
			    contentFit="contain"
			    style={{
				width: 28,
				height: 28,
				tintColor: color,
			    }}
			/>
		    ),
		}}
	    />
	    {/* make the icon big when it is active */}

	    <Tabs.Screen
		name="unpaiddues"
		options={{
		    title: "Dues",
		    tabBarIcon: ({ color, focused }) => (
			<Image
			    source={pera}
			    contentFit="contain"
			    style={{
				width: 28,
				height: 28,
				tintColor: color,
			    }}
			/>
		    ),
		}}
	    />

	    <Tabs.Screen
		name="notification"
		options={{
		    title: "Notification",
		    tabBarIcon: ({ color }) => (
			<Image
			    source={bell}
			    contentFit="contain"
			    style={{
				width: 28,
				height: 28,
				tintColor: color,
			    }}
			/>
		    ),
		}}
	    />
	    <Tabs.Screen
		name="pay"
		options={{
		    href: null, // This removes it from the tab bar
		    tabBarStyle: { display: "none" }, // optional: hide bar entirely when on pay
		}}
	    />
	    <Tabs.Screen
		name="wallet"
		options={{
		    href: null, // This removes it from the tab bar
		    tabBarStyle: { display: "none" }, // optional: hide bar entirely when on pay
		}}
	    />

	</Tabs>
    );
}
