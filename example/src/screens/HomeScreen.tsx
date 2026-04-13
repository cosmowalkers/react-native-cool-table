import React, { useCallback, useMemo } from 'react';
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
import { useTheme } from '../context/ThemeContext';
import type { ITheme, ICategoryColor } from '../styles/theme';
import { SECTION_CATEGORY_MAP } from '../styles/theme';

export interface DemoCardItem {
  id: string;
  title: string;
  description: string;
  icon: string;
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
  categoryColor: ICategoryColor;
  onPress: () => void;
  theme: ITheme;
}> = ({ item, categoryColor, onPress, theme }) => {
  const { colors } = theme;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          shadowColor: colors.cardShadow,
          borderColor: colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[styles.cardAccent, { backgroundColor: categoryColor.accent }]}
      />
      <View style={styles.cardContent}>
        <View
          style={[styles.iconCircle, { backgroundColor: categoryColor.bg }]}
        >
          <Text style={[styles.iconText, { color: categoryColor.icon }]}>
            {item.icon}
          </Text>
        </View>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {item.title}
        </Text>
        <Text
          style={[styles.cardDesc, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen: React.FC<HomeScreenProps> = ({ sections }) => {
  const navigation = useNavigation<HomeNavProp>();
  const { theme, isDark, toggleTheme } = useTheme();
  const { colors } = theme;

  const handleSelectDemo = useCallback(
    (item: DemoCardItem) => {
      navigation.navigate('Demo', { demoId: item.id, title: item.title });
    },
    [navigation]
  );

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        header: {
          paddingTop: 20,
          paddingBottom: 20,
          paddingHorizontal: 20,
          backgroundColor: colors.surface,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          shadowColor: colors.cardShadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 12,
          elevation: 4,
          marginBottom: 8,
        },
      }),
    [colors]
  );

  return (
    <ScrollView
      style={dynamicStyles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={dynamicStyles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.appTitle, { color: colors.primary }]}>
              CoolTable
            </Text>
            <Text style={[styles.appSubtitle, { color: colors.textSecondary }]}>
              React Native {'\u9AD8\u6027\u80FD\u8868\u683C\u7EC4\u4EF6'}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.themeToggle,
              {
                backgroundColor: isDark
                  ? colors.surfaceElevated
                  : colors.primaryLight,
              },
            ]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Text style={styles.themeToggleIcon}>
              {isDark ? '\u2600\uFE0F' : '\u{1F319}'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {sections.map((section) => {
        const categoryKey = SECTION_CATEGORY_MAP[section.title] || 'basic';
        const categoryColor =
          colors.categoryColors[categoryKey] || colors.categoryColors.basic;

        const pairs: DemoCardItem[][] = [];
        for (let i = 0; i < section.items.length; i += 2) {
          pairs.push(section.items.slice(i, i + 2));
        }

        return (
          <View key={section.title} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionDot,
                  { backgroundColor: categoryColor.accent },
                ]}
              />
              <Text
                style={[styles.sectionTitle, { color: categoryColor.accent }]}
              >
                {section.title}
              </Text>
              <View
                style={[styles.sectionLine, { backgroundColor: colors.border }]}
              />
            </View>

            {pairs.map((pair, pairIndex) => (
              <View key={pairIndex} style={styles.cardRow}>
                <DemoCard
                  item={pair[0]}
                  categoryColor={categoryColor}
                  onPress={() => handleSelectDemo(pair[0])}
                  theme={theme}
                />
                {pair[1] ? (
                  <DemoCard
                    item={pair[1]}
                    categoryColor={categoryColor}
                    onPress={() => handleSelectDemo(pair[1])}
                    theme={theme}
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
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          react-native-cool-table
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 14,
  },
  themeToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeToggleIcon: {
    fontSize: 20,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 12,
  },
  sectionLine: {
    flex: 1,
    height: 1,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardAccent: {
    height: 3,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardContent: {
    padding: 16,
  },
  cardPlaceholder: {
    width: '48%',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
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
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
  },
});

export default HomeScreen;
