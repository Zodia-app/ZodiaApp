import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NameStep } from './palmReading/NameStep';
import { DateOfBirthStep } from './palmReading/DateOfBirthStep';
import { ProgressBar } from './palmReading/ProgressBar';
import { PhotoUploadStep } from './palmReading/PhotoUploadStep';

interface PalmReadingFlowProps {
  navigation: any;
  userData?: any;
}

export const PalmReadingFlow: React.FC<PalmReadingFlowProps> = ({ navigation, userData: initialUserData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState(initialUserData || {});
  const [palmData, setPalmData] = useState({});

  const totalSteps = 5;

const handleNext = () => {
  if (currentStep < totalSteps) {
    setCurrentStep(currentStep + 1);
  } else {
    // Navigate to waiting screen instead of payment
    navigation.navigate('PalmReadingWaitingScreen', { 
      readingData: { userData, palmData } 
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
          <DateOfBirthStep
            onNext={handleNext}
            userData={userData}
            setUserData={setUserData}
          />
        );
      case 3:
        // Gender Step placeholder
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What is your gender?</Text>
            <Text style={styles.stepSubtitle}>This helps us personalize your reading</Text>
            
            <TouchableOpacity 
              style={styles.optionButton} 
              onPress={() => {
                setUserData({ ...userData, gender: 'male' });
                handleNext();
              }}
            >
              <Text style={styles.optionText}>Male</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.optionButton} 
              onPress={() => {
                setUserData({ ...userData, gender: 'female' });
                handleNext();
              }}
            >
              <Text style={styles.optionText}>Female</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.optionButton} 
              onPress={() => {
                setUserData({ ...userData, gender: 'other' });
                handleNext();
              }}
            >
              <Text style={styles.optionText}>Other</Text>
            </TouchableOpacity>
          </View>
        );
      case 4:
        // Relationship Status placeholder
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What is your relationship status?</Text>
            <Text style={styles.stepSubtitle}>This helps with relationship insights</Text>
            
            <TouchableOpacity 
              style={styles.optionButton} 
              onPress={() => {
                setUserData({ ...userData, relationshipStatus: 'single' });
                handleNext();
              }}
            >
              <Text style={styles.optionText}>Single</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.optionButton} 
              onPress={() => {
                setUserData({ ...userData, relationshipStatus: 'relationship' });
                handleNext();
              }}
            >
              <Text style={styles.optionText}>In a relationship</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.optionButton} 
              onPress={() => {
                setUserData({ ...userData, relationshipStatus: 'married' });
                handleNext();
              }}
            >
              <Text style={styles.optionText}>Married</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.optionButton} 
              onPress={() => {
                setUserData({ ...userData, relationshipStatus: 'complicated' });
                handleNext();
              }}
            >
              <Text style={styles.optionText}>It's complicated</Text>
            </TouchableOpacity>
          </View>
        );
case 5:
  return (
    <PhotoUploadStep
      onNext={handleNext}
      userData={userData}
      setUserData={setUserData}
      palmData={palmData}
      setPalmData={setPalmData}
    />
  );
      default:
        return null;
    }
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ProgressBar percentage={progressPercentage} />
        <Text style={styles.stepIndicator}>
          Step {currentStep} of {totalSteps}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  stepIndicator: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6B46C1',
    fontWeight: '600',
  },
  stepContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  continueButton: {
    backgroundColor: '#6B46C1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  optionButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#6B46C1',
    borderStyle: 'dashed',
    padding: 40,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#6B46C1',
    fontWeight: '600',
  },
});