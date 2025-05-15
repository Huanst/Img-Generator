import {
  Image,
  StyleSheet,
  Platform,
  useWindowDimensions,
  Vibration,
  Animated,
} from 'react-native'
import { useState, useCallback, useRef } from 'react'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import {
  TextInput,
  TouchableOpacity,
  ScrollView,
  View,
  Modal,
} from 'react-native'
import Slider from '@react-native-community/slider'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { API_CONFIG } from '@/config/env'
import { BlurView } from 'expo-blur'
import { LoadingFrame } from '@/components/ui/LoadingFrame'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { useTheme } from '@/hooks/useTheme'
import { LinearGradient } from 'expo-linear-gradient'

type ImageSize =
  | '1024x1024'
  | '960x1280'
  | '768x1024'
  | '720x1440'
  | '720x1280'
  | '1280x720'
  | '1440x720'
  | '1920x1080'
  | '2048x1080'

interface ImageSizeOption {
  id: ImageSize
  label: string
  width: number
  height: number
}

const imageSizeOptions: ImageSizeOption[] = [
  { id: '1024x1024', label: '1:1', width: 1024, height: 1024 },
  { id: '960x1280', label: '3:4', width: 960, height: 1280 },
  { id: '1280x720', label: '16:9', width: 1280, height: 720 },
  { id: '1920x1080', label: 'HD', width: 1920, height: 1080 },
]

export default function HomeScreen() {
  const [prompt, setPrompt] = useState('')
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [conversationSeed, setConversationSeed] = useState<number | null>(null)
  const [selectedSize, setSelectedSize] = useState<ImageSize>('1024x1024')
  const [batchSize, setBatchSize] = useState(1)
  const [numInferenceSteps, setNumInferenceSteps] = useState(20)
  const [guidanceScale, setGuidanceScale] = useState(7.5)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  )
  const fadeAnim = useRef(new Animated.Value(1)).current
  const insets = useSafeAreaInsets()
  const { width: windowWidth } = useWindowDimensions()
  const { isDark } = useTheme()

  // Calculate content width based on device width
  const contentWidth = Math.min(windowWidth, 800) // Max width of 800 for iPad
  const horizontalPadding = Math.max((windowWidth - contentWidth) / 2, 20)

  const enhancePrompt = (originalPrompt: string) => {
    // 添加基础质量描述
    const baseQuality = 'masterpiece, best quality, highly detailed'
    // 添加风格描述
    const styleGuide = 'professional photography, realistic, 4k, sharp focus'
    // 添加负面提示词
    const negativePrompt =
      'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry'

    const finalPrompt = `${baseQuality}, ${originalPrompt}, ${styleGuide}`

    return {
      prompt: finalPrompt,
      negative_prompt: negativePrompt,
    }
  }

  const handleImagePress = (index: number) => {
    setSelectedImageIndex(index)
  }

  const closeImageViewer = () => {
    setSelectedImageIndex(null)
  }

  const startLoading = () => {
    setLoading(true)
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }

  const finishLoading = () => {
    setLoading(false)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('请输入创作描述')
      return
    }

    if (!API_CONFIG.API_KEY) {
      setError('API密钥未配置')
      return
    }

    setError('')
    startLoading()
    const currentPrompt = prompt.trim()

    try {
      if (!conversationSeed) {
        setConversationSeed(Math.floor(Math.random() * 9999999999) + 1)
      }

      const enhancedPrompts = enhancePrompt(currentPrompt)
      const selectedOption = imageSizeOptions.find(
        option => option.id === selectedSize
      )!

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/images/generations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_CONFIG.API_KEY}`,
          },
          body: JSON.stringify({
            model: 'Kwai-Kolors/Kolors',
            prompt: enhancedPrompts.prompt,
            negative_prompt: enhancedPrompts.negative_prompt,
            image_size: selectedOption.id,
            batch_size: batchSize,
            num_inference_steps: numInferenceSteps,
            guidance_scale: guidanceScale,
            seed: conversationSeed,
          }),
        }
      )

      const responseText = await response.text()
      console.log('API Response:', responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        throw new Error(`API返回的数据格式无效: ${responseText}`)
      }

      if (!response.ok) {
        const errorMessage =
          data.error?.message ||
          `创作失败: ${response.status} ${response.statusText}`
        throw new Error(errorMessage)
      }

      if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
        throw new Error('API返回数据格式错误')
      }

      // 直接保存图片URL数组
      setGeneratedImages(data.data.map((item: { url: string }) => item.url))
    } catch (error: any) {
      console.error('Error generating image:', error)
      setError(error.message || '创作失败，请重试')
    } finally {
      finishLoading()
    }
  }

  const selectedOption = imageSizeOptions.find(
    option => option.id === selectedSize
  )!

  // 计算图片显示尺寸
  const calculateImageDisplaySize = () => {
    const maxWidth = contentWidth - horizontalPadding * 2
    const imageWidth = selectedOption.width
    const imageHeight = selectedOption.height
    const aspectRatio = imageWidth / imageHeight
    const gap = 12 // Gap between images

    let displayWidth = maxWidth
    let displayHeight

    // If there are multiple images or loading multiple images
    if (loading ? batchSize > 1 : generatedImages.length > 1) {
      // For 2 images, show them side by side
      if ((loading ? batchSize : generatedImages.length) === 2) {
        displayWidth = (maxWidth - gap) / 2
      }
      // For 3 or 4 images, show them in a 2x2 grid
      else if ((loading ? batchSize : generatedImages.length) >= 3) {
        displayWidth = (maxWidth - gap) / 2
      }
    }

    // Ensure the width doesn't exceed the original image width
    displayWidth = Math.min(displayWidth, imageWidth)
    displayHeight = displayWidth / aspectRatio

    return {
      width: displayWidth,
      height: displayHeight,
    }
  }

  const imageSize = calculateImageDisplaySize()

  const handleInferenceStepsChange = (value: number) => {
    const roundedValue = Math.round(value)
    if (roundedValue !== numInferenceSteps) {
      Vibration.vibrate(10)
    }
    setNumInferenceSteps(roundedValue)
  }

  const handleGuidanceScaleChange = (value: number) => {
    const roundedValue = Math.round(value * 10) / 10
    if (roundedValue !== guidanceScale) {
      Vibration.vibrate(10)
    }
    setGuidanceScale(roundedValue)
  }

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={isDark ? ['#1A1B1E', '#2C3E50', '#34495E'] : ['#E8F3F9', '#D5E6F3', '#C2D9ED']}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + 20, 40),
        }}
      >
        <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 70 : 30 }]}>
          <ThemedText style={[styles.subtitle, { color: isDark ? '#ECF0F1' : '#34495E' }]}>
            输入描述，让AI为你创作精美的图片
          </ThemedText>
        </View>

        <View style={styles.inputContainer}>
          <BlurView intensity={isDark ? 20 : 50} tint={isDark ? "dark" : "light"} style={styles.blurContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  color: isDark ? '#ECF0F1' : '#2C3E50',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
                },
              ]}
              placeholder="请输入图片描述..."
              placeholderTextColor={isDark ? 'rgba(236, 240, 241, 0.5)' : 'rgba(44, 62, 80, 0.5)'}
              value={prompt}
              onChangeText={setPrompt}
              multiline
              numberOfLines={4}
            />
          </BlurView>
        </View>

        <View style={styles.controlsContainer}>
          <BlurView intensity={isDark ? 20 : 50} tint={isDark ? "dark" : "light"} style={[styles.controlGroup, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
          }]}>
            <ThemedText style={[styles.controlLabel, { color: isDark ? '#ECF0F1' : '#2C3E50' }]}>
              图片尺寸
            </ThemedText>
            <View style={styles.sizeSelector}>
              {imageSizeOptions.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.sizeButton,
                    {
                      backgroundColor:
                        selectedSize === option.id
                          ? isDark ? 'rgba(236, 240, 241, 0.2)' : 'rgba(44, 62, 80, 0.1)'
                          : 'transparent',
                      borderColor: isDark ? 'rgba(236, 240, 241, 0.2)' : 'rgba(44, 62, 80, 0.2)',
                    },
                  ]}
                  onPress={() => setSelectedSize(option.id)}
                >
                  <ThemedText
                    style={[
                      styles.sizeButtonText,
                      {
                        color: isDark ? '#ECF0F1' : '#2C3E50',
                        opacity: selectedSize === option.id ? 1 : 0.7,
                      },
                    ]}
                  >
                    {option.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </BlurView>

          <BlurView intensity={isDark ? 20 : 50} tint={isDark ? "dark" : "light"} style={[styles.controlGroup, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
          }]}>
            <ThemedText style={[styles.controlLabel, { color: isDark ? '#ECF0F1' : '#2C3E50' }]}>
              生成数量
            </ThemedText>
            <View style={styles.sizeSelector}>
              {[1, 2, 3].map(num => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.sizeButton,
                    {
                      backgroundColor:
                        batchSize === num
                          ? isDark ? 'rgba(236, 240, 241, 0.2)' : 'rgba(44, 62, 80, 0.1)'
                          : 'transparent',
                      borderColor: isDark ? 'rgba(236, 240, 241, 0.2)' : 'rgba(44, 62, 80, 0.2)',
                      flex: 1,
                      alignItems: 'center',
                    },
                  ]}
                  onPress={() => setBatchSize(num)}
                >
                  <ThemedText
                    style={[
                      styles.sizeButtonText,
                      {
                        color: isDark ? '#ECF0F1' : '#2C3E50',
                        opacity: batchSize === num ? 1 : 0.7,
                      },
                    ]}
                  >
                    {num}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </BlurView>

          <BlurView intensity={isDark ? 20 : 50} tint={isDark ? "dark" : "light"} style={[styles.controlGroup, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
          }]}>
            <ThemedText style={[styles.controlLabel, { color: isDark ? '#ECF0F1' : '#2C3E50' }]}>
              迭代步数: {numInferenceSteps}
            </ThemedText>
            <View style={styles.sliderContainer}>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={10}
                maximumValue={50}
                step={1}
                value={numInferenceSteps}
                onValueChange={handleInferenceStepsChange}
                minimumTrackTintColor={isDark ? '#3498DB' : '#3498DB'}
                maximumTrackTintColor={isDark ? 'rgba(236, 240, 241, 0.2)' : 'rgba(44, 62, 80, 0.2)'}
                thumbTintColor={isDark ? '#5DADE2' : '#2980B9'}
              />
            </View>
          </BlurView>

          <BlurView intensity={isDark ? 20 : 50} tint={isDark ? "dark" : "light"} style={[styles.controlGroup, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
          }]}>
            <ThemedText style={[styles.controlLabel, { color: isDark ? '#ECF0F1' : '#2C3E50' }]}>
              引导强度: {guidanceScale}
            </ThemedText>
            <View style={styles.sliderContainer}>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={1}
                maximumValue={20}
                step={0.5}
                value={guidanceScale}
                onValueChange={handleGuidanceScaleChange}
                minimumTrackTintColor={isDark ? '#3498DB' : '#3498DB'}
                maximumTrackTintColor={isDark ? 'rgba(236, 240, 241, 0.2)' : 'rgba(44, 62, 80, 0.2)'}
                thumbTintColor={isDark ? '#5DADE2' : '#2980B9'}
              />
            </View>
          </BlurView>
        </View>

        <TouchableOpacity
          style={[
            styles.generateButton,
            {
              backgroundColor: isDark ? '#3498DB' : '#3498DB',
              opacity: loading ? 0.7 : 1,
            },
          ]}
          onPress={generateImage}
          disabled={loading}
        >
          <ThemedText
            style={[
              styles.generateButtonText,
              {
                color: '#fff',
              },
            ]}
          >
            {loading ? '生成中...' : '开始生成'}
          </ThemedText>
        </TouchableOpacity>

        {error ? (
          <ThemedText style={[styles.errorText, { color: isDark ? '#E74C3C' : '#E74C3C' }]}>
            {error}
          </ThemedText>
        ) : null}

        <View style={styles.imagesContainer}>
          {loading ? (
            Array(batchSize)
              .fill(0)
              .map((_, index) => (
                <LoadingFrame
                  key={index}
                  width={imageSize.width}
                  height={imageSize.height}
                />
              ))
          ) : (
            generatedImages.map((imageUrl, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.imageWrapper, {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
                }]}
                onPress={() => handleImagePress(index)}
              >
                <Image
                  source={{ uri: imageUrl }}
                  style={[
                    styles.image,
                    {
                      width: imageSize.width,
                      height: imageSize.height,
                    },
                  ]}
                />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={selectedImageIndex !== null}
        transparent={true}
        onRequestClose={closeImageViewer}
      >
        <View style={[styles.modalContainer, {
          backgroundColor: isDark ? 'rgba(26, 27, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        }]}>
          <Image
            source={{ uri: generatedImages[selectedImageIndex!] }}
            style={styles.modalImage}
          />
          <TouchableOpacity
            style={[styles.closeButton, {
              backgroundColor: isDark ? 'rgba(44, 62, 80, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            }]}
            onPress={closeImageViewer}
          >
            <IconSymbol name="xmark" size={24} color={isDark ? '#ECF0F1' : '#2C3E50'} />
          </TouchableOpacity>
        </View>
      </Modal>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 17,
    opacity: 0.8,
    lineHeight: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  input: {
    height: 120,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  controlsContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    gap: 16,
  },
  controlGroup: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  sizeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 16,
    paddingTop: 8,
  },
  sizeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  sizeButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  sliderContainer: {
    padding: 16,
    paddingTop: 0,
  },
  generateButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 8,
  },
  generateButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 24,
    paddingHorizontal: 20,
  },
  imageWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  image: {
    borderRadius: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  errorText: {
    color: '#E74C3C',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
})
