import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import MapView, { Heatmap, PROVIDER_GOOGLE } from 'react-native-maps';
import { LineChart } from 'react-native-chart-kit';
import { useSensorTracking } from '../../tracking/hooks/useSensorTracking';

const Dashboard = () => {
  const { metrics, processFileForMetrics } = useSensorTracking();

  useEffect(() => {
    processFileForMetrics();
  }, []);


  if (!metrics) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Processing data...</Text>
      </View>
    );
  }
  const initialRegion = metrics.heatmap.length
    ? {
        latitude: metrics.heatmap[0].latitude,
        longitude: metrics.heatmap[0].longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : null;
  
    interface CircularCardProps {
      value: string | number;
      label: string;
      color: string;
    }
    
    const CircularCard: React.FC<CircularCardProps> = ({ value, label, color }) => (
      <View style={[styles.circularCard, { borderColor: color }]}>
        <Text style={[styles.cardValue, { color }]}>{value}</Text>
        <Text style={styles.cardLabel}>{label}</Text>
      </View>
    );

  const renderChart = (title: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined, data: any, color: string) => (
    data && (
    <View style={styles.chartContainer}>
      <Text style={styles.label}>{title}</Text>
      <LineChart
        data={{
          labels: ['Start', '25%', '50%', '75%', 'End'],
          datasets: [{ data }],
        }}
        width={Dimensions.get('window').width - 32}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#f7f7f7',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(${color}, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: `rgba(${color}, 1)`,
          },
        }}
        bezier
      />
    </View>)
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Analitica</Text>
      <View style={styles.metricsContainer}>
        <CircularCard value={metrics.averageSpeed.toFixed(1)} label="Velocidad Prom. (km/h)" color="#00FF7F" />
        <CircularCard value={metrics.maxSpeed.toFixed(1)} label="Velocidad Máx. (km/h)" color="#FF4500" />
        <CircularCard value={metrics.sessionTime.toFixed(1)} label={metrics.sessionTime > 60 ? "Tiempo Sesión (min)" : "Tiempo Sesión (Seg)"} color="#FFA500" />
      </View>
      <View style={styles.metricsContainer}>
        <CircularCard value={metrics.caloriesBurned.toFixed(1)} label="Calorías (kcal)" color="#4B0082" />
        <CircularCard value={metrics.abruptMovements} label="Mov. Bruscos" color="#8B4513" />
      </View>
      {/* Métricas de rendimiento */}
      {metrics?.distanceHistory.length > 0 && (
        <View style={styles.performanceContainer}>
        {/* Gráficos */}
        {renderChart('Distance (km)', metrics.distanceHistory, '0, 122, 255')}
      </View>
      ) }

      {/* Heatmap */}
      {initialRegion && (
        <View style={styles.mapContainer}>
          <Text style={styles.header}>Mapa de calor</Text>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={initialRegion}
            mapType="satellite"
          >
            <Heatmap
              points={metrics.heatmap.map((point) => ({
                latitude: point.latitude,
                longitude: point.longitude,
                weight: 1,
              }))}
              radius={50}
              opacity={0.6}
              gradient={{
                colors: ['#00FF00', '#FFFF00', '#FF0000'], // Verde → Amarillo → Rojo
                startPoints: [0.2, 0.5, 1.0],
                colorMapSize: 256,
              }}
            />
          </MapView>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  performanceContainer: {
    marginBottom: 20,
  },
  chartContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    elevation: 2, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  circularCard: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  cardLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  mapContainer: {
    height: 400,
    marginTop: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    width: Dimensions.get('window').width - 32, // Tamaño dinámico basado en el ancho de la pantalla
    height: 400,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    color: 'gray',
  },
});

export default Dashboard;
