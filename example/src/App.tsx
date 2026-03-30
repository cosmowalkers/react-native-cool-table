import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';

import { StyleSheet, View, StatusBar, SafeAreaView } from 'react-native';

import HomeScreen from './screens/HomeScreen';
import type { DemoSectionData } from './screens/HomeScreen';
import DemoDetailHeader from './components/DemoDetailHeader';
import BasicTableDemo from './demos/BasicTableDemo';
import SortableTableDemo from './demos/SortableTableDemo';
import ExpandableTableDemo from './demos/ExpandableTableDemo';
import EmptyStateDemo from './demos/EmptyStateDemo';
import FixedColumnDemo from './demos/FixedColumnDemo';
import RightFixedDemo from './demos/RightFixedDemo';
import CustomRenderDemo from './demos/CustomRenderDemo';
import InteractiveDemo from './demos/InteractiveDemo';
import ComprehensiveDemo from './demos/ComprehensiveDemo';
import PerformanceDemo from './demos/PerformanceDemo';

const DEMO_COMPONENTS: Record<string, React.ComponentType<any>> = {
  basic: BasicTableDemo,
  sortable: SortableTableDemo,
  expandable: ExpandableTableDemo,
  empty: EmptyStateDemo,
  fixed: FixedColumnDemo,
  rightFixed: RightFixedDemo,
  custom: CustomRenderDemo,
  interactive: InteractiveDemo,
  comprehensive: ComprehensiveDemo,
  performance: PerformanceDemo,
};

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

const ALL_ITEMS = SECTIONS.flatMap((s) => s.items);

type Screen = 'home' | 'demo';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [currentDemo, setCurrentDemo] = useState('basic');

  const handleSelectDemo = useCallback((id: string) => {
    setCurrentDemo(id);
    setScreen('demo');
  }, []);

  const handleBack = useCallback(() => {
    setScreen('home');
  }, []);

  const currentTitle = useMemo(() => {
    const item = ALL_ITEMS.find((d) => d.id === currentDemo);
    return item?.title ?? '';
  }, [currentDemo]);

  const DemoComponent = DEMO_COMPONENTS[currentDemo] ?? BasicTableDemo;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {screen === 'home' ? (
        <HomeScreen sections={SECTIONS} onSelectDemo={handleSelectDemo} />
      ) : (
        <View style={styles.demoContainer}>
          <DemoDetailHeader title={currentTitle} onBack={handleBack} />
          <View style={styles.demoContent}>
            <DemoComponent />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  demoContainer: {
    flex: 1,
  },
  demoContent: {
    flex: 1,
  },
});
