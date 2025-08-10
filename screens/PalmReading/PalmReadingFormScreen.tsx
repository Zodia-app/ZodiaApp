import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { PalmReadingFlow } from '../../components/PalmReadingFlow';

export const PalmReadingFormScreen: React.FC<any> = ({ navigation, route }) => {
  const { userData } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <PalmReadingFlow 
        navigation={navigation} 
        userData={userData} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
});