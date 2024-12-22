import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

// Define los tipos de las props
type StartStopButtonProps = {
  isTracking: boolean; // Indica si el tracking está activo
  onStart: () => void; // Función para iniciar el tracking
  onStop: () => void; // Función para detener el tracking
  onClean: () => void;
};

const StartStopButton: React.FC<StartStopButtonProps> = ({ isTracking, onStart, onStop, onClean }) => {
  return (
    <View style={styles.buttonContainer}>
      <Button title="Start" onPress={onStart} disabled={isTracking} />
      <Button title="Stop" onPress={onStop} disabled={!isTracking} />
      <Button title='Limpiar DB' onPress={onClean} disabled={isTracking} />
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
});

export default StartStopButton;
