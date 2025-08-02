import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, ScrollView } from 'react-native';
import { calculateZodiacSign, calculateCompatibility } from '../utils/zodiac/calculator';
import { generateDailyHoroscope } from '../services/horoscope/horoscopeService';
import type { ZodiacSign, CompatibilityResult } from '../utils/zodiac/calculator';
import type { HoroscopeResult } from '../services/horoscope/horoscopeService';

export default function ZodiacCalculatorTest() {
  const [birthDate, setBirthDate] = useState('1990-03-25');
  const [partnerDate, setPartnerDate] = useState('1992-07-15');
  const [zodiacResult, setZodiacResult] = useState<ZodiacSign | null>(null);
  const [compatibilityResult, setCompatibilityResult] = useState<CompatibilityResult | null>(null);
  const [horoscope, setHoroscope] = useState<HoroscopeResult | null>(null);
  const [loading, setLoading] = useState(false);

  const testCalculator = () => {
    const result = calculateZodiacSign(birthDate);
    setZodiacResult(result);
  };

  const testCompatibility = () => {
    const mySign = calculateZodiacSign(birthDate);
    const partnerSign = calculateZodiacSign(partnerDate);
    if (mySign && partnerSign) {
      const compat = calculateCompatibility(mySign, partnerSign);
      setCompatibilityResult(compat);
    }
  };

  const testHoroscope = async () => {
    setLoading(true);
    try {
      const result = await generateDailyHoroscope(birthDate);
      setHoroscope(result);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Zodiac Calculator Test</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Your Birth Date:</Text>
        <TextInput
          style={styles.input}
          value={birthDate}
          onChangeText={setBirthDate}
          placeholder="YYYY-MM-DD"
        />
        <Button title="Calculate My Sign" onPress={testCalculator} />
        
        {zodiacResult && (
          <View style={styles.result}>
            <Text style={styles.resultTitle}>{zodiacResult.name} {zodiacResult.symbol}</Text>
            <Text>Element: {zodiacResult.element}</Text>
            <Text>Ruling Planet: {zodiacResult.rulingPlanet}</Text>
            <Text>Traits: {zodiacResult.traits.join(', ')}</Text>
            <Text>Lucky Numbers: {zodiacResult.luckyNumbers.join(', ')}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Partner's Birth Date:</Text>
        <TextInput
          style={styles.input}
          value={partnerDate}
          onChangeText={setPartnerDate}
          placeholder="YYYY-MM-DD"
        />
        <Button title="Check Compatibility" onPress={testCompatibility} />
        
        {compatibilityResult && (
          <View style={styles.result}>
            <Text style={styles.resultTitle}>
              {compatibilityResult.sign1} + {compatibilityResult.sign2}
            </Text>
            <Text>Score: {compatibilityResult.score}%</Text>
            <Text>Elements: {compatibilityResult.element1} + {compatibilityResult.element2}</Text>
            <Text>{compatibilityResult.description}</Text>
            <Text style={styles.recommendation}>{compatibilityResult.recommendation}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Button 
          title={loading ? "Generating..." : "Generate Daily Horoscope"} 
          onPress={testHoroscope}
          disabled={loading || !zodiacResult}
        />
        
        {horoscope && (
          <View style={styles.result}>
            <Text style={styles.resultTitle}>Today's Horoscope for {horoscope.sign}</Text>
            <Text style={styles.horoscopeSection}>Overall Energy:</Text>
            <Text>{horoscope.content.overallEnergy}</Text>
            <Text style={styles.horoscopeSection}>Love:</Text>
            <Text>{horoscope.content.loveRelationships}</Text>
            <Text style={styles.horoscopeSection}>Career:</Text>
            <Text>{horoscope.content.careerMoney}</Text>
            <Text>Lucky Color: {horoscope.content.luckyColor}</Text>
            <Text>Lucky Number: {horoscope.content.luckyNumber}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  result: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  recommendation: {
    marginTop: 10,
    fontStyle: 'italic',
  },
  horoscopeSection: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
});