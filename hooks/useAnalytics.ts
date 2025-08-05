import { useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import Analytics from '../services/analytics';

export const useScreenTracking = () => {
  const route = useRoute();
  
  useEffect(() => {
    Analytics.trackScreen(route.name);
  }, [route.name]);
};

export const useAnalytics = () => {
  return Analytics;
};

export default useAnalytics;
