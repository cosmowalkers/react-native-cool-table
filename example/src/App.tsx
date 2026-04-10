import * as React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import type { RootStackParamList } from './navigation/types';
import type { DemoSectionData } from './screens/HomeScreen';
import HomeScreen from './screens/HomeScreen';
import DemoScreen from './screens/DemoScreen';
import { colors } from './styles/commonStyles';

const Stack = createStackNavigator<RootStackParamList>();

const SECTIONS: DemoSectionData[] = [
  {
    title: '基础功能',
    items: [
      {
        id: 'basic',
        title: '商品列表',
        description: '商品名称、分类、价格、销量的基础展示',
        icon: '🛍',
        iconBg: '#E6F7FF',
        iconColor: '#1890ff',
      },
      {
        id: 'sortable',
        title: '收支明细',
        description: '按金额排序的收支流水，收入绿/支出红',
        icon: '💰',
        iconBg: '#FFF7E6',
        iconColor: '#fa8c16',
      },
      {
        id: 'expandable',
        title: '订单列表',
        description: '展开订单查看商品明细、规格和小计',
        icon: '📦',
        iconBg: '#F6FFED',
        iconColor: '#52c41a',
      },
      {
        id: 'empty',
        title: '商品搜索',
        description: '关键词搜索商品，无结果时展示空状态',
        icon: '🔍',
        iconBg: '#F5F5F5',
        iconColor: '#999',
      },
    ],
  },
  {
    title: '高级特性',
    items: [
      {
        id: 'fixed',
        title: '规格价格表',
        description: '商品名固定左侧，各尺码价格横向滚动',
        icon: '📐',
        iconBg: '#FFF0F6',
        iconColor: '#eb2f96',
      },
      {
        id: 'rightFixed',
        title: '售后工单',
        description: '工单号左固定、操作列右固定',
        icon: '🔧',
        iconBg: '#F9F0FF',
        iconColor: '#722ed1',
      },
      {
        id: 'custom',
        title: '会员管理',
        description: '头像、等级徽章、积分进度、消费标签',
        icon: '👤',
        iconBg: '#FEFFE6',
        iconColor: '#d4b106',
      },
    ],
  },
  {
    title: 'P0 新增功能',
    items: [
      {
        id: 'multiSort',
        title: '多列排序',
        description: '多列排序，显示排序优先级序号',
        icon: '↕',
        iconBg: '#F0F5FF',
        iconColor: '#2F54EB',
      },
      {
        id: 'checkboxRadio',
        title: '多选 & 单选',
        description: 'Checkbox 全选/半选，Radio 单选',
        icon: '☑',
        iconBg: '#E6FFFB',
        iconColor: '#13c2c2',
      },
      {
        id: 'filter',
        title: '列筛选',
        description: '列头筛选面板，多选/单选筛选',
        icon: '▼',
        iconBg: '#FFF7E6',
        iconColor: '#fa8c16',
      },
      {
        id: 'stripeBorder',
        title: '条纹 & 边框',
        description: '条纹行、边框模式、Loading、Footer 汇总',
        icon: '▦',
        iconBg: '#F6FFED',
        iconColor: '#52c41a',
      },
    ],
  },
  {
    title: 'P0+P1 新增功能',
    items: [
      {
        id: 'resize',
        title: '列宽调整',
        description: '拖拽表头右边缘调整列宽',
        icon: '↔',
        iconBg: '#E6F7FF',
        iconColor: '#1890ff',
      },
      {
        id: 'groupedHeader',
        title: '分组表头',
        description: '多级分组表头，支持嵌套子列',
        icon: '▤',
        iconBg: '#F0F5FF',
        iconColor: '#2F54EB',
      },
      {
        id: 'cellMerge',
        title: '单元格合并',
        description: '单元格列合并（colspan）',
        icon: '⊞',
        iconBg: '#FFF0F6',
        iconColor: '#eb2f96',
      },
      {
        id: 'dragSort',
        title: '行拖拽排序',
        description: '拖拽手柄上下移动排序行',
        icon: '☰',
        iconBg: '#F6FFED',
        iconColor: '#52c41a',
      },
      {
        id: 'pagination',
        title: '分页',
        description: '分页展示，翻页和切换每页条数',
        icon: '◁',
        iconBg: '#FFF7E6',
        iconColor: '#fa8c16',
      },
      {
        id: 'ellipsis',
        title: '省略+提示',
        description: '文本省略 + 长按查看完整内容',
        icon: '…',
        iconBg: '#E6FFFB',
        iconColor: '#13c2c2',
      },
      {
        id: 'edit',
        title: '单元格编辑',
        description: '单击编辑，文本/数字/下拉选择',
        icon: '✎',
        iconBg: '#F9F0FF',
        iconColor: '#722ed1',
      },
      {
        id: 'search',
        title: '搜索高亮',
        description: '关键词匹配高亮单元格文本',
        icon: '🔎',
        iconBg: '#FEFFE6',
        iconColor: '#d4b106',
      },
    ],
  },
  {
    title: '交互场景',
    items: [
      {
        id: 'interactive',
        title: '购物车',
        description: '数量加减、小计计算、删除商品',
        icon: '🛒',
        iconBg: '#E6FFFB',
        iconColor: '#13c2c2',
      },
      {
        id: 'comprehensive',
        title: '库存管理',
        description: '排序+固定列+SKU展开的综合场景',
        icon: '📊',
        iconBg: '#E6F7FF',
        iconColor: '#1890ff',
      },
    ],
  },
  {
    title: '性能',
    items: [
      {
        id: 'performance',
        title: '交易流水',
        description: '100~5000 条交易记录性能测试',
        icon: '⚡',
        iconBg: '#FFF1F0',
        iconColor: '#ff4d4f',
      },
    ],
  },
];

const HomeScreenWrapper: React.FC = () => <HomeScreen sections={SECTIONS} />;

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 16,
            color: colors.text,
          },
          cardStyle: {
            backgroundColor: '#f5f5f5',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreenWrapper}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Demo"
          component={DemoScreen}
          options={({ route }) => ({
            title: route.params.title,
            headerBackTitle: '返回',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
