import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Svg, { Polygon, Circle, Line, Text as SvgText, G } from 'react-native-svg';

interface CompatibilityChartProps {
  data: {
    loveRomance: number;
    communication: number;
    trust: number;
    emotional: number;
    chemistry: number;
    longTerm: number;
  };
}

const { width: screenWidth } = Dimensions.get('window');
const chartSize = Math.min(screenWidth - 80, 300);
const centerX = chartSize / 2;
const centerY = chartSize / 2;
const radius = (chartSize / 2) - 40;

export const CompatibilityChart: React.FC<CompatibilityChartProps> = ({ data }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const categories = [
    { key: 'loveRomance', label: 'Love', emoji: '❤️' },
    { key: 'communication', label: 'Communication', emoji: '💬' },
    { key: 'trust', label: 'Trust', emoji: '🤝' },
    { key: 'emotional', label: 'Emotional', emoji: '💖' },
    { key: 'chemistry', label: 'Chemistry', emoji: '⚡' },
    { key: 'longTerm', label: 'Long-term', emoji: '🌟' },
  ];

  const angleStep = (Math.PI * 2) / categories.length;

  const getPoint = (value: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    };
  };

  const polygonPoints = categories
    .map((cat, index) => {
      const point = getPoint(data[cat.key as keyof typeof data], index);
      return `${point.x},${point.y}`;
    })
    .join(' ');

  // Create grid lines
  const gridLevels = [20, 40, 60, 80, 100];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Text style={styles.title}>Relationship Dynamics</Text>
      
      <Svg width={chartSize} height={chartSize} style={styles.chart}>
        {/* Grid circles */}
        {gridLevels.map((level) => (
          <Circle
            key={level}
            cx={centerX}
            cy={centerY}
            r={(level / 100) * radius}
            stroke="#333"
            strokeWidth="1"
            fill="none"
            opacity="0.3"
          />
        ))}

        {/* Axis lines */}
        {categories.map((_, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          return (
            <Line
              key={index}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke="#333"
              strokeWidth="1"
              opacity="0.3"
            />
          );
        })}

        {/* Data polygon */}
        <Polygon
          points={polygonPoints}
          fill="#9333EA"
          fillOpacity="0.3"
          stroke="#9333EA"
          strokeWidth="2"
        />

        {/* Data points */}
        {categories.map((cat, index) => {
          const point = getPoint(data[cat.key as keyof typeof data], index);
          return (
            <Circle
              key={cat.key}
              cx={point.x}
              cy={point.y}
              r="6"
              fill="#9333EA"
              stroke="#fff"
              strokeWidth="2"
            />
          );
        })}

        {/* Labels */}
        {categories.map((cat, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const labelRadius = radius + 25;
          const x = centerX + labelRadius * Math.cos(angle);
          const y = centerY + labelRadius * Math.sin(angle);
          
          return (
            <G key={cat.key}>
              <SvgText
                x={x}
                y={y - 5}
                fontSize="12"
                fill="#fff"
                textAnchor="middle"
              >
                {cat.emoji}
              </SvgText>
              <SvgText
                x={x}
                y={y + 10}
                fontSize="10"
                fill="#999"
                textAnchor="middle"
              >
                {cat.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        {categories.map((cat) => (
          <View key={cat.key} style={styles.legendItem}>
            <Text style={styles.legendEmoji}>{cat.emoji}</Text>
            <Text style={styles.legendText}>
              {data[cat.key as keyof typeof data]}%
            </Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
  },
  chart: {
    marginBottom: 20,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  legendEmoji: {
    fontSize: 16,
    marginRight: 5,
  },
  legendText: {
    fontSize: 14,
    color: '#B794F4',
    fontWeight: '600',
  },
});

export default CompatibilityChart;