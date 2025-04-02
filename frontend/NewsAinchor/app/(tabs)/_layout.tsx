import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      initialRouteName='index'
      screenOptions={{
      tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      headerShown: false,
      tabBarButton: HapticTab,
      tabBarBackground: TabBarBackground,
      tabBarStyle: Platform.select({
        ios: {
        // Use a transparent background on iOS to show the blur effect
        position: 'absolute',
        },
        default: {},
      }),
      }}>
      <Tabs.Screen
      name="Anchor"
      options={{
        title: 'Anchor',
        tabBarIcon: ({ color }: { color: string }) => <IconSymbol size={28} name="videocamera.fill" color={color} />,
      }}
      />
      <Tabs.Screen
      name="index"
      options={{
        title: 'News',
        tabBarIcon: ({ color }: { color: string }) => <IconSymbol size={28} name="house.fill" color={color} />,
      }}
      />
      <Tabs.Screen
      name="settings"
      options={{
        title: 'Settings',
        tabBarIcon: ({ color }: { color: string }) => <IconSymbol size={28} name="settings.fill" color={color} />,
      }}
      />
    </Tabs>
  );
}
