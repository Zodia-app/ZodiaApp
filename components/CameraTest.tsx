import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert, Image } from 'react-native';
import { Camera } from 'expo-camera';

export function CameraTest() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [photoUri, setPhotoUri] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef) {
      try {
        const photo = await cameraRef.takePictureAsync({
          quality: 0.7,
          base64: false,
        });
        setPhotoUri(photo.uri);
        Alert.alert('Success!', 'Palm photo taken for reading!');
      } catch (error) {
        Alert.alert('Error', 'Could not take photo');
      }
    }
  };

  if (hasPermission === null) {
    return <Text style={styles.text}>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission denied</Text>
        <Text style={styles.subtext}>Enable camera in Settings for palm reading</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📸 Palm Reading Camera Test</Text>
      
      {photoUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.preview} />
          <Button title="Take Another Photo" onPress={() => setPhotoUri(null)} />
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          <Camera 
            style={styles.camera} 
            ref={(ref) => setCameraRef(ref)}
            type={Camera.Constants.Type.back}
          />
          <View style={styles.buttonContainer}>
            <Button title="📱 Take Palm Photo" onPress={takePicture} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1a202c',
    padding: 20,
  },
  title: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 40,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
    borderRadius: 10,
    overflow: 'hidden',
  },
  camera: { 
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  text: { 
    textAlign: 'center', 
    margin: 20, 
    fontSize: 16,
    color: 'white',
  },
  subtext: {
    textAlign: 'center',
    fontSize: 14,
    color: '#a0aec0',
  },
  previewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    width: 300,
    height: 400,
    borderRadius: 10,
    marginBottom: 20,
  },
});