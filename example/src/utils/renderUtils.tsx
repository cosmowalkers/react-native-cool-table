import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { ITableColumnParams } from 'react-native-cool-table';
import { colors } from '../styles/commonStyles';

// ===== 头像 =====
const avatarColors = [
  '#1890ff',
  '#52c41a',
  '#fa8c16',
  '#722ed1',
  '#eb2f96',
  '#13c2c2',
  '#2f54eb',
  '#faad14',
];

export const renderInitialsAvatar = ({ val }: ITableColumnParams) => {
  const name = val as string;
  const initial = name?.charAt(0) ?? '?';
  const colorIndex =
    name?.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) ?? 0;
  const bgColor = avatarColors[colorIndex % avatarColors.length];
  return (
    <View style={[styles.initialsAvatar, { backgroundColor: bgColor }]}>
      <Text style={styles.initialsText}>{initial}</Text>
    </View>
  );
};

// ===== 金额 =====
export const renderPrice = ({ val }: ITableColumnParams) => {
  const numVal = val as unknown as number;
  return <Text style={styles.priceText}>¥{numVal?.toLocaleString()}</Text>;
};

export const renderSignedAmount = ({ val }: ITableColumnParams) => {
  const numVal = val as unknown as number;
  const isPositive = numVal >= 0;
  const color = isPositive ? colors.success : colors.error;
  const prefix = isPositive ? '+' : '';
  return (
    <Text style={[styles.amountText, { color }]}>
      {prefix}¥{Math.abs(numVal).toLocaleString()}
    </Text>
  );
};

// ===== 状态徽章（浅底色+彩色文字）=====
export const renderStatusBadge = (
  { val }: ITableColumnParams,
  statusConfig?: Record<
    string,
    { color: string; bgColor?: string; text?: string }
  >
) => {
  const defaultConfig: Record<
    string,
    { color: string; bgColor?: string; text?: string }
  > = {
    在职: { color: '#52c41a', bgColor: '#f6ffed' },
    试用期: { color: '#fa8c16', bgColor: '#fff7e6' },
    离职: { color: '#ff4d4f', bgColor: '#fff1f0' },
    online: { color: '#52c41a', bgColor: '#f6ffed', text: '在线' },
    offline: { color: '#999', bgColor: '#f5f5f5', text: '离线' },
    busy: { color: '#fa8c16', bgColor: '#fff7e6', text: '忙碌' },
  };

  const config = statusConfig ?? defaultConfig;
  const statusInfo = config[val as string] ?? {
    color: '#999',
    bgColor: '#f5f5f5',
  };

  return (
    <View
      style={[
        styles.statusBadge,
        { backgroundColor: statusInfo.bgColor ?? '#f5f5f5' },
      ]}
    >
      <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>
        {statusInfo.text ?? (val as string)}
      </Text>
    </View>
  );
};

// ===== 进度条 =====
export const renderProgress = ({ val }: ITableColumnParams) => {
  const numVal = val as unknown as number;
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${numVal}%`,
              backgroundColor: numVal === 100 ? colors.success : colors.primary,
            },
          ]}
        />
      </View>
      <Text style={styles.progressText}>{numVal}%</Text>
    </View>
  );
};

// ===== 积分进度条 =====
export const renderPointsProgress = ({ row }: ITableColumnParams) => {
  const points = row.points as number;
  const max = row.maxPoints as number;
  const pct = Math.min(100, Math.round((points / max) * 100));
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${pct}%`, backgroundColor: '#faad14' },
          ]}
        />
      </View>
      <Text style={styles.progressText}>{points.toLocaleString()}</Text>
    </View>
  );
};

// ===== 优先级 =====
export const renderPriority = (
  { val, row }: ITableColumnParams,
  onPress?: (id: any, priority: string) => void
) => {
  const strVal = val as string;
  const priorityConfig: Record<string, { color: string; text: string }> = {
    high: { color: colors.error, text: '高' },
    medium: { color: colors.warning, text: '中' },
    low: { color: colors.success, text: '低' },
  };
  const config = priorityConfig[strVal] ?? { color: '#999', text: strVal };

  const content = (
    <View style={styles.priorityContainer}>
      <View style={[styles.priorityDot, { backgroundColor: config.color }]} />
      <Text style={[styles.priorityText, { color: config.color }]}>
        {config.text}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={() => onPress(row.id, strVal)}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
};

// ===== 操作按钮 =====
export const renderActionButtons = (
  { row }: ITableColumnParams,
  actions: Array<{
    text: string;
    onPress: (row: any) => void;
    style?: any;
    textStyle?: any;
  }>
) => (
  <View style={styles.actionsContainer}>
    {actions.map((action, index) => (
      <TouchableOpacity
        key={index}
        style={[styles.actionButton, action.style]}
        onPress={() => action.onPress(row)}
      >
        <Text style={[styles.actionButtonText, action.textStyle]}>
          {action.text}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

// ===== 标签 =====
export const renderTags = ({ val }: ITableColumnParams, maxShow = 2) => {
  if (!Array.isArray(val)) return null;
  const tags = val as string[];
  return (
    <View style={styles.tagsContainer}>
      {tags.slice(0, maxShow).map((tag, index) => (
        <View key={index} style={styles.tag}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      ))}
      {tags.length > maxShow && (
        <Text style={styles.moreTagsText}>+{tags.length - maxShow}</Text>
      )}
    </View>
  );
};

// ===== 库存数量 =====
export const renderStock = ({ val }: ITableColumnParams) => {
  const numVal = val as unknown as number;
  const color =
    numVal === 0 ? colors.error : numVal < 50 ? colors.warning : colors.text;
  return <Text style={[styles.stockText, { color }]}>{numVal}</Text>;
};

const styles = StyleSheet.create({
  initialsAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  initialsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'center',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  actionButtonText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingLeft: 8,
  },
  tag: {
    backgroundColor: '#e6f7ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 2,
  },
  tagText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },
  stockText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
