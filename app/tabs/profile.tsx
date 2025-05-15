import { StyleSheet, TouchableOpacity, View, Image, Text, ScrollView } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import { useTheme } from '@/hooks/useTheme'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { LinearGradient } from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const { theme, setTheme, isDark } = useTheme()
  const [avatar, setAvatar] = useState<string | null>(null)

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    })

    if (!result.canceled) {
      setAvatar(result.assets[0].uri)
    }
  }

  const themeOptions = [
    { id: 'system', label: '跟随系统' },
    { id: 'light', label: '浅色模式' },
    { id: 'dark', label: '深色模式' },
  ] as const

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={isDark ? ['#1a1b1e', '#2c3e50'] : ['#ecf0f1', '#bdc3c7']}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 20,
        }}>
        <View style={styles.content}>
          <ThemedText style={[styles.title, { color: isDark ? '#fff' : '#2c3e50' }]}>
            设置
          </ThemedText>

          <BlurView
            intensity={80}
            tint={isDark ? 'dark' : 'light'}
            style={styles.section}
          >
            <ThemedText style={[styles.sectionTitle, { color: isDark ? '#fff' : '#2c3e50' }]}>
              个人头像
            </ThemedText>
            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#2c3e50' : '#bdc3c7' }]}>
                  <Ionicons name="person" size={40} color={isDark ? '#fff' : '#2c3e50'} />
                </View>
              )}
              <BlurView
                intensity={80}
                tint={isDark ? 'dark' : 'light'}
                style={styles.uploadButton}
              >
                <Text style={[styles.uploadButtonText, { color: isDark ? '#fff' : '#2c3e50' }]}>
                  {avatar ? '更换头像' : '上传头像'}
                </Text>
              </BlurView>
            </TouchableOpacity>
          </BlurView>

          <BlurView
            intensity={80}
            tint={isDark ? 'dark' : 'light'}
            style={styles.section}
          >
            <ThemedText style={[styles.sectionTitle, { color: isDark ? '#fff' : '#2c3e50' }]}>
              主题设置
            </ThemedText>
            <View style={styles.optionsContainer}>
              {themeOptions.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionButton,
                    {
                      borderBottomColor: isDark
                        ? 'rgba(236, 240, 241, 0.1)'
                        : 'rgba(44, 62, 80, 0.1)',
                    },
                  ]}
                  onPress={() => setTheme(option.id)}>
                  <BlurView
                    intensity={isDark ? 20 : 50}
                    tint={isDark ? "dark" : "light"}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.optionContent}>
                    <ThemedText
                      style={[
                        styles.optionText,
                        { color: isDark ? '#ECF0F1' : '#2C3E50' },
                      ]}>
                      {option.label}
                    </ThemedText>
                    {theme === option.id && (
                      <IconSymbol name="checkmark" size={20} color="#3498DB" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </BlurView>

          <BlurView
            intensity={80}
            tint={isDark ? 'dark' : 'light'}
            style={styles.section}
          >
            <ThemedText style={[styles.sectionTitle, { color: isDark ? '#fff' : '#2c3e50' }]}>
              关于
            </ThemedText>
            <View style={styles.aboutContainer}>
              <BlurView
                intensity={isDark ? 20 : 50}
                tint={isDark ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
              />
              <ThemedText
                style={[
                  styles.versionText,
                  { color: isDark ? '#ECF0F1' : '#2C3E50' },
                ]}>
                AI图像创作 v1.0.0
              </ThemedText>
            </View>
          </BlurView>
        </View>
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
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 24,
  },
  section: {
    borderRadius: 16,
    marginTop: 20,
    overflow: 'hidden',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionsContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  optionButton: {
    overflow: 'hidden',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  optionText: {
    fontSize: 16,
  },
  aboutContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    padding: 16,
  },
  versionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  uploadButtonText: {
    fontSize: 16,
  },
})
