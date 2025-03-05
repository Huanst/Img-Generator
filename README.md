# AI 图像生成器

这是一个基于 [Expo](https://expo.dev) 框架开发的 AI 图像生成应用，使用 [`create-expo-app`](https://www.npmjs.com/package/create-expo-app) 创建。该应用支持通过文本描述生成各种尺寸的图像，并提供了丰富的自定义选项。

## 功能特点

- 支持多种图像尺寸（如 1024x1024、960x1280 等）
- 提供深色/浅色主题切换
- 支持系统主题跟随
- 基于文件的路由系统
- 响应式设计，适配多种设备
- 支持 iOS、Android 和 Web 平台

## 开始使用

### 环境要求

- Node.js
- npm 或 yarn
- iOS/Android 模拟器（可选）

### 安装步骤

1. 安装项目依赖

   ```bash
   npm install
   ```

2. 启动开发服务器

   ```bash
   npx expo start
   ```

启动后，你可以选择以下方式运行应用：

- [开发构建](https://docs.expo.dev/develop/development-builds/introduction/) - 用于开发环境测试
- [Android 模拟器](https://docs.expo.dev/workflow/android-studio-emulator/) - 在 Android 设备上运行
- [iOS 模拟器](https://docs.expo.dev/workflow/ios-simulator/) - 在 iOS 设备上运行
- [Expo Go](https://expo.dev/go) - 使用 Expo Go 应用快速预览

## 项目结构

```
├── app/                # 应用主要代码
│   ├── tabs/          # 标签页面组件
│   └── index.tsx      # 入口文件
├── assets/            # 静态资源文件
├── components/        # 可复用组件
├── config/            # 配置文件
├── constants/         # 常量定义
├── hooks/             # 自定义 Hooks
└── scripts/          # 脚本文件
```

## 开发指南

你可以通过编辑 **app** 目录中的文件开始开发。项目使用[基于文件的路由](https://docs.expo.dev/router/introduction)系统，方便页面导航管理。

### 获取新项目

如果你想从头开始一个新项目，可以运行：

```bash
   npm run reset-project
```

这个命令会将当前代码移动到 **app-example** 目录，并创建一个全新的 **app** 目录供你开发使用。

## 环境变量

项目使用 `.env` 文件管理环境变量。你可以复制 `.env.example` 文件并重命名为 `.env`，然后根据需要修改其中的配置。

## 主题定制

应用支持以下主题模式：

- 跟随系统
- 浅色模式
- 深色模式

你可以在设置页面中切换这些主题。

## 学习资源

- [Expo 文档](https://docs.expo.dev/) - 学习 Expo 开发基础知识
- [Expo 教程](https://docs.expo.dev/tutorial/introduction/) - 跟随教程创建完整应用

## 社区支持

- [Expo GitHub](https://github.com/expo/expo) - 访问开源代码库
- [Discord 社区](https://chat.expo.dev) - 加入开发者社区交流

## 许可证

本项目基于 MIT 许可证开源。
