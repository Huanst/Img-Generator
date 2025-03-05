import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import { useTheme } from '@/hooks/useTheme'
import { IconSymbol } from '@/components/ui/IconSymbol'

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const { theme, setTheme } = useTheme()

  const themeOptions = [
    { id: 'system', label: '跟随系统' },
    { id: 'light', label: '浅色模式' },
    { id: 'dark', label: '深色模式' },
  ] as const

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
        }}>
        <ThemedView style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            设置
          </ThemedText>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>主题设置</ThemedText>
            <View style={styles.optionsContainer}>
              {themeOptions.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.optionButton}
                  onPress={() => setTheme(option.id)}>
                  <BlurView intensity={20} style={StyleSheet.absoluteFill} />
                  <View style={styles.optionContent}>
                    <ThemedText style={styles.optionText}>
                      {option.label}
                    </ThemedText>
                    {theme === option.id && (
                      <IconSymbol name="checkmark" size={20} color="#34C759" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>关于</ThemedText>
            <View style={styles.aboutContainer}>
              <BlurView intensity={20} style={StyleSheet.absoluteFill} />
              <ThemedText style={styles.versionText}>
                AI图像创作 v1.0.0
              </ThemedText>
            </View>
          </View>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 30,
    letterSpacing: 0.41,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 0.38,
  },
  optionsContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionButton: {
    overflow: 'hidden',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60, 60, 67, 0.36)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  optionText: {
    fontSize: 17,
    letterSpacing: -0.41,
  },
  aboutContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
  },
  versionText: {
    fontSize: 17,
    letterSpacing: -0.41,
    textAlign: 'center',
  },
})
