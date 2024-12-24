import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type SensorDataDisplayProps = {
  location: {
    latitude?: number;
    longitude?: number;
  } | null;
  accelerometerData: {
    x?: number;
    y?: number;
    z?: number;
  } | null;
  gyroscopeData: {
    x?: number;
    y?: number;
    z?: number;
  } | null;
  elapsedTime: number;

};

  // Formatear el tiempo transcurrido en hh:mm:ss
  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };


const SensorDataDisplay: React.FC<SensorDataDisplayProps> = ({
  location,
  accelerometerData,
  gyroscopeData,
  elapsedTime
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sensor Data</Text>

      <Text style={styles.timer}>
        {`Session Time: ${formatElapsedTime(elapsedTime)}` }
     </Text>

      <View style={styles.dataContainer}>
        <Text style={styles.label}>GPS:</Text>
        <Text>Latitude: {location?.latitude?.toFixed(6) ?? 'N/A'}</Text>
        <Text>Longitude: {location?.longitude?.toFixed(6) ?? 'N/A'}</Text>
      </View>

      <View style={styles.dataContainer}>
        <Text style={styles.label}>Accelerometer:</Text>
        <Text>X: {accelerometerData?.x?.toFixed(2) ?? 'N/A'}</Text>
        <Text>Y: {accelerometerData?.y?.toFixed(2) ?? 'N/A'}</Text>
        <Text>Z: {accelerometerData?.z?.toFixed(2) ?? 'N/A'}</Text>
      </View>

      <View style={styles.dataContainer}>
        <Text style={styles.label}>Gyroscope:</Text>
        <Text>X: {gyroscopeData?.x?.toFixed(2) ?? 'N/A'}</Text>
        <Text>Y: {gyroscopeData?.y?.toFixed(2) ?? 'N/A'}</Text>
        <Text>Z: {gyroscopeData?.z?.toFixed(2) ?? 'N/A'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  dataContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  fileStatus: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  success: {
    color: 'green',
  },
  error: {
    color: 'red',
  },
  uploadButtonContainer: {
    marginTop: 20,
  },
  uploadStatus: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    color: 'blue',
  },
  timer: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
});

export default SensorDataDisplay;
