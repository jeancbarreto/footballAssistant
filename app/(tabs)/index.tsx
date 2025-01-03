import React, { useState } from 'react';
import { View, StyleSheet, Button, Text, FlatList } from 'react-native';
import { useSensorTracking } from '../tracking/hooks/useSensorTracking';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

const TrackingScreen = () => {
  const {
    isTracking,
    startTracking,
    stopTracking,
    cleanDb,
    elapsedTime,
  } = useSensorTracking();

  const [laps, setLaps] = useState<{ id: string; label: string; time: string }[]>([]);

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const formatElapsedTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const registerLap = () => {
    const newLapTime = formatElapsedTime(elapsedTime);
    setLaps((prevLaps) => [
      ...prevLaps,
      {
        id: (prevLaps.length + 1).toString(),
        label: `Sesion ${prevLaps.length + 1}`,
        time: newLapTime,
      },
    ]);
  };

  const handleStopTracking = () => {
    registerLap(); // Registrar el lap automáticamente
    stopTracking(); // Llamar a la función para detener el tracking
  };

  const handleClean = () => {
    cleanDb()
    setLaps([])
  }

  const navigateToDashboard = async () => {
    router.push({
      pathname: '/views/Dashboard',
      params: { title: 'Dashboard' },
    });
  };

  const progress = (elapsedTime % 60) / 60; // Progreso en el círculo (0-1)

  const stylesFound = {
    ...styles.container, 
    paddingTop: insets.top,
  };

  return (
    <View style={stylesFound}>
      {/* Circular Timer */}
      <View style={styles.timerContainer}>
        <Svg height="200" width="200">
          <Circle
            cx="100"
            cy="100"
            r="90"
            stroke="#d3d3d3"
            strokeWidth="10"
            fill="none"
          />
          <Circle
            cx="100"
            cy="100"
            r="90"
            stroke="#ff6347"
            strokeWidth="10"
            fill="none"
            strokeDasharray="565" // Circunferencia aproximada
            strokeDashoffset={565 - progress * 565}
            rotation="-90"
            origin="100,100"
          />
        </Svg>
        <Text style={styles.timerText}>{formatElapsedTime(elapsedTime)}</Text>
      </View>

      {/* Lap List */}
      <FlatList
        data={laps}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.lapItem}>
            <Text style={styles.lapLabel}>{item.label}</Text>
            <Text style={styles.lapTime}>{item.time}</Text>
          </View>
        )}
        style={styles.lapList}
      />

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <Button title="Start" onPress={startTracking} disabled={isTracking} />
        <Button title="Stop" onPress={handleStopTracking} disabled={!isTracking} />
        <Button title="Clean DB" onPress={handleClean} disabled={isTracking} />
        <Button title="View Dashboard" onPress={navigateToDashboard} disabled={isTracking} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
    paddingLeft: 16,
  },
  timerContainer: {
    flex: 1, // Ocupa más espacio disponible
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    position: 'absolute',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  lapList: {
    width: '100%',
    marginVertical: 20,
  },
  lapItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  lapLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  lapTime: {
    fontSize: 18,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default TrackingScreen;
