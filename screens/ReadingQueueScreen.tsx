// components/ReadingQueueStatus.tsx

import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const reading = await checkReadingStatus(readingId);
        setStatus(reading.status);
        setEstimatedTime(new Date(reading.scheduled_completion_at));

        // Calculate progress
        const now = new Date();
        const created = new Date(reading.created_at);
        const scheduled = new Date(reading.scheduled_completion_at);
        
        const totalTime = scheduled.getTime() - created.getTime();
        const elapsed = now.getTime() - created.getTime();
        const progressPercent = Math.min((elapsed / totalTime) * 100, 100);
        
        setProgress(progressPercent);

        if (reading.status === 'completed' && onComplete) {
          onComplete();
        }
      } catch (error) {
        console.error('Error checking reading status:', error);
      }
    };

    // Check immediately
    checkStatus();

    // Then check every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, [readingId, onComplete]);

  const getTimeRemaining = () => {
    if (!estimatedTime) return 'Calculating...';
    
    const now = new Date();
    const diff = estimatedTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Almost ready...';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes} minutes remaining`;
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
});

// Export the component
export default ReadingQueueStatus;