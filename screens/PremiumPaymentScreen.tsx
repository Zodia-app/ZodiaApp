import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PremiumPaymentScreen = ({ navigation, route }: any) => {
  const { readingType } = route.params || { readingType: 'clairvoyance' };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Premium Badge */}
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumText}>PREMIUM</Text>
        </View>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="diamond" size={80} color="#FFD700" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Premium Clairvoyance Reading</Text>
        <Text style={styles.price}>$34.99</Text>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>What's Included:</Text>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color="#FFD700" />
            <Text style={styles.featureText}>5-10 page detailed report</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color="#FFD700" />
            <Text style={styles.featureText}>Past life connections</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color="#FFD700" />
            <Text style={styles.featureText}>Spirit guide messages</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color="#FFD700" />
            <Text style={styles.featureText}>Future timeline reading</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color="#FFD700" />
            <Text style={styles.featureText}>Priority processing</Text>
          </View>
        </View>

        {/* Placeholder Info */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#FFD700" />
          <Text style={styles.infoText}>
            Payment integration will be implemented with Stripe in Task #30
          </Text>
        </View>

        {/* Payment Button (Placeholder) */}
        <TouchableOpacity 
          style={styles.paymentButton}
          onPress={() => alert('Payment processing coming soon!')}
        >
          <Ionicons name="lock-closed" size={20} color="#000000" />
          <Text style={styles.paymentButtonText}>Secure Checkout</Text>
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Maybe Later</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  premiumText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  iconContainer: {
    marginBottom: 30,
    padding: 30,
    backgroundColor: '#1F1A0A',
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  price: {
    color: '#FFD700',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  featuresContainer: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    width: '100%',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  featuresTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    color: '#E0E0E0',
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1A0A',
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  infoText: {
    color: '#B8B8B8',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  paymentButton: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
    justifyContent: 'center',
  },
  paymentButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 30,
  },
  backButtonText: {
    color: '#B8B8B8',
    fontSize: 16,
    textDecoration: 'underline',
  },
});

export default PremiumPaymentScreen;