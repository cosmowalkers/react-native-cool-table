import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';

import BasicTableDemo from '../demos/BasicTableDemo';
import SortableTableDemo from '../demos/SortableTableDemo';
import ExpandableTableDemo from '../demos/ExpandableTableDemo';
import EmptyStateDemo from '../demos/EmptyStateDemo';
import FixedColumnDemo from '../demos/FixedColumnDemo';
import RightFixedDemo from '../demos/RightFixedDemo';
import CustomRenderDemo from '../demos/CustomRenderDemo';
import InteractiveDemo from '../demos/InteractiveDemo';
import ComprehensiveDemo from '../demos/ComprehensiveDemo';
import PerformanceDemo from '../demos/PerformanceDemo';
import MultiSortDemo from '../demos/MultiSortDemo';
import CheckboxRadioDemo from '../demos/CheckboxRadioDemo';
import FilterDemo from '../demos/FilterDemo';
import StripeBorderDemo from '../demos/StripeBorderDemo';
import ResizeDemo from '../demos/ResizeDemo';
import GroupedHeaderDemo from '../demos/GroupedHeaderDemo';
import CellMergeDemo from '../demos/CellMergeDemo';
import DragSortDemo from '../demos/DragSortDemo';
import PaginationDemo from '../demos/PaginationDemo';
import EllipsisDemo from '../demos/EllipsisDemo';
import EditDemo from '../demos/EditDemo';
import SearchDemo from '../demos/SearchDemo';

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
  multiSort: MultiSortDemo,
  checkboxRadio: CheckboxRadioDemo,
  filter: FilterDemo,
  stripeBorder: StripeBorderDemo,
  resize: ResizeDemo,
  groupedHeader: GroupedHeaderDemo,
  cellMerge: CellMergeDemo,
  dragSort: DragSortDemo,
  pagination: PaginationDemo,
  ellipsis: EllipsisDemo,
  edit: EditDemo,
  search: SearchDemo,
};

type DemoScreenProps = StackScreenProps<RootStackParamList, 'Demo'>;

const DemoScreen: React.FC<DemoScreenProps> = ({ route }) => {
  const { demoId } = route.params;
  const DemoComponent = DEMO_COMPONENTS[demoId] ?? BasicTableDemo;

  return (
    <View style={styles.container}>
      <DemoComponent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default DemoScreen;
