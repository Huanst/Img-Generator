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
  { id: '1024x1024', label: '1024x1024', width: 1024, height: 1024 },
  { id: '960x1280', label: '960x1280', width: 960, height: 1280 },
  { id: '768x1024', label: '768x1024', width: 768, height: 1024 },
  { id: '720x1440', label: '720x1440', width: 720, height: 1440 },
  { id: '720x1280', label: '720x1280', width: 720, height: 1280 },
  { id: '1280x720', label: '1280x720', width: 1280, height: 720 },
  { id: '1440x720', label: '1440x720', width: 1440, height: 720 },
  { id: '1920x1080', label: '1920x1080', width: 1920, height: 1080 },
  { id: '2048x1080', label: '2048x1080', width: 2048, height: 1080 },
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: horizontalPadding,
          alignItems: 'center',
          flexGrow: 1,
        }}>
        <ThemedView
          style={[
            styles.content,
            { width: contentWidth - horizontalPadding * 2 },
          ]}>
          <Animated.View style={[styles.welcomeContainer, { marginTop: 20 }]}>
            <BlurView
              intensity={20}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.sizeContainer}>
              <ThemedText style={styles.sizeTitle}>选择图片尺寸</ThemedText>
              <View style={styles.sizeOptions}>
                {imageSizeOptions.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.sizeButton,
                      selectedSize === option.id && styles.sizeButtonSelected,
                    ]}
                    onPress={() => setSelectedSize(option.id)}>
                    <BlurView
                      intensity={20}
                      tint={isDark ? 'dark' : 'light'}
                      style={StyleSheet.absoluteFill}
                    />
                    <ThemedText
                      style={[
                        styles.sizeButtonText,
                        selectedSize === option.id &&
                          styles.sizeButtonTextSelected,
                      ]}>
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.parameterContainer}>
              <ThemedText style={styles.parameterTitle}>
                生成数量 (1-3)
              </ThemedText>
              <View style={styles.parameterControl}>
                {[1, 2, 3].map(num => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.batchButton,
                      batchSize === num && styles.batchButtonSelected,
                    ]}
                    onPress={() => setBatchSize(num)}>
                    <BlurView
                      intensity={20}
                      tint={isDark ? 'dark' : 'light'}
                      style={StyleSheet.absoluteFill}
                    />
                    <ThemedText
                      style={[
                        styles.batchButtonText,
                        batchSize === num && styles.batchButtonTextSelected,
                      ]}>
                      {num}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.parameterContainer}>
              <ThemedText style={styles.parameterTitle}>
                推理步数 ({numInferenceSteps})
              </ThemedText>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={100}
                step={1}
                value={numInferenceSteps}
                onValueChange={handleInferenceStepsChange}
                minimumTrackTintColor={isDark ? '#FFFFFF' : '#000000'}
                maximumTrackTintColor={isDark ? '#666666' : '#CCCCCC'}
                thumbTintColor={isDark ? '#FFFFFF' : '#000000'}
              />
            </View>

            <View style={styles.parameterContainer}>
              <ThemedText style={styles.parameterTitle}>
                引导系数 ({guidanceScale.toFixed(1)})
              </ThemedText>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={20}
                step={0.1}
                value={guidanceScale}
                onValueChange={handleGuidanceScaleChange}
                minimumTrackTintColor={isDark ? '#FFFFFF' : '#000000'}
                maximumTrackTintColor={isDark ? '#666666' : '#CCCCCC'}
                thumbTintColor={isDark ? '#FFFFFF' : '#000000'}
              />
            </View>

            <View style={styles.inputContainer}>
              <BlurView
                intensity={20}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    color: isDark ? '#FFFFFF' : '#000000',
                  },
                ]}
                placeholder="描述你想创作的图片，例如：'一只可爱的熊猫在竹林中吃竹子'"
                value={prompt}
                onChangeText={setPrompt}
                multiline
                placeholderTextColor={
                  isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(60, 60, 67, 0.6)'
                }
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={generateImage}
              disabled={loading}>
              <BlurView
                intensity={60}
                tint={isDark ? 'dark' : 'light'}
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: isDark ? '#007AFF80' : '#007AFFCC' },
                ]}
              />
              <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>
                {loading ? '创作中...' : '开始创作'}
              </ThemedText>
            </TouchableOpacity>
          </Animated.View>

          {error ? (
            <View style={styles.errorContainer}>
              <BlurView
                intensity={40}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
              />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          ) : null}

          {(loading || generatedImages.length > 0) && (
            <View style={styles.resultContainer}>
              <Animated.View style={[styles.imagesGrid, { opacity: fadeAnim }]}>
                {loading
                  ? Array(batchSize)
                      .fill(0)
                      .map((_, index) => (
                        <LoadingFrame
                          key={index}
                          width={imageSize.width}
                          height={imageSize.height}
                        />
                      ))
                  : generatedImages.map((url, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[styles.imageWrapper]}
                        onPress={() => handleImagePress(index)}>
                        <Image
                          source={{ uri: url }}
                          style={[
                            styles.generatedImage,
                            {
                              width: imageSize.width,
                              height: imageSize.height,
                            },
                          ]}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    ))}
              </Animated.View>

              {generatedImages.length > 0 && (
                <TouchableOpacity
                  style={[styles.button, styles.newButton]}
                  onPress={() => {
                    setGeneratedImages([])
                    setPrompt('')
                    setConversationSeed(null)
                  }}
                  disabled={loading}>
                  <BlurView
                    intensity={40}
                    tint={isDark ? 'dark' : 'light'}
                    style={StyleSheet.absoluteFill}
                  />
                  <ThemedText style={[styles.buttonText, { color: '#007AFF' }]}>
                    新的创作
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ThemedView>
      </ScrollView>

      <Modal
        visible={selectedImageIndex !== null}
        transparent={true}
        onRequestClose={closeImageViewer}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeImageViewer}>
          {selectedImageIndex !== null && (
            <Image
              source={{ uri: generatedImages[selectedImageIndex] }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </Modal>
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
    gap: 20,
  },
  welcomeContainer: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    gap: 20,
    overflow: 'hidden',
  },
  sizeContainer: {
    width: '100%',
  },
  sizeTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  sizeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeButton: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  sizeButtonSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderColor: '#007AFF',
  },
  sizeButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  sizeButtonTextSelected: {
    color: '#007AFF',
  },
  parameterContainer: {
    width: '100%',
  },
  parameterTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  parameterControl: {
    flexDirection: 'row',
    gap: 8,
  },
  batchButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
  },
  batchButtonSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderColor: '#007AFF',
  },
  batchButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  batchButtonTextSelected: {
    color: '#007AFF',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  inputContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  input: {
    width: '100%',
    minHeight: 100,
    padding: 12,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    zIndex: 1,
  },
  newButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  errorContainer: {
    width: '100%',
    borderRadius: 12,
    padding: 12,
    overflow: 'hidden',
  },
  errorText: {
    color: '#FF453A',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: -0.24,
  },
  resultContainer: {
    width: '100%',
    marginTop: 20,
    gap: 20,
  },
  imagesGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  imageWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    flex: 0,
  },
  generatedImage: {
    borderRadius: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
})
