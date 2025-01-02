import React from 'react';
import { View, StyleSheet, Button, Text } from 'react-native';
import SensorDataDisplay from '../tracking/components/SensorDataDisplay';
import StartStopButton from '../tracking/components/StartStopButton';
import { useSensorTracking } from '../tracking/hooks/useSensorTracking';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

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
    elapsedTime,
  } = useSensorTracking();

  const insets = useSafeAreaInsets();

  const router = useRouter();

  const navigateToDashboard = async () => {
    await processFileForMetrics();
    router.push({
      pathname: './views/dashboard',
      params: { metrics: JSON.stringify(metrics) },
    });
  };

  const styleNew = {
    ...styles.container,
    paddingTop: insets.top,
  }

  return (
    <><StatusBar
      animated={true} style='dark' />
      <View style={styleNew}>

        <View style={styles.dataContainer}>
          <SensorDataDisplay
            location={location}
            accelerometerData={accelerometerData}
            gyroscopeData={gyroscopeData}
            elapsedTime={elapsedTime} />
        </View>

        <StartStopButton
          isTracking={isTracking}
          onStart={startTracking}
          onStop={stopTracking}
          onClean={cleanDb} />


        <View style={styles.buttonContainer}>
          <Button title="View Dashboard" onPress={navigateToDashboard} disabled={isTracking} />
        </View>
      </View></>
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
