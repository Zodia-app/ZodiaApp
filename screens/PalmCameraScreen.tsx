// MinimalPalmCameraScreen.tsx - Use this to test if the error persists
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const MinimalPalmCameraScreen = () => {
  const navigation = useNavigation();
  
  console.log('MinimalPalmCameraScreen rendered');
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Minimal Palm Camera Screen</Text>
      <Button 
        title="Go Back" 
        onPress={() => {
          console.log('Go back pressed');
          navigation.goBack();
        }} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 20,
  },
});

export default MinimalPalmCameraScreen;