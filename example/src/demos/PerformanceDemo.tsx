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
import { renderSignedAmount } from '../utils/renderUtils';
import { colors } from '../styles/commonStyles';

const dataSizeOptions = [100, 500, 1000, 5000];

const PerformanceDemo: React.FC = () => {
  const [dataSize, setDataSize] = useState(100);
  const [renderTime, setRenderTime] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);

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
        render: renderSignedAmount,
      },
      {
        key: 'date',
        title: '时间',
        width: 90,
        align: 'center',
      },
    ],
    []
  );

  const controlPanel = (
    <View style={styles.controls}>
      <Text style={styles.controlLabel}>数据量:</Text>
      <View style={styles.sizeButtons}>
        {dataSizeOptions.map((size) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.sizeButton,
              dataSize === size && styles.activeSizeButton,
            ]}
            onPress={() => handleDataSizeChange(size)}
          >
            <Text
              style={[
                styles.sizeButtonText,
                dataSize === size && styles.activeSizeButtonText,
              ]}
            >
              {size}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.timerDisplay}>
        <Text style={styles.timerLabel}>
          当前数据量: {dataSize.toLocaleString()} 条
        </Text>
        {renderTime !== null && (
          <Text style={styles.timerValue}>渲染耗时: {renderTime}ms</Text>
        )}
      </View>
    </View>
  );

  const tipsCard = (
    <View style={styles.tipsCard}>
      <Text style={styles.tipsTitle}>性能优化建议:</Text>
      <Text style={styles.tipItem}>1. 使用 keyExtractor 提供稳定的 key</Text>
      <Text style={styles.tipItem}>2. 避免在 render 函数中创建新对象</Text>
      <Text style={styles.tipItem}>
        3. 使用 useMemo / useCallback 缓存列和渲染
      </Text>
      <Text style={styles.tipItem}>
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
  controlLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  sizeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  sizeButton: {
    backgroundColor: '#f5f5f5',
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
    fontWeight: '500',
  },
  activeSizeButtonText: {
    color: colors.white,
  },
  timerDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  timerValue: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  tipsCard: {
    margin: 16,
    marginTop: 0,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },
  tipItem: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 3,
    lineHeight: 16,
  },
});

export default PerformanceDemo;
