import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { NameStep } from './palmReading/NameStep';
import { BirthDetailsStep } from './palmReading/BirthDetailsStep';
import { ProgressBar } from './palmReading/ProgressBar';
import { HandPhotosStep } from './palmReading/HandPhotosStep';
import { LinearGradient } from 'expo-linear-gradient';

interface PalmReadingFlowProps {
  navigation: any;
  userData?: any;
}

export const PalmReadingFlow: React.FC<PalmReadingFlowProps> = ({ navigation, userData: initialUserData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState(initialUserData || {});
  const [palmData, setPalmData] = useState({});

  const totalSteps = 3;

  const handleNext = (passedPalmData?: any) => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Use passed data or fallback to state
      const finalPalmData = passedPalmData || palmData;
      
      console.log('=== NAVIGATION TO WAITING SCREEN ===');
      console.log('userData:', userData);
      console.log('palmData from state:', palmData);
      console.log('palmData passed directly:', passedPalmData);
      console.log('finalPalmData:', finalPalmData);
      console.log('=====================================');
      
      // Check if palmData has images
      if (!finalPalmData.leftPalmImage || !finalPalmData.rightPalmImage) {
        Alert.alert('Error', 'Palm images are missing. Please go back and retake the photos.');
        return;
      }
      
      // Navigate to waiting screen with the correct data
      navigation.navigate('PalmReadingWaiting', { 
        readingData: { 
          userData: {
            ...userData,
            dateOfBirth: userData.dateOfBirth?.toString()
          }, 
          palmData: finalPalmData
        } 
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <NameStep
            onNext={handleNext}
            userData={userData}
            setUserData={setUserData}
          />
        );
      case 2:
        return (
          <BirthDetailsStep
            onNext={handleNext}
            userData={userData}
            setUserData={setUserData}
          />
        );
      case 3:
        return (
          <HandPhotosStep
            onNext={(newPalmData) => {
              setPalmData(newPalmData);
              handleNext(newPalmData);
            }}
            palmData={palmData}
            setPalmData={setPalmData}
          />
        );
      default:
        return null;
    }
  }; // This closing brace was missing

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <LinearGradient
      colors={['#8B5CF6', '#A855F7', '#C084FC']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
      
      <View style={styles.header}>
        <ProgressBar percentage={progressPercentage} />
        <Text style={styles.stepIndicator}>
          {currentStep} of {totalSteps}
        </Text>
      </View>

      <View style={styles.content}>
        {renderStep()}
      </View>

      {currentStep > 1 && (
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: '100%',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 80,
    alignItems: 'center',
    zIndex: 1,
  },
  stepIndicator: {
    textAlign: 'center',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    minWidth: 50,
    alignItems: 'center',
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '700',
  },
});