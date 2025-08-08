import { useState, useEffect } from 'react';
import { Camera } from 'expo-camera';
import { Alert, Linking } from 'react-native';

export const useCameraPermissions = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    setIsChecking(true);
    const { status } = await Camera.getCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    setIsChecking(false);
  };

  const requestPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera access in your device settings to use palm reading.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ]
      );
    }
    
    return status === 'granted';
  };

  return {
    hasPermission,
    isChecking,
    requestPermissions,
    checkPermissions
  };
};