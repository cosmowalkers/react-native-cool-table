import type { FlexAlignType } from 'react-native';

export const ALIGN_MAP: Record<string, FlexAlignType> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

export const SORT_STATUS_MAP = {
  // 正序
  asc: 'asc',
  // 倒序
  desc: 'desc',
} as const;

export const EMPTY_IMAGE = require('../assets/empty.png');
