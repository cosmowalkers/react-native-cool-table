import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import type { ITableColumn } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';
import { generateMembers } from '../utils/dataUtils';
import {
  renderInitialsAvatar,
  renderPointsProgress,
  renderPrice,
  renderTags,
  renderActionButtons,
} from '../utils/renderUtils';
import { colors } from '../styles/commonStyles';

const CustomRenderDemo: React.FC = () => {
  const data = useMemo(() => generateMembers(10), []);

  const renderMemberInfo = useCallback((params: any) => {
    const { row } = params;
    return (
      <View style={styles.memberInfoContainer}>
        {renderInitialsAvatar({ ...params, val: row.name })}
        <View style={styles.memberDetail}>
          <Text style={styles.memberName}>{row.name}</Text>
          <Text style={styles.memberPhone}>{row.phone}</Text>
        </View>
      </View>
    );
  }, []);

  const renderLevel = useCallback((params: any) => {
    const { val } = params;
    const levelConfig: Record<string, { color: string; bgColor: string }> = {
      普通: { color: '#999', bgColor: '#f5f5f5' },
      银卡: { color: '#8c8c8c', bgColor: '#f5f5f5' },
      金卡: { color: '#d4b106', bgColor: '#fffbe6' },
      黑卡: { color: '#fff', bgColor: '#262626' },
    };
    const config = levelConfig[val as string] ?? levelConfig['普通'];

    return (
      <View style={[styles.levelBadge, { backgroundColor: config.bgColor }]}>
        <Text style={[styles.levelText, { color: config.color }]}>{val}</Text>
      </View>
    );
  }, []);

  const renderActions = useCallback((params: any) => {
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
    return renderActionButtons(params, actions);
  }, []);

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
        render: renderPointsProgress,
      },
      {
        key: 'totalSpend',
        title: '累计消费',
        width: 90,
        align: 'right',
        render: renderPrice,
      },
      {
        key: 'tags',
        title: '标签',
        width: 120,
        align: 'left',
        render: renderTags,
      },
      {
        key: 'actions',
        title: '操作',
        width: 100,
        align: 'center',
        render: renderActions,
      },
    ],
    [renderMemberInfo, renderLevel, renderActions]
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
  memberName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  memberPhone: {
    fontSize: 12,
    color: colors.textLight,
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
