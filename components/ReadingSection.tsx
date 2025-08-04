import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ReadingSectionProps {
  title: string;
  content: string | string[];
  type?: 'paragraph' | 'list' | 'highlight' | 'quote';
  icon?: string;
  collapsible?: boolean;
}

const ReadingSection: React.FC<ReadingSectionProps> = ({
  title,
  content,
  type = 'paragraph',
  icon,
  collapsible = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const animatedHeight = useState(new Animated.Value(1))[0];

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    Animated.timing(animatedHeight, {
      toValue: isCollapsed ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const renderContent = () => {
    switch (type) {
      case 'list':
        return (
          <View style={styles.listContainer}>
            {Array.isArray(content) ? content.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listBullet}>•</Text>
                <Text style={styles.listText}>{item}</Text>
              </View>
            )) : (
              <Text style={styles.contentText}>{content}</Text>
            )}
          </View>
        );
      
      case 'highlight':
        return (
          <View style={styles.highlightContainer}>
            <Text style={styles.highlightText}>
              {Array.isArray(content) ? content.join(' ') : content}
            </Text>
          </View>
        );
      
      case 'quote':
        return (
          <View style={styles.quoteContainer}>
            <Text style={styles.quoteText}>
              "{Array.isArray(content) ? content.join(' ') : content}"
            </Text>
          </View>
        );
      
      default:
        return (
          <Text style={styles.contentText}>
            {Array.isArray(content) ? content.join('\n\n') : content}
          </Text>
        );
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={collapsible ? toggleCollapse : undefined}
        disabled={!collapsible}
      >
        <View style={styles.titleContainer}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={styles.title}>{title}</Text>
        </View>
        {collapsible && (
          <Ionicons 
            name={isCollapsed ? "chevron-down" : "chevron-up"} 
            size={20} 
            color="#9d4edd"
          />
        )}
      </TouchableOpacity>
      
      {!collapsible || !isCollapsed ? (
        <Animated.View 
          style={[
            styles.content,
            collapsible && {
              opacity: animatedHeight,
              maxHeight: animatedHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1000],
              }),
            },
          ]}
        >
          {renderContent()}
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  content: {
    marginTop: 15,
  },
  contentText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
  },
  listContainer: {
    gap: 10,
  },
  listItem: {
    flexDirection: 'row',
    gap: 10,
  },
  listBullet: {
    color: '#9d4edd',
    fontSize: 16,
    marginTop: 2,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
  },
  highlightContainer: {
    backgroundColor: 'rgba(157, 78, 221, 0.2)',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#9d4edd',
  },
  highlightText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
    fontWeight: '500',
  },
  quoteContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  quoteText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 28,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default ReadingSection;