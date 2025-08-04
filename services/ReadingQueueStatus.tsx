// components/ReadingQueueStatus.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { checkReadingStatus } from '../services/readingQueueService';

interface ReadingQueueStatusProps {
  readingId: string;
  onComplete?: () => void;
}

export const ReadingQueueStatus: React.FC<ReadingQueueStatusProps> = ({
  readingId,
  onComplete
}) => {
  const [status, setStatus] = useState('queued');
  const [estimatedTime, setEstimatedTime] = useState<Date | null>(null);
  const [progress, setProgress] = useState(0);
  const [createdAt, setCreatedAt] = useState<Date | null>(null);
  const updateCountRef = useRef(0);

  useEffect(() => {
    console.log('ReadingQueueStatus mounted with readingId:', readingId);
    
    const checkStatus = async () => {
      try {
        updateCountRef.current += 1;
        console.log(`Status check #${updateCountRef.current} at ${new Date().toLocaleTimeString()}`);
        
        const reading = await checkReadingStatus(readingId);
        
        if (reading) {
          setStatus(reading.status);
          
          // Parse dates
          const created = new Date(reading.created_at);
          const scheduled = new Date(reading.scheduled_completion_at);
          const now = new Date();
          
          setCreatedAt(created);
          setEstimatedTime(scheduled);
          
          // Calculate progress
          const totalTime = scheduled.getTime() - created.getTime();
          const elapsed = now.getTime() - created.getTime();
          const progressPercent = Math.min((elapsed / totalTime) * 100, 100);
          
          setProgress(progressPercent);
          console.log(`Progress: ${Math.round(progressPercent)}%, Status: ${reading.status}`);
          
          // Check if completed
          if (reading.status === 'completed' && onComplete) {
            onComplete();
          }
        }
      } catch (error) {
        console.error('Error checking reading status:', error);
        // Don't crash the component, just log the error
      }
    };

    // Check immediately
    checkStatus();

    // Then check every 5 seconds for testing (normally would be 30 seconds)
    const interval = setInterval(checkStatus, 5000); // 5 seconds for testing

    return () => {
      console.log('Cleaning up interval');
      clearInterval(interval);
    };
  }, [readingId, onComplete]);

  const getTimeRemaining = () => {
    if (!estimatedTime) return 'Calculating...';
    
    const now = new Date();
    const diff = estimatedTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Almost ready...';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s remaining`;
    }
    return `${seconds} seconds remaining`;
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'queued':
        return 'Your reading is in the cosmic queue';
      case 'processing':
        return 'The universe is revealing your insights';
      case 'completed':
        return 'Your reading is ready!';
      case 'failed':
        return 'Something went wrong. Please try again.';
      default:
        return 'Preparing your reading...';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'queued':
        return 'time-outline';
      case 'processing':
        return 'sync-outline';
      case 'completed':
        return 'checkmark-circle-outline';
      case 'failed':
        return 'alert-circle-outline';
      default:
        return 'hourglass-outline';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'failed':
        return '#EF4444';
      case 'processing':
        return '#9d4edd';
      default:
        return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons 
          name={getStatusIcon() as any} 
          size={32} 
          color={getStatusColor()} 
        />
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusMessage()}
        </Text>
      </View>

      {status !== 'completed' && status !== 'failed' && (
        <>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${progress}%`,
                    backgroundColor: getStatusColor() 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>

          <Text style={styles.timeText}>{getTimeRemaining()}</Text>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#6B7280" />
            <Text style={styles.infoText}>
              We're consulting the stars and ancient wisdom to create your personalized reading. 
              This mystical process takes time to ensure accuracy.
            </Text>
          </View>

          {/* Debug info - remove in production */}
          <View style={styles.debugBox}>
            <ActivityIndicator size="small" color="#9d4edd" />
            <Text style={styles.debugText}>
              Testing mode: Updates every 5 seconds
            </Text>
          </View>
          {createdAt && (
            <Text style={styles.debugTimestamp}>
              Started: {createdAt.toLocaleTimeString()}
            </Text>
          )}
        </>
      )}

      {status === 'completed' && (
        <TouchableOpacity style={styles.viewButton} onPress={onComplete}>
          <Text style={styles.viewButtonText}>View Your Reading</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {status === 'failed' && (
        <TouchableOpacity style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#2a2a3e',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
  timeText: {
    color: '#9d4edd',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  infoText: {
    color: '#B8B8B8',
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
  viewButton: {
    flexDirection: 'row',
    backgroundColor: '#9d4edd',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  retryButton: {
    backgroundColor: '#2a2a3e',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  debugBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: '#2a2a3e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  debugText: {
    color: '#9d4edd',
    fontSize: 12,
    marginLeft: 8,
  },
  debugTimestamp: {
    color: '#666',
    fontSize: 11,
    marginTop: 5,
  },
});

// Export the component
export default ReadingQueueStatus;