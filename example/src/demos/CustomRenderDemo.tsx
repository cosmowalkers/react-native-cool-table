import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import type { ITableColumn } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';
import { generateMembers } from '../utils/dataUtils';
import {
  renderInitialsAvatar,
  createThemedRenderUtils,
} from '../utils/renderUtils';
import { useTheme } from '../context/ThemeContext';

const CustomRenderDemo: React.FC = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const themedRenders = useMemo(
    () => createThemedRenderUtils(colors),
    [colors]
  );
  const data = useMemo(() => generateMembers(10), []);

  const themedStyles = useMemo(
    () => ({
      memberName: {
        fontSize: 14,
        fontWeight: 'bold' as const,
        color: colors.text,
        marginBottom: 2,
      },
      memberPhone: {
        fontSize: 12,
        color: colors.textMuted,
      },
    }),
    [colors]
  );

  const renderMemberInfo = useCallback(
    (params: any) => {
      const { row } = params;
      return (
        <View style={styles.memberInfoContainer}>
          {renderInitialsAvatar({ ...params, val: row.name })}
          <View style={styles.memberDetail}>
            <Text style={themedStyles.memberName}>{row.name}</Text>
            <Text style={themedStyles.memberPhone}>{row.phone}</Text>
          </View>
        </View>
      );
    },
    [themedStyles]
  );

  const renderLevel = useCallback(
    (params: any) => {
      const { val } = params;
      const levelConfig: Record<
        string,
        { color: string; bgColor: string; borderColor?: string }
      > = {
        普通: { color: colors.textMuted, bgColor: colors.surfaceElevated },
        银卡: { color: colors.textSecondary, bgColor: colors.surfaceElevated },
        金卡: { color: '#d4b106', bgColor: 'rgba(212, 177, 6, 0.15)' },
        // 黑卡：黑底金字。暗色模式下加金色描边，避免与深色背景融为一体
        黑卡: {
          color: '#F5C542',
          bgColor: theme.name === 'dark' ? '#000000' : '#262626',
          borderColor: '#F5C542',
        },
      };
      const config = levelConfig[val as string] ?? levelConfig['普通'];

      return (
        <View
          style={[
            styles.levelBadge,
            { backgroundColor: config.bgColor },
            config.borderColor
              ? {
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: config.borderColor,
                }
              : null,
          ]}
        >
          <Text style={[styles.levelText, { color: config.color }]}>{val}</Text>
        </View>
      );
    },
    [colors, theme.name]
  );

  const renderActions = useCallback(
    (params: any) => {
      const actions = [
        {
          text: '详情',
          onPress: (row: any) =>
            Alert.alert(
              '会员详情',
              `姓名: ${row.name}\n等级: ${row.level}\n积分: ${row.points}`
            ),
        },
      ];
      return themedRenders.renderActionButtons(params, actions);
    },
    [themedRenders]
  );

  const columns: ITableColumn[] = useMemo(
    () => [
      {
        key: 'name',
        title: '会员信息',
        width: 160,
        align: 'left',
        render: renderMemberInfo,
      },
      {
        key: 'level',
        title: '等级',
        width: 70,
        align: 'center',
        render: renderLevel,
      },
      {
        key: 'points',
        title: '积分',
        width: 90,
        align: 'center',
        render: themedRenders.renderPointsProgress,
      },
      {
        key: 'totalSpend',
        title: '累计消费',
        width: 90,
        align: 'right',
        render: themedRenders.renderPrice,
      },
      {
        key: 'tags',
        title: '标签',
        width: 120,
        align: 'left',
        render: themedRenders.renderTags,
      },
      {
        key: 'actions',
        title: '操作',
        width: 100,
        align: 'center',
        render: renderActions,
      },
    ],
    [renderMemberInfo, renderLevel, renderActions, themedRenders]
  );

  return (
    <DemoLayout
      title="会员管理"
      description="展示会员头像、等级徽章、积分进度、消费金额、标签等自定义渲染"
      scrollable
    >
      <TableContainer
        data={data}
        columns={columns}
        keyExtractor={(item) => String(item.id)}
      />
    </DemoLayout>
  );
};

const styles = StyleSheet.create({
  memberInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  memberDetail: {
    flex: 1,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'center',
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default CustomRenderDemo;
