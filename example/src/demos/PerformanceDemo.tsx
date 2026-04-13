import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { ITableColumn } from 'react-native-cool-table';
import DemoLayout from '../components/DemoLayout';
import TableContainer from '../components/TableContainer';
import { generateTradeRecords } from '../utils/dataUtils';
import { createThemedRenderUtils } from '../utils/renderUtils';
import { useTheme } from '../context/ThemeContext';

const dataSizeOptions = [100, 500, 1000, 5000];

const PerformanceDemo: React.FC = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const themedRenders = useMemo(
    () => createThemedRenderUtils(colors),
    [colors]
  );
  const [dataSize, setDataSize] = useState(100);
  const [renderTime, setRenderTime] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const themedStyles = useMemo(
    () => ({
      controlLabel: {
        fontSize: 14,
        fontWeight: '600' as const,
        color: colors.text,
        marginBottom: 8,
      },
      sizeButton: {
        backgroundColor: colors.border,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 6,
        marginRight: 8,
        marginBottom: 8,
      },
      activeSizeButton: {
        backgroundColor: colors.primary,
      },
      sizeButtonText: {
        fontSize: 13,
        color: colors.text,
        fontWeight: '500' as const,
      },
      activeSizeButtonText: {
        color: colors.surface,
      },
      timerLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '500' as const,
      },
      timerValue: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: '600' as const,
      },
      tipsCard: {
        margin: 16,
        marginTop: 0,
        padding: 12,
        backgroundColor: colors.surfaceElevated,
        borderRadius: 6,
      },
      tipsTitle: {
        fontSize: 14,
        fontWeight: 'bold' as const,
        color: colors.text,
        marginBottom: 6,
      },
      tipItem: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 3,
        lineHeight: 16,
      },
    }),
    [colors]
  );

  const data = useMemo(() => {
    startTimeRef.current = Date.now();
    return generateTradeRecords(dataSize);
  }, [dataSize]);

  useEffect(() => {
    setRenderTime(Date.now() - startTimeRef.current);
  }, [data]);

  const handleDataSizeChange = useCallback((size: number) => {
    setDataSize(size);
  }, []);

  const columns: ITableColumn[] = useMemo(
    () => [
      {
        key: 'id',
        title: '交易号',
        width: 120,
        align: 'left',
        textStyle: { fontWeight: 'bold' },
      },
      {
        key: 'type',
        title: '类型',
        width: 60,
        align: 'center',
      },
      {
        key: 'target',
        title: '对方',
        width: 100,
        align: 'left',
      },
      {
        key: 'amount',
        title: '金额',
        width: 90,
        align: 'right',
        render: themedRenders.renderSignedAmount,
      },
      {
        key: 'date',
        title: '时间',
        width: 90,
        align: 'center',
      },
    ],
    [themedRenders]
  );

  const controlPanel = (
    <View style={styles.controls}>
      <Text style={themedStyles.controlLabel}>数据量:</Text>
      <View style={styles.sizeButtons}>
        {dataSizeOptions.map((size) => (
          <TouchableOpacity
            key={size}
            style={[
              themedStyles.sizeButton,
              dataSize === size && themedStyles.activeSizeButton,
            ]}
            onPress={() => handleDataSizeChange(size)}
          >
            <Text
              style={[
                themedStyles.sizeButtonText,
                dataSize === size && themedStyles.activeSizeButtonText,
              ]}
            >
              {size}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.timerDisplay}>
        <Text style={themedStyles.timerLabel}>
          当前数据量: {dataSize.toLocaleString()} 条
        </Text>
        {renderTime !== null && (
          <Text style={themedStyles.timerValue}>渲染耗时: {renderTime}ms</Text>
        )}
      </View>
    </View>
  );

  const tipsCard = (
    <View style={themedStyles.tipsCard}>
      <Text style={themedStyles.tipsTitle}>性能优化建议:</Text>
      <Text style={themedStyles.tipItem}>
        1. 使用 keyExtractor 提供稳定的 key
      </Text>
      <Text style={themedStyles.tipItem}>
        2. 避免在 render 函数中创建新对象
      </Text>
      <Text style={themedStyles.tipItem}>
        3. 使用 useMemo / useCallback 缓存列和渲染
      </Text>
      <Text style={themedStyles.tipItem}>
        4. 合理设置 initialNumToRender 控制首屏数量
      </Text>
    </View>
  );

  return (
    <DemoLayout
      title="交易流水"
      description="测试大数据量下的表格渲染性能，支持切换不同数据量"
      extraInfo={controlPanel}
      scrollable
    >
      <TableContainer
        data={data}
        columns={columns}
        keyExtractor={(item) => String(item.id)}
      />
      {tipsCard}
    </DemoLayout>
  );
};

const styles = StyleSheet.create({
  controls: {
    marginTop: 16,
  },
  sizeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  timerDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default PerformanceDemo;
