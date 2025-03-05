import { useEffect, useRef } from 'react'
import { StyleSheet, View, Animated } from 'react-native'
import { BlurView } from 'expo-blur'

interface LoadingFrameProps {
  width: number
  height: number
}

export function LoadingFrame({ width, height }: LoadingFrameProps) {
  const borderAnim = useRef(new Animated.Value(0)).current
  const dotAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ]

  useEffect(() => {
    // Border animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(borderAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(borderAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start()

    // Dots animation
    dotAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            delay: index * 200,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start()
    })
  }, [])

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
    outputRange: [
      'rgba(255, 45, 85, 0.7)', // Red
      'rgba(90, 200, 250, 0.7)', // Blue
      'rgba(52, 199, 89, 0.7)', // Green
      'rgba(255, 149, 0, 0.7)', // Orange
      'rgba(175, 82, 222, 0.7)', // Purple
      'rgba(255, 45, 85, 0.7)', // Red
    ],
  })

  return (
    <View style={[styles.container, { width, height }]}>
      <BlurView intensity={20} style={StyleSheet.absoluteFill} />
      <Animated.View
        style={[
          styles.border,
          {
            borderColor,
            width: width - 4,
            height: height - 4,
          },
        ]}
      />
      <View style={styles.loadingText}>
        <BlurView intensity={60} style={styles.loadingBlur}>
          <View style={styles.loadingInner}>
            {dotAnims.map((anim, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    transform: [
                      {
                        translateY: anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -10],
                        }),
                      },
                    ],
                    opacity: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                  },
                ]}
              />
            ))}
          </View>
        </BlurView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  border: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 18,
    borderStyle: 'solid',
  },
  loadingText: {
    position: 'absolute',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
  loadingBlur: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  loadingInner: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
})
