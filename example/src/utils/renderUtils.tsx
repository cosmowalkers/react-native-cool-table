import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { ITableColumnParams } from 'react-native-cool-table';

// ===== Default render-safe colors =====
const defaultColors = {
  primary: '#6366F1',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  text: '#1A1D2E',
  textSecondary: '#5C6078',
  textLight: '#9CA3B8',
};

export type TRenderColors = typeof defaultColors;

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

// ===== 工厂函数：创建带主题色的 render 函数 =====
export function createThemedRenderUtils(c: Partial<TRenderColors> = {}) {
  const colors = { ...defaultColors, ...c };

  const renderPrice = ({ val }: ITableColumnParams) => {
    const numVal = val as unknown as number;
    return (
      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: colors.text,
          textAlign: 'right',
        }}
      >
        ¥{numVal?.toLocaleString()}
      </Text>
    );
  };

  const renderSignedAmount = ({ val }: ITableColumnParams) => {
    const numVal = val as unknown as number;
    const isPositive = numVal >= 0;
    const color = isPositive ? colors.success : colors.error;
    const prefix = isPositive ? '+' : '';
    return (
      <Text
        style={{ fontSize: 14, fontWeight: '600', color, textAlign: 'right' }}
      >
        {prefix}¥{Math.abs(numVal).toLocaleString()}
      </Text>
    );
  };

  const renderStatusBadge = (
    { val }: ITableColumnParams,
    statusConfig?: Record<
      string,
      { color: string; bgColor?: string; text?: string }
    >
  ) => {
    const config = statusConfig ?? {
      在职: { color: '#52c41a', bgColor: 'rgba(82, 196, 26, 0.15)' },
      试用期: { color: '#fa8c16', bgColor: 'rgba(250, 140, 22, 0.15)' },
      离职: { color: '#ff4d4f', bgColor: 'rgba(255, 77, 79, 0.15)' },
      online: {
        color: '#52c41a',
        bgColor: 'rgba(82, 196, 26, 0.15)',
        text: '在线',
      },
      offline: {
        color: '#999',
        bgColor: 'rgba(153, 153, 153, 0.15)',
        text: '离线',
      },
      busy: {
        color: '#fa8c16',
        bgColor: 'rgba(250, 140, 22, 0.15)',
        text: '忙碌',
      },
    };
    const statusInfo = config[val as string] ?? {
      color: '#999',
      bgColor: 'rgba(153, 153, 153, 0.15)',
    };
    return (
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: statusInfo.bgColor ?? 'rgba(153, 153, 153, 0.15)',
          },
        ]}
      >
        <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>
          {statusInfo.text ?? (val as string)}
        </Text>
      </View>
    );
  };

  const renderProgress = ({ val }: ITableColumnParams) => {
    const numVal = val as unknown as number;
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${numVal}%`,
                backgroundColor:
                  numVal === 100 ? colors.success : colors.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {numVal}%
        </Text>
      </View>
    );
  };

  const renderPointsProgress = ({ row }: ITableColumnParams) => {
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
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {points.toLocaleString()}
        </Text>
      </View>
    );
  };

  const renderPriority = (
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

  const renderActionButtons = (
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
          style={[
            styles.actionButton,
            { backgroundColor: colors.primary },
            action.style,
          ]}
          onPress={() => action.onPress(row)}
        >
          <Text style={[styles.actionButtonText, action.textStyle]}>
            {action.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTags = ({ val }: ITableColumnParams, maxShow = 2) => {
    if (!Array.isArray(val)) return null;
    const tags = val as string[];
    return (
      <View style={styles.tagsContainer}>
        {tags.slice(0, maxShow).map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={[styles.tagText, { color: colors.primary }]}>
              {tag}
            </Text>
          </View>
        ))}
        {tags.length > maxShow && (
          <Text style={[styles.moreTagsText, { color: colors.textLight }]}>
            +{tags.length - maxShow}
          </Text>
        )}
      </View>
    );
  };

  const renderStock = ({ val }: ITableColumnParams) => {
    const numVal = val as unknown as number;
    const color =
      numVal === 0 ? colors.error : numVal < 50 ? colors.warning : colors.text;
    return <Text style={[styles.stockText, { color }]}>{numVal}</Text>;
  };

  return {
    renderPrice,
    renderSignedAmount,
    renderStatusBadge,
    renderProgress,
    renderPointsProgress,
    renderPriority,
    renderActionButtons,
    renderTags,
    renderStock,
  };
}

// ===== 向后兼容：使用默认颜色的导出 =====
const defaults = createThemedRenderUtils();
export const renderPrice = defaults.renderPrice;
export const renderSignedAmount = defaults.renderSignedAmount;
export const renderStatusBadge = defaults.renderStatusBadge;
export const renderProgress = defaults.renderProgress;
export const renderPointsProgress = defaults.renderPointsProgress;
export const renderPriority = defaults.renderPriority;
export const renderActionButtons = defaults.renderActionButtons;
export const renderTags = defaults.renderTags;
export const renderStock = defaults.renderStock;

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
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
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
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 2,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  stockText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
