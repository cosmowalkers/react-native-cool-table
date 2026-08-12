# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.0] - 2026-08-12

### Breaking Changes

- **最低运行时**: React 18.2 + React Native 0.72（之前为 React 16 + RN 0.63）
- **TypeScript 5**: `tsconfig` 切换为 `react-jsx` transform，源码移除所有 `import React`
- **Husky 8**: 迁移到新版 hook 目录结构 (`.husky/`)，旧 `husky.hooks` 配置移除

### Changed

- 升级 jest 26 → 29, @testing-library/react-native 11 → 12
- 升级 eslint 7 → 8, prettier 2 → 3
- 升级 react-native-builder-bob 0.18 → 0.23，清理 `files` 字段
- Example app 升级到 Expo 49 + React Navigation 6

### Fixed

- **useFilter 批处理漏报**: React 18 自动批处理下多列同时 setFilterState 只上报最后一列，改为队列化逐条上报
- **useTreeLazyLoad StrictMode 兼容**: StrictMode 下 effect 双重执行导致懒加载结果被丢弃，引入 `createMountGuard` 守卫
- Example metro 配置迁移至新版 `blockList` API
- Example tsconfig 补充 `expo/tsconfig.base` 继承

## [0.6.0] - 2026-04-14

### Added

- **i18n / Locale support**: New `locale` prop on `CoolTable` and `ColumnManager` to customize all UI text. Default locale is Chinese. Export `DEFAULT_LOCALE` and `ILocale` type for customization.
- **Accessibility**: Added `accessibilityRole`, `accessibilityState`, and `accessibilityLabel` to checkbox, radio, sort indicator, and pagination buttons.
- **`onLoadError` callback**: New optional callback on `treeConfig` that fires when async `loadChildren` fails, instead of silently swallowing errors.
- **DEV warning for missing `rowKey`**: Warns in development mode when neither `rowKey` nor `keyExtractor` is provided.
- **CHANGELOG**: Added this file.

### Changed

- **lodash moved to `dependencies`**: Previously a `devDependency`, consumers no longer need to install lodash separately.
- **Peer dependencies**: Narrowed from `"*"` to `react >=16.8.0` and `react-native >=0.60.0`.
- **Package metadata**: Expanded `keywords` (added `table`, `grid`, `sort`, `tree`, `datatable`, `fixed-columns`, `pagination`, `inline-edit`, `typescript`) and improved `description`.
- **Table container background**: Removed hardcoded `backgroundColor: '#fff'` from the table content wrapper. Use the `style` prop to set a background color.
- **Empty state height**: Changed from fixed `height: 200` to `minHeight: 200`. Override with `emptyWrapperStyle`.
- **PanResponder gesture release**: `ResizeHandle` and `DragHandle` now allow the system to reclaim gestures (`onPanResponderTerminationRequest` returns `true`), preventing stuck drag states on iOS edge swipe.
- **Tooltip rotation support**: Tooltip position now uses `useWindowDimensions()` instead of a module-level constant, correctly responding to screen rotation.

### Fixed

- **Context safety**: `useTableStatic()` and `useTableState()` now throw a descriptive error when called outside of `<CoolTable>`, instead of crashing with a null dereference.
- **`onEditCancel` callback**: Now receives the actual `row` and `column` objects instead of `undefined`.
- **`ISpanResult.rowspan`**: Marked as `@deprecated` since only `colspan` is currently implemented.

### Documentation

- **README rewrite**: Comprehensive documentation covering all 27 features, full props tables, ref API, locale, contexts, and performance tips.

## [0.5.0] - Previous Release

### Added

- Context menu (long-press)
- Data validation
- Search highlight
- Column visibility manager
- Inline cell editing (text, number, select, custom)
- Row drag sort
- Column resize
- Pagination
- Cell merge (colspan)
- Grouped headers
- Ellipsis + tooltip
- Virtual rendering config
- Footer summary rows
- Loading overlay
- Stripe rows and border modes
- Row current highlight
- Checkbox multi-select and radio single-select
- Column filters
- Multi-column sort
- Sequence number column
- Async tree lazy load with caching

## [0.4.0]

### Added

- Tree / expandable rows with animated collapse
- Custom cell and header rendering
- Empty state with built-in images

## [0.3.0]

### Added

- Sortable columns (single sort, asc/desc cycling)
- Fixed (pinned) columns — left and right

## [0.2.0]

### Added

- Two-context architecture (TableStaticContext / TableStateContext)
- FlatList-based rendering with sticky header

## [0.1.0]

### Added

- Initial release
- Basic table component with compound component pattern
- Horizontal scrolling
- TypeScript strict mode
