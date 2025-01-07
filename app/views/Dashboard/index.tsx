import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { Heatmap, Polyline, PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { LineChart } from 'react-native-chart-kit';
import { TimerContext } from '@/app/contexts/timerContext';
import { useSensorTracking } from '../../tracking/hooks/useSensorTracking';
import utilTimer from '../../utils/timer';

const Dashboard = () => {
  const [viewMode, setViewMode] = useState<'heatmap' | 'routes'>('heatmap'); // Alternar entre vistas
  const { metrics, processFileForMetrics } = useSensorTracking();
  const timerContext = useContext(TimerContext);
  const { timeConsumed } = timerContext ?? {};

  useEffect(() => {
    processFileForMetrics();
  }, []);

  // Validación para evitar errores si no hay datos
  if (!metrics || !metrics.heatmap || metrics.heatmap.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Processing data...</Text>
      </View>
    );
  }

  const initialRegion = {
    latitude: metrics.heatmap[0]?.latitude || 0,
    longitude: metrics.heatmap[0]?.longitude || 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // Obtener el color según la velocidad
  const getColorBySpeed = (speed: number) => {
    if (speed < 5) return '#00FF00'; // Verde
    if (speed < 15) return '#FFFF00'; // Amarillo
    if (speed < 25) return '#FFA500'; // Naranja
    return '#FF0000'; // Rojo
  };

  const calculateDirectionAngle = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const y = Math.sin(dLon) * Math.cos(lat2 * (Math.PI / 180));
    const x =
      Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
      Math.sin(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.cos(dLon);

    const angle = (Math.atan2(y, x) * 180) / Math.PI;
    return (angle + 360) % 360; // Devuelve un ángulo positivo
  };

  // Renderizar el mapa de calor
  const renderHeatmap = () => (
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
          colors: ['#00FF00', '#FFFF00', '#FF0000'],
          startPoints: [0.2, 0.5, 1.0],
          colorMapSize: 256,
        }}
      />
    </MapView>
  );

  // Renderizar los recorridos
  const renderRoutes = () => (
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        mapType="satellite"
        initialRegion={{
          latitude: metrics.heatmap[0].latitude,
          longitude: metrics.heatmap[0].longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {metrics.routes.map((route, index) => {
          const start = route.coordinates[0];
          const end = route.coordinates[1];
          const angle = calculateDirectionAngle(
            start.latitude,
            start.longitude,
            end.latitude,
            end.longitude
          );
  
          return (
            <React.Fragment key={index}>
              {/* Línea del segmento */}
              <Polyline
                coordinates={route.coordinates}
                strokeColor={getColorBySpeed(route.speed)}
                strokeWidth={2}
              />
              {/* Flecha al final del segmento */}
              <Marker
                coordinate={end}
                anchor={{ x: 0.2, y: 0.2 }}
                flat // Asegura que la rotación sigue el mapa
              >
                <View style={styles.arrow}>
                 
                  <Text style={[styles.arrowText, { transform: [{ rotate: `${angle}deg` }] }]}>➤</Text>
                </View>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapView>
  );

  const renderChart = (title: string, data: number[], color: string) => {
    if (!data || data.length === 0) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.label}>{title}</Text>
          <Text style={styles.noDataMessage}>No hay datos disponibles</Text>
        </View>
      );
    }
  
    // Generar etiquetas dinámicas para el eje X según la cantidad de datos
    const labels = data.map((_, index) => (index % Math.ceil(data.length / 5) === 0 ? `${index}` : ''));
  
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.label}>{title}</Text>
        <LineChart
          data={{
            labels: labels, // Etiquetas dinámicas basadas en la longitud de los datos
            datasets: [{ data }],
          }}
          width={Dimensions.get('window').width - 32}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#f0f8ff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 2, // Ajusta los decimales en los valores
            color: (opacity = 1) => `rgba(${color}, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            propsForDots: {
              r: '5', // Tamaño de los puntos
              strokeWidth: '2', // Ancho del borde
              stroke: `rgba(${color}, 1)`, // Color del borde
            },
            propsForBackgroundLines: {
              strokeDasharray: '5', // Líneas punteadas
            },
          }}
          bezier
          style={{
            borderRadius: 16,
          }}
        />
      </View>
    );
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Analítica</Text>

      {/* Métricas */}
      <View style={styles.metricsContainer}>
        <View style={styles.circularCard}>
          <Text style={styles.cardValue}>{metrics.averageSpeed.toFixed(1)}</Text>
          <Text style={styles.cardLabel}>Velocidad Prom. (km/h)</Text>
        </View>
        <View style={styles.circularCard}>
          <Text style={styles.cardValue}>{metrics.maxSpeed.toFixed(1)}</Text>
          <Text style={styles.cardLabel}>Velocidad Máx. (km/h)</Text>
        </View>
        <View style={styles.circularCard}>
          <Text style={styles.cardValue}>
            {utilTimer.FormatElapsedTime(timeConsumed ?? 0)}
          </Text>
          <Text style={styles.cardLabel}>
            {timeConsumed && timeConsumed > 60
              ? 'Tiempo Sesión (min)'
              : 'Tiempo Sesión (Seg)'}
          </Text>
        </View>
      </View>

      {/* Métricas de rendimiento */}
      {metrics?.distanceHistory.length > 0 && (
        <View style={styles.performanceContainer}>
          {/* Gráficos */}
          {renderChart('Distance (km)', metrics.distanceHistory, '0, 122, 255')}
        </View>
      )}

       {/* Botones para alternar vistas */}
       <View style={styles.switchContainer}>
        <TouchableOpacity
          style={[
            styles.switchButton,
            viewMode === 'heatmap' && styles.activeButton,
          ]}
          onPress={() => setViewMode('heatmap')}
        >
          <Text style={styles.switchText}>Mapa de Calor</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.switchButton,
            viewMode === 'routes' && styles.activeButton,
          ]}
          onPress={() => setViewMode('routes')}
        >
          <Text style={styles.switchText}>Recorridos</Text>
        </TouchableOpacity>
      </View>

      {/* Renderizar mapa dinámico */}
      <View style={styles.mapContainer}>
        {viewMode === 'heatmap' ? renderHeatmap() : renderRoutes()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  noDataMessage: {
    textAlign: 'center',
    color: 'gray',
    fontSize: 14,
    marginTop: 10,
  },
  performanceContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  switchButton: {
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
  },
  activeButton: {
    backgroundColor: '#ff6347',
  },
  switchText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  mapContainer: {
    height: 400,
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  metricsContainer: {
    flexDirection: 'row',
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
    backgroundColor: '#fff',
    borderColor: '#ccc',
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
  message: {
    fontSize: 18,
    textAlign: 'center',
    color: 'gray',
  },
  arrow: {
    backgroundColor: 'transparent',
  },
  arrowText: {
    fontSize: 20,
    color: '#000', // Cambia el color de la flecha aquí
  },
});

export default Dashboard;
function rgba(r: number, g: number, b: number, a: number) {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

