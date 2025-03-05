import { Tabs } from 'expo-router'
import React from 'react'
import { Platform } from 'react-native'

import { IconSymbol } from '@/components/ui/IconSymbol'
import TabBarBackground from '@/components/ui/TabBarBackground'
import { useTheme } from '@/hooks/useTheme'

export default function TabLayout() {
  const { isDark } = useTheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? '#0A84FF' : '#007AFF',
        tabBarInactiveTintColor: isDark
          ? 'rgba(255, 255, 255, 0.5)'
          : 'rgba(0, 0, 0, 0.5)',
        headerShown: false,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: isDark
              ? 'rgba(0, 0, 0, 0.5)'
              : 'rgba(255, 255, 255, 0.5)',
            borderTopColor: isDark
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.1)',
          },
          default: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
            borderTopColor: isDark
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.1)',
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '创作中心',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="wand.and.stars" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '个人中心',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
