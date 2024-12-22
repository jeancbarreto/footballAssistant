import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import MapView, { Heatmap, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSensorTracking } from '../tracking/hooks/useSensorTracking';

const Dashboard = () => {
  const { metrics, processFileForMetrics, isTracking } = useSensorTracking();

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Métricas de rendimiento */}
      <View style={styles.performanceContainer}>
        <Text style={styles.header}>Performance Metrics</Text>
        <Text style={styles.label}>Distance:</Text>
        <Text style={styles.value}>{(metrics.distance / 1000).toFixed(2)} km</Text>

        <Text style={styles.label}>Average Speed:</Text>
        <Text style={styles.value}>{metrics.averageSpeed.toFixed(2)} km/h</Text>

        <Text style={styles.label}>Max Speed:</Text>
        <Text style={styles.value}>{metrics.maxSpeed.toFixed(2)} km/h</Text>
      </View>

      {/* Heatmap */}
      {initialRegion && (
        <View style={styles.mapContainer}>
          <Text style={styles.header}>Movement Heatmap</Text>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={initialRegion}
          >
            <Heatmap
              points={metrics.heatmap.map((point) => ({
                latitude: point.latitude,
                longitude: point.longitude,
                weight: 1, // Puedes ajustar el peso de cada punto
              }))}
              radius={50} // Ajusta el radio del Heatmap
              opacity={0.6} // Ajusta la opacidad del Heatmap
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
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
