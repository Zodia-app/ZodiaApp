// Palm Reading Cache Service - For heavy load optimization
// Implements intelligent caching to reduce duplicate processing

import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheItem {
  key: string;
  data: any;
  timestamp: number;
  expiresAt: number;
  hitCount: number;
  imageHash: string; // Simple hash of combined images
}

class PalmReadingCache {
  private readonly CACHE_PREFIX = 'palm_cache_';
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_CACHE_SIZE = 100; // Max cached readings

  // Generate simple hash from image data
  private generateImageHash(leftImage: string, rightImage: string): string {
    // Simple hash based on image lengths and first/last characters
    const combined = leftImage.substring(0, 50) + rightImage.substring(0, 50) + 
                    leftImage.length + rightImage.length;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Check if similar palm reading exists in cache
  async getCachedReading(leftImage: string, rightImage: string, userData: any): Promise<any | null> {
    try {
      const imageHash = this.generateImageHash(leftImage, rightImage);
      const cacheKey = `${this.CACHE_PREFIX}${imageHash}`;
      
      console.log('🔍 Checking palm reading cache for:', imageHash);
      
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (!cachedData) {
        console.log('❌ No cached palm reading found');
        return null;
      }

      const cacheItem: CacheItem = JSON.parse(cachedData);
      
      // Check if cache is expired
      if (Date.now() > cacheItem.expiresAt) {
        console.log('⏰ Cached palm reading expired, removing...');
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }

      // Increment hit count
      cacheItem.hitCount++;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheItem));
      
      console.log(`✅ Found cached palm reading! Hits: ${cacheItem.hitCount}, Age: ${Math.round((Date.now() - cacheItem.timestamp) / 1000 / 60)} minutes`);
      
      // Personalize the cached reading with current user data
      const personalizedReading = this.personalizeReading(cacheItem.data, userData);
      
      return {
        ...personalizedReading,
        fromCache: true,
        cacheAge: Date.now() - cacheItem.timestamp,
        cacheHits: cacheItem.hitCount
      };
      
    } catch (error) {
      console.warn('⚠️ Cache check failed:', error);
      return null;
    }
  }

  // Store palm reading in cache
  async cacheReading(leftImage: string, rightImage: string, userData: any, reading: any) {
    try {
      const imageHash = this.generateImageHash(leftImage, rightImage);
      const cacheKey = `${this.CACHE_PREFIX}${imageHash}`;
      
      // Remove user-specific data before caching
      const genericReading = this.makeReadingGeneric(reading, userData);
      
      const cacheItem: CacheItem = {
        key: cacheKey,
        data: genericReading,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.DEFAULT_TTL,
        hitCount: 1,
        imageHash
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheItem));
      console.log(`💾 Cached palm reading: ${imageHash}`);
      
      // Clean up old cache entries
      await this.cleanupCache();
      
    } catch (error) {
      console.warn('⚠️ Failed to cache palm reading:', error);
    }
  }

  // Remove user-specific data from reading for generic caching
  private makeReadingGeneric(reading: any, userData?: any): any {
    if (!reading?.reading) return reading;
    
    const genericReading = JSON.parse(JSON.stringify(reading)); // Deep clone
    
    // If userData is provided, replace specific values, otherwise use regex
    if (userData?.name) {
      const userName = userData.name;
      const zodiacSign = userData.zodiacSign || '';
      
      // Function to replace actual user data with placeholders
      const replaceWithPlaceholders = (text: string): string => {
        if (!text) return text;
        let result = text.replace(new RegExp(`\\b${userName}\\b`, 'g'), '[Name]');
        if (zodiacSign) {
          result = result.replace(new RegExp(`\\b${zodiacSign}\\b`, 'g'), '[Zodiac]');
        }
        return result;
      };
      
      // Replace in all text fields
      if (genericReading.reading.greeting) {
        genericReading.reading.greeting = replaceWithPlaceholders(genericReading.reading.greeting);
      }
      
      if (genericReading.reading.overallPersonality) {
        genericReading.reading.overallPersonality = replaceWithPlaceholders(genericReading.reading.overallPersonality);
      }
      
      if (genericReading.reading.futureInsights) {
        genericReading.reading.futureInsights = replaceWithPlaceholders(genericReading.reading.futureInsights);
      }
      
      if (genericReading.reading.personalizedAdvice) {
        genericReading.reading.personalizedAdvice = replaceWithPlaceholders(genericReading.reading.personalizedAdvice);
      }
    } else {
      // Fallback to regex replacement for capitalized words
      const replaceNames = (text: string) => text ? text.replace(/\b[A-Z][a-z]+\b/g, '[Name]') : text;
      
      if (genericReading.reading.greeting) {
        genericReading.reading.greeting = replaceNames(genericReading.reading.greeting);
      }
      
      if (genericReading.reading.overallPersonality) {
        genericReading.reading.overallPersonality = replaceNames(genericReading.reading.overallPersonality);
      }
    }
    
    return genericReading;
  }

  // Personalize generic reading with current user data
  private personalizeReading(reading: any, userData: any): any {
    if (!reading?.reading) return reading;
    
    const personalizedReading = JSON.parse(JSON.stringify(reading)); // Deep clone
    
    // Replace placeholder with actual name and fix common issues
    const name = userData.name || 'Friend';
    const zodiacSign = userData.zodiacSign || 'your zodiac';
    
    // Comprehensive replacement function
    const replacePlaceholders = (text: string): string => {
      if (!text) return text;
      return text
        .replace(/\[Name\]/g, name)
        .replace(/\[Zodiac\]/g, zodiacSign)
        .replace(/undefined zodiac/g, zodiacSign)
        .replace(/undefined/g, name);
    };
    
    // Replace in all text fields
    if (personalizedReading.reading.greeting) {
      personalizedReading.reading.greeting = replacePlaceholders(personalizedReading.reading.greeting);
    }
    
    if (personalizedReading.reading.overallPersonality) {
      personalizedReading.reading.overallPersonality = replacePlaceholders(personalizedReading.reading.overallPersonality);
    }
    
    if (personalizedReading.reading.futureInsights) {
      personalizedReading.reading.futureInsights = replacePlaceholders(personalizedReading.reading.futureInsights);
    }
    
    if (personalizedReading.reading.personalizedAdvice) {
      personalizedReading.reading.personalizedAdvice = replacePlaceholders(personalizedReading.reading.personalizedAdvice);
    }
    
    if (personalizedReading.reading.handComparison) {
      personalizedReading.reading.handComparison = replacePlaceholders(personalizedReading.reading.handComparison);
    }
    
    // Replace in lines
    if (personalizedReading.reading.lines) {
      Object.keys(personalizedReading.reading.lines).forEach(lineKey => {
        const line = personalizedReading.reading.lines[lineKey];
        if (line.description) line.description = replacePlaceholders(line.description);
        if (line.personalizedInsight) line.personalizedInsight = replacePlaceholders(line.personalizedInsight);
      });
    }
    
    return personalizedReading;
  }

  // Clear all cache entries (useful after edge function updates)
  async clearAllCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      console.log(`🗑️ Clearing all palm reading cache entries (${cacheKeys.length} items)`);
      
      for (const key of cacheKeys) {
        await AsyncStorage.removeItem(key);
      }
      
      console.log('✅ All palm reading cache cleared');
    } catch (error) {
      console.warn('⚠️ Failed to clear palm reading cache:', error);
    }
  }

  // Clean up old cache entries
  private async cleanupCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      if (cacheKeys.length <= this.MAX_CACHE_SIZE) {
        return; // No cleanup needed
      }

      console.log(`🧹 Cleaning up palm reading cache (${cacheKeys.length}/${this.MAX_CACHE_SIZE})`);
      
      // Get all cache items with metadata
      const cacheItems: Array<{ key: string; item: CacheItem }> = [];
      
      for (const key of cacheKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          try {
            const item: CacheItem = JSON.parse(data);
            cacheItems.push({ key, item });
          } catch {
            // Remove corrupted cache entries
            await AsyncStorage.removeItem(key);
          }
        }
      }

      // Sort by hit count (descending) and timestamp (ascending) - keep popular and recent items
      cacheItems.sort((a, b) => {
        if (a.item.hitCount !== b.item.hitCount) {
          return b.item.hitCount - a.item.hitCount; // Higher hit count first
        }
        return b.item.timestamp - a.item.timestamp; // More recent first
      });

      // Remove oldest/least used items
      const itemsToRemove = cacheItems.slice(this.MAX_CACHE_SIZE);
      for (const item of itemsToRemove) {
        await AsyncStorage.removeItem(item.key);
      }
      
      console.log(`✅ Removed ${itemsToRemove.length} old cache entries`);
      
    } catch (error) {
      console.warn('⚠️ Cache cleanup failed:', error);
    }
  }

  // Get cache statistics
  async getCacheStats() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      let totalHits = 0;
      let totalSize = 0;
      
      for (const key of cacheKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          totalSize += data.length;
          try {
            const item: CacheItem = JSON.parse(data);
            totalHits += item.hitCount;
          } catch {}
        }
      }
      
      return {
        totalEntries: cacheKeys.length,
        totalHits,
        totalSizeKB: Math.round(totalSize / 1024),
        maxEntries: this.MAX_CACHE_SIZE,
        hitRate: cacheKeys.length > 0 ? Math.round((totalHits / cacheKeys.length) * 100) / 100 : 0
      };
      
    } catch (error) {
      console.warn('⚠️ Failed to get cache stats:', error);
      return null;
    }
  }

  // Clear all cache
  async clearCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      await AsyncStorage.multiRemove(cacheKeys);
      console.log(`🗑️ Cleared ${cacheKeys.length} palm reading cache entries`);
      
    } catch (error) {
      console.warn('⚠️ Failed to clear cache:', error);
    }
  }
}

// Singleton instance
export const palmReadingCache = new PalmReadingCache();