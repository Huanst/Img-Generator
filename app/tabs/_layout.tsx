import { Tabs } from 'expo-router'
import React from 'react'
import { Platform } from 'react-native'
import { BlurView } from 'expo-blur'

import { IconSymbol } from '@/components/ui/IconSymbol'
import { useTheme } from '@/hooks/useTheme'

export default function TabLayout() {
  const { isDark } = useTheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3498DB',
        tabBarInactiveTintColor: isDark
          ? 'rgba(236, 240, 241, 0.5)'
          : 'rgba(44, 62, 80, 0.5)',
        headerShown: false,
        tabBarBackground: () => (
          <BlurView
            tint={isDark ? 'dark' : 'light'}
            intensity={isDark ? 30 : 50}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        ),
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: isDark
            ? 'rgba(26, 27, 30, 0.8)'
            : 'rgba(255, 255, 255, 0.8)',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 34 : 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '创作中心',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="wand.and.stars" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '个人中心',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
