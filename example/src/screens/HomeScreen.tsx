import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../styles/commonStyles';

export interface DemoCardItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

export interface DemoSectionData {
  title: string;
  items: DemoCardItem[];
}

interface HomeScreenProps {
  sections: DemoSectionData[];
}

type HomeNavProp = StackNavigationProp<RootStackParamList, 'Home'>;

const DemoCard: React.FC<{
  item: DemoCardItem;
  onPress: () => void;
  isRight?: boolean;
}> = ({ item, onPress, isRight }) => (
  <TouchableOpacity
    style={[styles.card, isRight ? styles.cardRight : styles.cardLeft]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
      <Text style={[styles.iconText, { color: item.iconColor }]}>
        {item.icon}
      </Text>
    </View>
    <Text style={styles.cardTitle}>{item.title}</Text>
    <Text style={styles.cardDesc} numberOfLines={2}>
      {item.description}
    </Text>
  </TouchableOpacity>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ sections }) => {
  const navigation = useNavigation<HomeNavProp>();

  const handleSelectDemo = useCallback(
    (item: DemoCardItem) => {
      navigation.navigate('Demo', { demoId: item.id, title: item.title });
    },
    [navigation]
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>CoolTable</Text>
        <Text style={styles.appSubtitle}>React Native 高性能表格组件</Text>
      </View>

      {sections.map((section) => {
        const pairs: DemoCardItem[][] = [];
        for (let i = 0; i < section.items.length; i += 2) {
          pairs.push(section.items.slice(i, i + 2));
        }

        return (
          <View key={section.title} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionLine} />
            </View>

            {pairs.map((pair, pairIndex) => (
              <View key={pairIndex} style={styles.cardRow}>
                <DemoCard
                  item={pair[0]}
                  onPress={() => handleSelectDemo(pair[0])}
                />
                {pair[1] ? (
                  <DemoCard
                    item={pair[1]}
                    isRight
                    onPress={() => handleSelectDemo(pair[1])}
                  />
                ) : (
                  <View style={styles.cardPlaceholder} />
                )}
              </View>
            ))}
          </View>
        );
      })}

      <View style={styles.footer}>
        <Text style={styles.footerText}>react-native-cool-table</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e8e8e8',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textLight,
    paddingHorizontal: 12,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardLeft: {},
  cardRight: {},
  cardPlaceholder: {
    width: '48%',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: colors.textLight,
  },
});

export default HomeScreen;
