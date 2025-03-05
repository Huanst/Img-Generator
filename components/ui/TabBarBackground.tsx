import { Platform, View } from 'react-native'
import { BlurView } from 'expo-blur'
import { useTheme } from '@/hooks/useTheme'

export default function TabBarBackground() {
  const { isDark } = useTheme()

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={20}
        tint={isDark ? 'dark' : 'light'}
        style={{ flex: 1 }}
      />
    )
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? '#000000' : '#FFFFFF',
      }}
    />
  )
}

export function useBottomTabOverflow() {
  return Platform.OS === 'ios' ? 20 : 0
}
