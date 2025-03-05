// API配置接口
interface ApiConfig {
  BASE_URL: string
  API_KEY: string
}

// 导出API配置
export const API_CONFIG: ApiConfig = {
  BASE_URL: 'https://api.siliconflow.cn/v1',
  API_KEY: process.env.EXPO_PUBLIC_API_KEY || '',
}
