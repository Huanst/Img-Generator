import { Text, TextProps, StyleSheet } from 'react-native'
import { useTheme } from '@/hooks/useTheme'

interface ThemedTextProps extends TextProps {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link'
}

export function ThemedText({
  style,
  type = 'default',
  ...props
}: ThemedTextProps) {
  const { isDark } = useTheme()

  const getTextColor = () => {
    if (type === 'title') {
      return isDark ? '#FFFFFF' : '#000000'
    }
    return isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'
  }

  return (
    <Text
      style={[
        {
          color: getTextColor(),
        },
        styles[type],
        style,
      ]}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  link: {
    fontSize: 16,
    fontWeight: '400',
    color: '#0a7ea4',
  },
})
