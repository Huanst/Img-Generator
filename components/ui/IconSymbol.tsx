// This file is a fallback for using MaterialIcons on Android and web.

import { MaterialIcons } from '@expo/vector-icons'
import { SymbolViewProps } from 'expo-symbols'
import React from 'react'
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native'

type MaterialIconName = keyof typeof MaterialIcons.glyphMap

const MAPPING: Record<string, MaterialIconName> = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'wand.and.stars': 'auto-fix-high',
  'person.fill': 'person',
  checkmark: 'check',
}

export type IconSymbolName = keyof typeof MAPPING

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
  name,
  size,
  color,
  style,
}: {
  name: IconSymbolName
  size?: number
  color?: string | OpaqueColorValue
  style?: StyleProp<TextStyle>
}) {
  const materialName = MAPPING[name]
  if (!materialName) {
    console.warn(`Icon name "${name}" not found in mapping`)
    return null
  }

  return (
    <MaterialIcons
      name={materialName}
      size={size}
      color={color}
      style={style}
    />
  )
}
