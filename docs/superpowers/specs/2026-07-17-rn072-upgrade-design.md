# react-native-cool-table 升级到 RN 0.72 / React 18 / Expo 49 — 设计文档

日期:2026-07-17
状态:待实现

## 1. 背景与目标

`react-native-cool-table` 是一个纯 JS/TS 的 React Native 表格组件库,当前构建在 RN 0.63.4 / React 16.13 / builder-bob 0.18 时代。目标是把它整体升级到 **RN 0.72 / React 18.2 / Expo 49** 时代标准,包含两层:

1. **工具链升级** — builder-bob、TypeScript、jest、eslint、husky 等构建/测试链全部升到 0.72 时代对应版本。
2. **运行时适配** — 确保库在 RN 0.72 + React 18 环境(自动批处理、并发、StrictMode 双调用)下行为正确,并升级 example app(Expo 40→49)作为真实验证载体。

### 核心判断:换壳,不是重写

对库源码做了系统的 React 18 兼容性对抗审计。5 个疑似风险点里 **4 个是误报,只有 1 个真实回归 bug**:

| 文件/符号 | 初判 | 对抗验证裁定 | 处理 |
|-----------|------|------------|------|
| `createUpdateEffect` StrictMode 守卫 | high | **误报** — StrictMode 只有一轮 mount→cleanup→remount,守卫正确 | 不动 |
| `useTreeLazyLoad` mountedRef | high | **真实 (medium)** — StrictMode 下 `mountedRef` 永久置 false,后续懒加载全被丢弃、spinner 永转 | **修** |
| `useFilter` lastChangedColumnKeyRef | medium | **真实 (low)** — 批处理下多列同 tick 更新漏报,但库自身 UI 不触发 | **防御性修** |
| `useSort` useUpdateEffect | medium | **误报** — 批处理反而更安全,闭包新鲜 | 不动 |
| `useColumnResize` 双 ref | medium | **误报** — `!pending` 短路使 stale ref 无害;JS 单线程无并发中断 | 不动 |

另一个隐患也已排除:源码里 **没有 `React.FC` 用法**(组件统一用 `memo(forwardRef(...))`),所以 React 18 "FC 不再隐含 children" 不影响本库。

结论:table 业务逻辑几乎原封不动。工作集中在依赖、配置、工具链迁移、验证四层,外加两个 bug 修复。

## 2. 版本对齐清单(已用 npm 实测,非凭记忆)

### 库本体(根 `package.json`)

**移除:**
- `@types/react-native` 0.62.13 → 删除(RN 0.72.17 类型已内置)

**升级 devDependencies:**
| 包 | 旧 | 新 | 说明 |
|---|---|---|---|
| react | 16.13.1 | **18.2.0** | RN 0.72.17 peer 要求精确版本 |
| react-native | 0.63.4 | **0.72.17** | |
| react-test-renderer | 16.13.1 | **18.3.1** | 必须与 react 精确一致 |
| typescript | ^4.1.3 | **^5.9.3** | |
| jest | ^26.0.1 | **^29.7.0** | 跨两个主版本 |
| @types/jest | ^26.0.0 | **^29.5.14** | |
| @types/react | ^16.9.19 | **^18.3.31** | |
| @testing-library/react-native | 11.5.4 | **^12.9.0** | 13.x 要求 React 19,不用 |
| react-native-builder-bob | ^0.18.0 | **^0.23.2** | |
| @react-native-community/eslint-config | ^2.0.0 | **^3.2.0** | 内含 @typescript-eslint,适配 TS5 |
| eslint | ^7.2.0 | **^8.57.1** | |
| eslint-config-prettier | ^7.0.0 | **^10.1.8** | |
| eslint-plugin-prettier | ^3.1.3 | **^5.5.6** | 需 prettier 3 |
| prettier | ^2.0.5 | **^3.x** | eslint-plugin-prettier 5 要求 |
| husky | ^4.2.5 | **^8.0.3** | 破坏性:hooks 配置迁移 |

**babel:** `babel.config.js` 内容不变。`metro-react-native-babel-preset` 由 RN 0.72.17 作为传递依赖提供(项目未显式声明),0.72.x 仍用此包名(`@react-native/babel-preset` 从 0.73 起才启用)。babel 升级工作量为零。

**保持不变:** commitlint 系列、release-it、@types/lodash、lodash、pod-install。

### example(Expo 40 → 49)

| 包 | 旧 | 新 | 说明 |
|---|---|---|---|
| expo | ^40.0.0 | **~49** | 内含 RN 0.72 + React 18.2 |
| react | 16.13.1 | **18.2.0** | |
| react-native | 0.63.4 | **0.72.x** | |
| react-dom | 16.13.1 | **18.2.0** | web 端 |
| @react-navigation/native | ^5.9.8 | **^6.x** | |
| @react-navigation/stack | ^5.14.9 | **^6.x** | |
| @react-native-community/masked-view | 0.1.10 | **删除** | 被下一行取代 |
| @react-native-masked-view/masked-view | — | **~0.2.9** | stack v6 的 peer dep |
| react-native-unimodules | ~0.12.0 | **删除** | Expo 43+ 已内置 |
| react-native-gesture-handler | ~1.8.0 | **~2.x** (Expo 49 对应版本) | |
| react-native-safe-area-context | 3.1.9 | **4.x** | |
| react-native-screens | ~2.15.0 | **~3.x** | |
| react-native-web | ~0.14.9 | **~0.19.x** | |
| expo-splash-screen | ~0.8.1 | **~0.20.x** | example 未直接用其 API |
| expo-cli (devDep) | ^4.0.13 | **删除** | 改用 `npx expo` |
| @babel/core | ~7.12.10 | **~7.20.x** | |
| babel-preset-expo | 8.3.0 | **~9.5.x** | |
| @types/react (devDep) | ~16.9.35 | **~18.2.x** | |

> Expo 49 各包精确版本以 `npx expo install --check` 为准 —— 实现时用 expo 的版本对齐工具锁定,避免手写版本漂移。

## 3. 分阶段执行策略

每个阶段有独立、可验证的 gate,失败可被隔离归因。执行顺序:运行时 → 类型 → 测试 → lint → 构建 → hook → bug → example。

```
阶段 0  准备      → 建分支;记录基线(现有 yarn test/lint/typescript 结果快照)
阶段 1  库运行时   → react 18.2 + react-native 0.72.17 + react-test-renderer 18.3.1 + 移除 @types/react-native
                    verify: yarn install 成功,yarn typescript 能跑(允许 TS4 遗留报错)
阶段 2  TS5 现代化 → tsconfig: 删 importsNotUsedAsValues,加 verbatimModuleSyntax:true,jsx 改 react-jsx
                    → 逐文件清理冗余 import React(见 §4)
                    verify: yarn typescript 全绿(零报错)
阶段 3  测试链     → jest 29 + @testing-library/react-native 12 + @types/jest 29
                    verify: yarn test 全绿(修 act()/fake-timers 相关失败)
阶段 4  Lint 链    → eslint 8 + @react-native-community/eslint-config 3.2 + prettier 3 + eslint-plugin/config-prettier
                    注意:prettier 3 默认格式有变(如 trailingComma 默认 all)。项目已在 package.json 显式
                    配置 trailingComma:"es5" 等,应保持这些显式配置以把重格式化 diff 降到最小
                    verify: yarn lint 全绿
阶段 5  构建链     → builder-bob 0.23 + 清理 package.json files 字段
                    verify: yarn prepare 产出 lib/{commonjs,module,typescript}
阶段 6  husky 迁移 → 4→8:删 package.json hooks 块,建 .husky/pre-commit + .husky/commit-msg,prepare 串 husky install
                    verify: 触发一次提交,确认 hook 执行
阶段 7  bug 修复   → useTreeLazyLoad(mountedRef 回归)+ useFilter(防御性)
                    verify: 对应测试通过 + example StrictMode 手验懒加载不卡
阶段 8  example    → Expo 49 全套依赖 + metro blockList + App.tsx cardStyle→contentStyle + 移除 unimodules
                    verify: expo start 跑起来,导航正常,懒加载/编辑/排序 demo 可交互
```

## 4. 阶段 2 详解:import React 现代化(diff 最大的一步)

`jsx: 'react-jsx'` + `verbatimModuleSyntax: true` 组合下,清理需逐文件判断,不能一刀切。源码用法分布(已扫描):

- **6 个源文件用了 `React.xxx` 命名空间访问** → 保留 React 导入,改为 `import * as React from 'react'`(verbatimModuleSyntax 下更稳):
  `Table/index.tsx`、`context/LocaleContext.tsx`、`hooks/useCheckbox.ts`、`hooks/useRadio.ts`、`hooks/useSort.ts`、`types/index.ts`(后者仅类型引用,用 `import type`)
- **只用 JSX、没用 `React.xxx` 的文件**(`import React from 'react'` 但无命名空间访问)→ `react-jsx` 下可完全删掉 default `React` 导入,保留具名 hook 导入(`{ memo, forwardRef, ... }`)
- **测试文件同步处理**(`src/__tests__/` 下 12 处 import React)

判断规则:
1. 文件用了 `React.memo`/`React.useState`/`React.createRef`/`React.ReactNode` 等 → 保留 `import * as React from 'react'`(或把这些改成对应具名导入)
2. 文件只有 JSX、无 `React.` → 删 default,保留 `{ ... }` 具名部分;若整行只有 default 则整行删除
3. 类型引用(`React.ReactNode` 作为类型)→ 用 `import type { ReactNode }` 具名类型导入

**兜底:** 这一步靠 `yarn typescript` 零报错验证。verbatimModuleSyntax 会精确报出所有 unused/错误的 value import,逐条修到全绿即完成。

## 5. 需要修改的配置文件

### `tsconfig.json`
- 删除 `"importsNotUsedAsValues": "error"`
- 添加 `"verbatimModuleSyntax": true`
- `"jsx": "react"` → `"react-jsx"`
- `moduleResolution: "node"` 保持不变(CJS+ESM 双目标下安全)

### `package.json`(库)
- devDependencies 按 §2 升级
- 移除 `@types/react-native`
- `files` 字段清理:删除 `"android"`, `"ios"`, `"cpp"`, `"react-native-cool-table.podspec"`, `"!android/build"`, `"!ios/build"`(均不存在或无效)
- `husky` 配置块删除(迁移到 .husky/)
- `scripts.prepare`: `bob build` → `husky install && bob build`(或用 postinstall 装 husky)
- `bootstrap`/`pods` 脚本:pod-install 步骤无原生代码可移除(可选)

### `.husky/`(新建)
- `.husky/pre-commit`: `yarn lint && yarn typescript`
- `.husky/commit-msg`: `commitlint -E HUSKY_GIT_PARAMS`(husky 8 语法,`npx --no-install commitlint --edit $1`)

### example
- `example/package.json`: 按 §2 全套升级,建议用 `npx expo install --check` 锁版本
- `example/metro.config.js`: `blacklist` → `exclusionList`,`blacklistRE` → `blockList`,整体用 `getDefaultConfig(expo/metro-config)` + `mergeConfig` 包装
- `example/src/App.tsx`: 第 ~252 行 `cardStyle` → `contentStyle`(v6 破坏性,cardStyle 静默失效)
- `example/babel.config.js`: 不变(仅升 babel-preset-expo 版本)
- `example/app.json` / `example/index.js`: 不变

### CI(`.circleci/config.yml`)
- 不改。`cimg/node:18` 满足 RN 0.72;cache key 用 package.json checksum 自动失效
- 前置:推送前本地 `yarn install` 生成新 `yarn.lock`,否则 CI `--frozen-lockfile` 失败

## 6. Bug 修复详解(阶段 7)

### `useTreeLazyLoad` — mountedRef 永久失效(真实回归,medium)
`mountedRef = useRef(true)`,cleanup 置 false,但 effect body 无重置。React 18 StrictMode 下:mount→cleanup(置 false)→remount(useRef 返回同一对象,初值被忽略,仍 false)→永久 false。后续所有 `triggerLoad` resolve 都命中 `if (!mountedRef.current) return`,children 不存、loadingKeys 不清、spinner 永转。

**修复:** effect body 顶部加 `mountedRef.current = true`:
```ts
useEffect(() => {
  mountedRef.current = true;
  return () => { mountedRef.current = false; };
}, []);
```

### `useFilter` — lastChangedColumnKeyRef 批处理漏报(防御性,low)
`lastChangedColumnKeyRef.current = colKey` 在函数式 setState 前同步写。React 18 自动批处理下,同 tick 两次不同列 `setFilterState`,两次 ref 写都在 render 前完成,ref 只剩最后一列,`useUpdateEffect` 只上报最后一列。**注意:实际 `filterStates` 数据始终正确(函数式 updater 安全),只影响 `onFilterChange` 通知,且库自身 UI 每次交互只调一次,不触发。** 属防御性改进。

**修复:** 把 changedColumnKey 编码进 state 本身(而非独立 ref),使 key 与 state 批次原子一致。`useUpdateEffect` 从 state 快照读,不从 ref 读。

## 7. 风险与缓解

| 风险 | 等级 | 缓解 |
|---|---|---|
| husky 4→8 只改版本不迁移配置 → hooks 静默失效 | 高 | 阶段 6 显式建 .husky/ 脚本并手验触发 |
| verbatimModuleSyntax 对源码要求更严 | 中 | 阶段 2 全量 tsc 验证,逐条修到零报错 |
| jest 26→29 跨两版本,fake-timers/async 变化 | 中 | 阶段 3 完整跑 test,修失败用例 |
| example metro blacklist 已移除 → bundler 启动崩溃 | 高 | 阶段 8 首先改 metro.config |
| RNTL 11→12 更严格的 act() 检查 | 低 | 阶段 3 更新测试写法 |
| react-navigation cardStyle 静默失效 → 背景白屏 | 中 | 阶段 8 改 contentStyle |
| yarn.lock 不同步 → CI --frozen-lockfile 失败 | 中 | 推送前本地 yarn install |

## 8. 已知的 pre-existing 测试失败(非本次引入)

项目记忆记录:`inlineEdit` 的 `onEditCancel` 测试与实现契约矛盾,是 pre-existing 失败,非回归。阶段 0 基线快照会捕获它,阶段 3 判定 test 是否"全绿"时应把它作为已知豁免,不因它阻塞。

## 9. 成功标准

1. `yarn typescript` 零报错(TS5 + verbatimModuleSyntax + react-jsx)
2. `yarn test` 通过(除 §8 已知豁免)
3. `yarn lint` 零报错(eslint 8 + prettier 3)
4. `yarn prepare` 产出完整 `lib/{commonjs,module,typescript}`
5. husky hooks 提交时正确触发
6. `useTreeLazyLoad` 懒加载在 StrictMode 下不卡死(example 手验)
7. example 在 Expo 49 下 `expo start` 跑起来,核心 demo(懒加载/编辑/排序/固定列)可交互
8. 库对外 API 完全不变(compound component 契约、props 类型不动)
