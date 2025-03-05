import { View, ViewProps } from 'react-native'
import { useTheme } from '@/hooks/useTheme'

export function ThemedView({ style, ...props }: ViewProps) {
  const { isDark } = useTheme()

  return (
    <View
      style={[
        {
          backgroundColor: isDark ? '#000000' : '#FFFFFF',
        },
        style,
      ]}
      {...props}
    />
  )
}
