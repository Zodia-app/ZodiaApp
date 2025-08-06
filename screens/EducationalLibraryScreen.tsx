import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const EducationalLibraryScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All', icon: 'apps' },
    { id: 'zodiac', name: 'Zodiac', icon: 'star' },
    { id: 'palmistry', name: 'Palmistry', icon: 'hand-left' },
    { id: 'tarot', name: 'Tarot', icon: 'flower' },
    { id: 'crystals', name: 'Crystals', icon: 'diamond' },
    { id: 'moon', name: 'Moon Phases', icon: 'moon' },
  ];

  const educationalContent = [
    {
      id: 1,
      category: 'zodiac',
      title: 'Understanding Your Birth Chart',
      description: 'Learn how planetary positions at birth shape your personality',
      readTime: '5 min',
      difficulty: 'Beginner',
      icon: '♈',
    },
    {
      id: 2,
      category: 'zodiac',
      title: 'The 12 Zodiac Signs Explained',
      description: 'Deep dive into each zodiac sign\'s traits and characteristics',
      readTime: '15 min',
      difficulty: 'Beginner',
      icon: '♊',
    },
    {
      id: 3,
      category: 'palmistry',
      title: 'Major Lines in Palmistry',
      description: 'Heart, head, life, and fate lines decoded',
      readTime: '8 min',
      difficulty: 'Beginner',
      icon: '✋',
    },
    {
      id: 4,
      category: 'palmistry',
      title: 'Reading the Mounts',
      description: 'What the raised areas of your palm reveal',
      readTime: '10 min',
      difficulty: 'Intermediate',
      icon: '🤚',
    },
    {
      id: 5,
      category: 'tarot',
      title: 'Major Arcana Guide',
      description: 'The 22 most powerful cards in the tarot deck',
      readTime: '20 min',
      difficulty: 'Intermediate',
      icon: '🎴',
    },
    {
      id: 6,
      category: 'tarot',
      title: 'Daily Card Meanings',
      description: 'How to interpret your daily tarot pull',
      readTime: '7 min',
      difficulty: 'Beginner',
      icon: '🃏',
    },
    {
      id: 7,
      category: 'crystals',
      title: 'Healing Crystals 101',
      description: 'Introduction to crystal properties and uses',
      readTime: '12 min',
      difficulty: 'Beginner',
      icon: '💎',
    },
    {
      id: 8,
      category: 'crystals',
      title: 'Chakra Stones Guide',
      description: 'Crystals for balancing your energy centers',
      readTime: '10 min',
      difficulty: 'Intermediate',
      icon: '🔮',
    },
    {
      id: 9,
      category: 'moon',
      title: 'Moon Phase Rituals',
      description: 'Harness lunar energy for manifestation',
      readTime: '15 min',
      difficulty: 'Beginner',
      icon: '🌙',
    },
    {
      id: 10,
      category: 'moon',
      title: 'New Moon Intentions',
      description: 'Setting powerful intentions with the lunar cycle',
      readTime: '6 min',
      difficulty: 'Beginner',
      icon: '🌑',
    },
  ];

  const filteredContent = educationalContent.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContentPress = (item: any) => {
    // Navigate to detailed article view
    navigation.navigate('ArticleDetail', { article: item });
  };

  const renderContentItem = ({ item }: any) => (
    <TouchableOpacity style={styles.contentCard} onPress={() => handleContentPress(item)}>
      <View style={styles.contentHeader}>
        <Text style={styles.contentIcon}>{item.icon}</Text>
        <View style={styles.contentMeta}>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
          <Text style={styles.readTime}>{item.readTime}</Text>
        </View>
      </View>
      <Text style={styles.contentTitle}>{item.title}</Text>
      <Text style={styles.contentDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Educational Library</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.5)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search articles..."
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                selectedCategory === category.id && styles.categoryTabActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons 
                name={category.icon as any} 
                size={20} 
                color={selectedCategory === category.id ? '#fff' : 'rgba(255, 255, 255, 0.6)'} 
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Section */}
        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>📚 Featured Learning</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={styles.featuredCard}>
              <LinearGradient
                colors={['#9C88FF', '#7C3AED']}
                style={styles.featuredGradient}
              >
                <Text style={styles.featuredEmoji}>🌟</Text>
                <Text style={styles.featuredTitle}>Zodiac Mastery</Text>
                <Text style={styles.featuredSubtitle}>Complete Guide</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.featuredCard}>
              <LinearGradient
                colors={['#54A0FF', '#0066CC']}
                style={styles.featuredGradient}
              >
                <Text style={styles.featuredEmoji}>🔮</Text>
                <Text style={styles.featuredTitle}>Crystal Healing</Text>
                <Text style={styles.featuredSubtitle}>Beginner Course</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.featuredCard}>
              <LinearGradient
                colors={['#48DBFB', '#0099CC']}
                style={styles.featuredGradient}
              >
                <Text style={styles.featuredEmoji}>🌙</Text>
                <Text style={styles.featuredTitle}>Lunar Magic</Text>
                <Text style={styles.featuredSubtitle}>Moon Rituals</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Content List */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Articles' : categories.find(c => c.id === selectedCategory)?.name}
            <Text style={styles.resultCount}> ({filteredContent.length})</Text>
          </Text>
          
          <FlatList
            data={filteredContent}
            renderItem={renderContentItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentList}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="book-outline" size={48} color="rgba(255, 255, 255, 0.3)" />
                <Text style={styles.emptyText}>No articles found</Text>
              </View>
            }
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 45,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    maxHeight: 50,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  categoryTabActive: {
    backgroundColor: 'rgba(156, 136, 255, 0.2)',
    borderWidth: 1,
    borderColor: '#9C88FF',
  },
  categoryText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginLeft: 6,
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  featuredSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  resultCount: {
    fontSize: 14,
    fontWeight: 'normal',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  featuredCard: {
    width: 140,
    height: 140,
    marginRight: 12,
    borderRadius: 15,
    overflow: 'hidden',
  },
  featuredGradient: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  featuredSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentList: {
    paddingBottom: 20,
  },
  contentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  contentIcon: {
    fontSize: 32,
  },
  contentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  difficultyBadge: {
    backgroundColor: 'rgba(156, 136, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  difficultyText: {
    color: '#9C88FF',
    fontSize: 11,
    fontWeight: '600',
  },
  readTime: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },
  contentTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  contentDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
    marginTop: 10,
  },
});

export default EducationalLibraryScreen;