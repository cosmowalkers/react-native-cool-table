/**
 * Theme token definitions for Light/Dark mode
 * 活泼多彩风格 — 每个功能分组有独特配色
 */

export interface ICategoryColor {
  bg: string;
  accent: string;
  icon: string;
}

export interface ITheme {
  name: 'light' | 'dark';
  colors: {
    // 基础色
    background: string;
    surface: string;
    surfaceElevated: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    primary: string;
    primaryLight: string;

    // 状态色
    success: string;
    warning: string;
    error: string;

    // 功能分组配色（6 个分组）
    categoryColors: Record<string, ICategoryColor>;

    // 表格相关
    headerBg: string;
    headerText: string;
    rowBorder: string;
    stripeBg: string;

    // 卡片
    cardShadow: string;

    // 按钮/交互
    buttonBg: string;
    buttonText: string;
  };
}

// ── Light Theme ──────────────────────────────────────────
export const lightTheme: ITheme = {
  name: 'light',
  colors: {
    background: '#F8F9FE',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    text: '#1A1D2E',
    textSecondary: '#5C6078',
    textMuted: '#9CA3B8',
    border: '#E8EAF0',
    primary: '#6366F1',
    primaryLight: '#EEF2FF',

    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',

    categoryColors: {
      basic: { bg: '#EFF6FF', accent: '#3B82F6', icon: '#2563EB' },
      sortFilter: { bg: '#F5F3FF', accent: '#8B5CF6', icon: '#7C3AED' },
      layout: { bg: '#FDF2F8', accent: '#EC4899', icon: '#DB2777' },
      interact: { bg: '#ECFDF5', accent: '#10B981', icon: '#059669' },
      tree: { bg: '#FFFBEB', accent: '#F59E0B', icon: '#D97706' },
      advanced: { bg: '#EEF2FF', accent: '#6366F1', icon: '#4F46E5' },
    },

    headerBg: '#F9FAFB',
    headerText: '#374151',
    rowBorder: '#F0F1F3',
    stripeBg: '#FAFBFC',

    cardShadow: 'rgba(99, 102, 241, 0.08)',

    buttonBg: '#6366F1',
    buttonText: '#FFFFFF',
  },
};

// ── Dark Theme ───────────────────────────────────────────
export const darkTheme: ITheme = {
  name: 'dark',
  colors: {
    background: '#0F1225',
    surface: '#1A1D35',
    surfaceElevated: '#232747',
    text: '#F0F1F5',
    textSecondary: '#A0A5BD',
    textMuted: '#6B7194',
    border: '#2D3258',
    primary: '#818CF8',
    primaryLight: '#1E2148',

    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',

    categoryColors: {
      basic: { bg: '#1A2540', accent: '#60A5FA', icon: '#93C5FD' },
      sortFilter: { bg: '#221A40', accent: '#A78BFA', icon: '#C4B5FD' },
      layout: { bg: '#2A1530', accent: '#F472B6', icon: '#F9A8D4' },
      interact: { bg: '#0D2920', accent: '#34D399', icon: '#6EE7B7' },
      tree: { bg: '#2A2010', accent: '#FBBF24', icon: '#FDE68A' },
      advanced: { bg: '#1E2148', accent: '#818CF8', icon: '#A5B4FC' },
    },

    headerBg: '#1A1D35',
    headerText: '#D1D5E4',
    rowBorder: '#252952',
    stripeBg: '#171A30',

    cardShadow: 'rgba(0, 0, 0, 0.3)',

    buttonBg: '#818CF8',
    buttonText: '#0F1225',
  },
};

// ── Category key mapping ─────────────────────────────────
// Maps section title to category key for color lookup
export const SECTION_CATEGORY_MAP: Record<string, string> = {
  '\u57FA\u7840\u5C55\u793A': 'basic',
  '\u6392\u5E8F\u4E0E\u7B5B\u9009': 'sortFilter',
  '\u5E03\u5C40\u589E\u5F3A': 'layout',
  '\u4EA4\u4E92\u7F16\u8F91': 'interact',
  '\u6811\u5F62\u4E0E\u5C55\u5F00': 'tree',
  '\u8FDB\u9636\u529F\u80FD': 'advanced',
};
