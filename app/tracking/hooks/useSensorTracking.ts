import * as SQLite from 'expo-sqlite';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { openDatabase, initializeDatabase, saveData, getAllData, clearDatabase } from '../../database/sqlite';

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
  sessionTime: number; // En segundos
  caloriesBurned: number; // En kcal
  abruptMovements: number; // Cantidad de movimientos bruscos
};

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
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0); // Estado del temporizador
  const [abruptMovements, setAbruptMovements] = useState(0);

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

  // Actualizar el temporizador cada segundo
  useEffect(() => {
    if (isTracking && startTime) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setElapsedTime(0); 
    }
  }, [isTracking, startTime]);
  

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

    setStartTime(Date.now());

    // GPS Listener
    const locSub = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Highest, timeInterval: 200 },
      async (newLocation) => {
        setLocation(newLocation.coords);
        const timestamp = new Date().toISOString();
        await insertSensorData(
          timestamp,
          newLocation.coords.latitude,
          newLocation.coords.longitude,
          accelerometerData,
          gyroscopeData
        );
      }
    );
    setLocationSubscription(locSub);

    // Accelerometer Listener
    let previousAccel: SensorData | null = null;
    const accelSub = Accelerometer.addListener((data) => {
      setAccelerometerData(data);
      const timestamp = new Date().toISOString();

      if (previousAccel && detectAbruptMovement(data, previousAccel)) {
        setAbruptMovements((prev) => prev + 1);
      }
      previousAccel = data;

      insertSensorData(
        timestamp,
        location?.latitude || null,
        location?.longitude || null,
        data,
        gyroscopeData
      );
    });
    setAccelerometerSubscription(accelSub);

    // Gyroscope Listener
    const gyroSub = Gyroscope.addListener((data) => {
      setGyroscopeData(data);
      const timestamp = new Date().toISOString();
      insertSensorData(
        timestamp,
        location?.latitude || null,
        location?.longitude || null,
        accelerometerData,
        data
      );
    });
    setGyroscopeSubscription(gyroSub);

    setIsTracking(true);
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

      const gpsData: { latitude: number; longitude: number }[] = [];
      let totalDistance = 0;
      let maxSpeed = 0;

      rows.forEach((row) => {
        const { latitude, longitude } = row.value;
        if (latitude !== null && longitude !== null) {
          gpsData.push({ latitude, longitude });
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
            totalDistance += distance;

            const speed = distance / 1;
            if (speed > maxSpeed) maxSpeed = speed;
          }
        });
      }

      const averageSpeed = gpsData.length > 1 ? (totalDistance / gpsData.length) * 3.6 : 0;
      maxSpeed *= 3.6;

      const caloriesBurned = calculateCalories(totalDistance);

      setMetrics({
        distance: totalDistance,
        averageSpeed,
        maxSpeed,
        heatmap: gpsData,
        sessionTime: elapsedTime,
        caloriesBurned,
        abruptMovements,
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

    await clearDatabase(db);
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
