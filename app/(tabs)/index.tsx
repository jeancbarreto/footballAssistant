import React from 'react';
import { View, StyleSheet, Button, Text } from 'react-native';
import SensorDataDisplay from '../tracking/components/SensorDataDisplay';
import StartStopButton from '../tracking/components/StartStopButton';
import { useSensorTracking } from '../tracking/hooks/useSensorTracking';
import { useRouter } from 'expo-router';

const TrackingScreen = () => {
  const {
    isTracking,
    location,
    accelerometerData,
    gyroscopeData,
    startTracking,
    stopTracking,
    processFileForMetrics,
    cleanDb,
    metrics,
    elapsedTime, // Importar el temporizador desde el hook
  } = useSensorTracking();

  const router = useRouter();

  const navigateToDashboard = async () => {
    await processFileForMetrics();
    router.push({
      pathname: '/dashboard',
      params: { metrics: JSON.stringify(metrics) }, // Pasar metrics como string
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.dataContainer}>
        <SensorDataDisplay
          location={location}
          accelerometerData={accelerometerData}
          gyroscopeData={gyroscopeData}
          elapsedTime={elapsedTime}
        />
      </View>

      <StartStopButton
        isTracking={isTracking}
        onStart={startTracking}
        onStop={stopTracking}
        onClean={cleanDb}
      />

      <View style={styles.buttonContainer}>
        <Button title="View Dashboard" onPress={navigateToDashboard} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 80,
    backgroundColor: '#f5f5f5',
  },
  dataContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
});

export default TrackingScreen;
