import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

export interface DemoItem {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}

export interface DemoSection {
  title: string;
  items: DemoItem[];
}

interface DemoNavigationProps {
  sections: DemoSection[];
  currentDemo: string;
  onDemoChange: (demoId: string) => void;
}

const DemoNavigation: React.FC<DemoNavigationProps> = ({
  sections,
  currentDemo,
  onDemoChange,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CoolTable 功能演示</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionItems}>
              {section.items.map((demo) => (
                <TouchableOpacity
                  key={demo.id}
                  style={[
                    styles.demoButton,
                    currentDemo === demo.id && styles.activeDemoButton,
                  ]}
                  onPress={() => onDemoChange(demo.id)}
                >
                  <Text
                    style={[
                      styles.demoButtonText,
                      currentDemo === demo.id && styles.activeDemoButtonText,
                    ]}
                  >
                    {demo.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  section: {
    marginRight: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 6,
    paddingLeft: 4,
  },
  sectionItems: {
    flexDirection: 'row',
  },
  demoButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 6,
  },
  activeDemoButton: {
    backgroundColor: '#1890ff',
  },
  demoButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  activeDemoButtonText: {
    color: '#fff',
  },
});

export default DemoNavigation;
