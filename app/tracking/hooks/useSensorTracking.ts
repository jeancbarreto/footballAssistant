import * as SQLite from 'expo-sqlite';
import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { openDatabase, initializeDatabase, saveData, getAllData, clearDatabase } from '../../database/sqlite';
import { KalmanFilter } from '../../utils/KalmanFilter';

type SensorData = {
  x: number;
  y: number;
  z: number;
};

type Metrics = {
  distance: number; // En metros
  averageSpeed: number; // En km/h
  maxSpeed: number; // En km/h
  heatmap: { latitude: number; longitude: number }[]; // Coordenadas para el mapa de calor
  routes: { coordinates: { latitude: number; longitude: number }[]; speed: number }[]
  sessionTime: number; // En segundos
  caloriesBurned: number; // En kcal
  abruptMovements: number; // Cantidad de movimientos bruscos
  distanceHistory: number[]; // Distancia acumulada en intervalos
};

const timeInterval = 1500; // Intervalo de tiempo para la actualización de la ubicación

export const useSensorTracking = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [accelerometerData, setAccelerometerData] = useState<SensorData | null>(null);
  const [gyroscopeData, setGyroscopeData] = useState<SensorData | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);
  const [accelerometerSubscription, setAccelerometerSubscription] = useState<ReturnType<typeof Accelerometer.addListener> | null>(null);
  const [gyroscopeSubscription, setGyroscopeSubscription] = useState<ReturnType<typeof Gyroscope.addListener> | null>(null);

  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0); // Estado del temporizador
  const [distanceHistory, setDistanceHistory] = useState<number[]>([]);

const [sensorDataBuffer, setSensorDataBuffer] = useState<{
  latitude: number | null;
  longitude: number | null;
  accelerometer: SensorData | null;
  gyroscope: SensorData | null;
  timestamp: string | null;
}>({
  latitude: null,
  longitude: null,
  accelerometer: null,
  gyroscope: null,
  timestamp: null,
});

  // Inicializar la base de datos al montar el hook
  useEffect(() => {
    (async () => {
      try {
        const database = await openDatabase();
        await initializeDatabase(database);
        setDb(database);
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
    const {timestamp, latitude, longitude, gyroscope, accelerometer} = sensorDataBuffer;
    if (timestamp && latitude && longitude && gyroscope && accelerometer) {
      insertSensorData(
        sensorDataBuffer.timestamp!,
        sensorDataBuffer.latitude,
        sensorDataBuffer.longitude,
        sensorDataBuffer.accelerometer,
        sensorDataBuffer.gyroscope
      );
  }}) ();
  }, [sensorDataBuffer]);
  

  // Fórmula básica para calcular calorías quemadas
  const calculateCalories = (distance: number): number => {
    return (distance / 1000) * 60; // 60 kcal por kilómetro recorrido
  };

  // Detecta movimientos bruscos basados en cambios en el acelerómetro
  const detectAbruptMovement = (current: SensorData, previous: SensorData | null): boolean => {
    if (!previous) return false;
    const delta =
      Math.abs(current.x - previous.x) +
      Math.abs(current.y - previous.y) +
      Math.abs(current.z - previous.z);
    return delta > 1.5; // Umbral ajustable para detectar movimientos bruscos
  };

  const insertSensorData = async (
    timestamp: string,
    latitude: number | null,
    longitude: number | null,
    accel: SensorData | null,
    gyro: SensorData | null
  ) => {
    if (!db) {
      console.error('Database is not initialized');
      return;
    }

    const sensorData = {
      timestamp,
      latitude,
      longitude,
      accelerometer: accel,
      gyroscope: gyro,
    };

    await saveData(db, `sensor_${timestamp}`, sensorData);
  };

  const startTracking = async () => {
    if (!db) {
      console.error('Database is not initialized');
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission denied');
      return;
    }

    // GPS Listener
    const locSub = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Highest, timeInterval: timeInterval, distanceInterval: 0.5 },
      async (newLocation) => {
        setLocation(newLocation.coords);
        const timestamp = new Date().toISOString();
        setSensorDataBuffer((prev) => ({
          ...prev,
          latitude: newLocation.coords.latitude,
          longitude: newLocation.coords.longitude,
          timestamp: timestamp,
        }));
      }
    );
    setLocationSubscription(locSub);

    // Accelerometer Listener
    let previousAccel: SensorData | null = null;
    Accelerometer.setUpdateInterval(timeInterval);
    const accelSub = Accelerometer.addListener((data) => {
      setAccelerometerData(data);
      const timestamp = new Date().toISOString();
      previousAccel = data;

      setSensorDataBuffer((prev) => ({
        ...prev,
        accelerometer:data,
        timestamp: timestamp,
      }));
    });
    setAccelerometerSubscription(accelSub);

    // Gyroscope Listener
    Gyroscope.setUpdateInterval(timeInterval);
    const gyroSub = Gyroscope.addListener((data) => {
      setGyroscopeData(data);
      const timestamp = new Date().toISOString();
      setSensorDataBuffer((prev) => ({
        ...prev,
        gyroscope: data ,
        timestamp: timestamp,
      }));
    });
    setGyroscopeSubscription(gyroSub);

    setIsTracking(true);

    if (sensorDataBuffer.timestamp) {
      await insertSensorData(
        sensorDataBuffer.timestamp,
        sensorDataBuffer.latitude,
        sensorDataBuffer.longitude,
        sensorDataBuffer.accelerometer,
        sensorDataBuffer.gyroscope
      );
    }
  };

  const stopTracking = async () => {
    try {
      if (locationSubscription) {
        locationSubscription.remove();
        setLocationSubscription(null);
      }

      if (accelerometerSubscription) {
        accelerometerSubscription.remove();
        setAccelerometerSubscription(null);
      }

      if (gyroscopeSubscription) {
        gyroscopeSubscription.remove();
        setGyroscopeSubscription(null);
      }

      setIsTracking(false);
      setLocation(null);
      setAccelerometerData(null);
      setGyroscopeData(null);
      setElapsedTime(0); // Reiniciar el temporizador
      setDistanceHistory([]);
    } catch (error) {
      console.error('Error stopping tracking:', error);
    }
  };

  const processFileForMetrics = async () => {
    const database = await openDatabase();
    await initializeDatabase(database);

    const db = database
    if (!db) {
      console.error('Database is not initialized');
      return;
    }

    try {
      const rows = await getAllData(db);

      const gpsData: { latitude: number; longitude: number; timestamp: string }[] = [];
      const routes: { coordinates: { latitude: number; longitude: number }[]; speed: number }[] = [];
      let totalDistance = 0;
      let maxSpeed = 0;
      let totalTimeInSeconds = 0;
      const maxSpeedThreshold = 30;
      let caloriesBurned = 0;
      let abruptMovements = 0;
      let previousAccel: SensorData | null = null;

      rows.forEach((row) => {
        const { latitude, longitude, timestamp, accelerometer  } = row.value;
        if (latitude !== null && longitude !== null && timestamp) {
          gpsData.push({ latitude, longitude, timestamp });
        }

        if (accelerometer) {
          if (
            previousAccel &&
            detectAbruptMovement(accelerometer, previousAccel)
          ) {
            abruptMovements += 1; // Incrementar el contador si se detecta un movimiento abrupto
          }
          previousAccel = accelerometer; // Actualizar el último dato del acelerómetro
        }
      });

      if (gpsData.length > 1) {
        gpsData.forEach((current, index) => {
          if (index > 0) {
            const prev = gpsData[index - 1];
            const R = 6371000;
            const dLat = ((current.latitude - prev.latitude) * Math.PI) / 180;
            const dLon = ((current.longitude - prev.longitude) * Math.PI) / 180;
            const lat1 = (prev.latitude * Math.PI) / 180;
            const lat2 = (current.latitude * Math.PI) / 180;

            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;

            if (distance > 0) {
              const timeInterval =
              (new Date(current.timestamp).getTime() - new Date(prev.timestamp).getTime()) / 1000; // en segundos

              const speed = timeInterval > 0 ? (distance / timeInterval) * 3.6 : 0;
              if (speed > 0 && speed <= maxSpeedThreshold) {
                maxSpeed = Math.max(maxSpeed, speed);
              }

              totalTimeInSeconds += timeInterval;
              if (speed <= maxSpeedThreshold) {
                totalDistance += distance;

                if (
                  current.latitude !== prev.latitude || 
                  current.longitude !== prev.longitude
                ) {
                  distanceHistory.push(totalDistance / 1000);
                }
              }

              routes.push({
                coordinates: [
                  { latitude: prev.latitude, longitude: prev.longitude },
                  { latitude: current.latitude, longitude: current.longitude },
                ],
                speed,
              });
              caloriesBurned += calculateCalories(totalDistance);

            }
          }
        });
      }

      const totalTimeInHours = totalTimeInSeconds / 3600
      const averageSpeed = totalTimeInHours > 0 ? (totalDistance / 1000) / totalTimeInHours : 0;

      setMetrics({
        distance: totalDistance,
        averageSpeed,
        maxSpeed,
        heatmap: gpsData.filter(
          ((seen) => (current) => {
            const key = `${current.latitude}-${current.longitude}`;
            if (seen.has(key)) {
              return false;
            }
            seen.add(key);
            return true;
          })(new Set<string>())
        ),
        routes,
        sessionTime: totalTimeInHours,
        caloriesBurned,
        abruptMovements,
        distanceHistory
      });
    } catch (error) {
      console.error('Error processing metrics:', error);
    }
  };

  const cleanDb = async () => {
    if (!db) {
      console.error('Database is not initialized');
      return;
    }

    await clearDatabase(db).then(res => alert("limpieza completa!"));

  };

  return {
    isTracking,
    location,
    accelerometerData,
    gyroscopeData,
    metrics,
    elapsedTime,
    startTracking,
    stopTracking,
    cleanDb,
    processFileForMetrics,
  };
};
