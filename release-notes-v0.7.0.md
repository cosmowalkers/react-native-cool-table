## v0.7.0 — React Native 0.72 升级

将运行时和全套工具链升级至 RN 0.72 生态，同时修复 2 个业务 bug。

### ⚡ Breaking Changes

- **最低运行时**: React 18.2 + React Native 0.72（之前为 React 16 + RN 0.63）
- **TypeScript 5**: `tsconfig` 切换为 `react-jsx` transform，源码已移除所有 `import React`
- **Husky 8**: 迁移到新版 hook 目录结构 (`.husky/`)，旧 `husky.hooks` 配置移除

### 🔧 工具链升级

| 工具 | 旧版 | 新版 |
|------|------|------|
| react | 16.13 | 18.2 |
| react-native | 0.63.4 | 0.72.17 |
| typescript | 4.1 | 5.9 |
| jest | 26 | 29 |
| @testing-library/react-native | 11.5 | 12.9 |
| eslint | 7 | 8 |
| prettier | 2 | 3 |
| react-native-builder-bob | 0.18 | 0.23 |
| husky | 4 | 8 |

### 🐛 Bug Fixes

- **useFilter 批处理漏报** — React 18 自动批处理下多列同时 setFilterState 只上报最后一列，改为队列化逐条上报
- **useTreeLazyLoad StrictMode 兼容** — StrictMode 下 effect 双重执行导致懒加载结果被丢弃，引入 `createMountGuard` 守卫

### 🏗️ Example App

- 升级到 Expo 49 + React Navigation 6
- Metro 配置迁移至新版 `blockList` API
- tsconfig 补充 `expo/tsconfig.base` 继承
