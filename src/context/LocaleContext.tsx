import React, { createContext, useContext, useMemo } from 'react';
import type { ILocale } from '../types';
import zhCN from '../locale/zhCN';

/**
 * LocaleContext 存储用户通过 LocaleProvider 传入的 locale。
 * 默认值为 null 表示没有 Provider 包裹，useLocale 会回退到 zhCN。
 */
const LocaleContext = createContext<ILocale | null>(null);

interface ILocaleProviderProps {
  locale: ILocale;
  children: React.ReactNode;
}

/**
 * 包裹在应用外层，为所有 CoolTable / ColumnManager 提供统一的文案。
 *
 * ```tsx
 * import { LocaleProvider, enUS } from 'react-native-cool-table';
 *
 * <LocaleProvider locale={enUS}>
 *   <App />
 * </LocaleProvider>
 * ```
 */
export const LocaleProvider = ({ locale, children }: ILocaleProviderProps) => {
  // Memoize to avoid unnecessary re-renders when parent re-renders with same locale
  const value = useMemo(() => locale, [locale]);
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
};

/**
 * 获取当前生效的 locale。
 *
 * 合并优先级（从高到低）：
 *   1. overrides —— Table 的 locale prop
 *   2. LocaleProvider —— 应用级 Provider
 *   3. zhCN —— 库内置默认值
 */
export const useLocale = (overrides?: ILocale): Required<ILocale> => {
  const providerLocale = useContext(LocaleContext);
  return useMemo(() => {
    // zhCN 提供全量默认值，provider 和 prop 逐层覆盖
    // 因为 zhCN 是 Required<ILocale>，合并结果一定是完整的
    const merged = { ...zhCN, ...providerLocale, ...overrides };
    return merged as Required<ILocale>;
  }, [providerLocale, overrides]);
};

export { LocaleContext };
