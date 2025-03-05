import { createContext, useContext, useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: ThemeMode
  isDark: boolean
  setTheme: (theme: ThemeMode) => void
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  isDark: false,
  setTheme: () => {},
})

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const useThemeProvider = () => {
  const systemColorScheme = useColorScheme()
  const [theme, setThemeState] = useState<ThemeMode>('system')

  useEffect(() => {
    // 加载保存的主题设置
    AsyncStorage.getItem('theme').then(savedTheme => {
      if (
        savedTheme &&
        (savedTheme === 'light' ||
          savedTheme === 'dark' ||
          savedTheme === 'system')
      ) {
        setThemeState(savedTheme as ThemeMode)
      }
    })
  }, [])

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme)
    AsyncStorage.setItem('theme', newTheme)
  }

  const isDark =
    theme === 'system' ? systemColorScheme === 'dark' : theme === 'dark'

  return {
    theme,
    isDark,
    setTheme,
  }
}
