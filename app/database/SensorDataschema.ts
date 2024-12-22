// app/database/sensorDataSchema.ts
const SensorDataSchema = {
    name: "SensorData",
    properties: {
      id: "string",
      timestamp: "date",
      latitude: "float?",
      longitude: "float?",
      accelerometerData: "string?", // Datos JSON como string
      gyroscopeData: "string?",    // Datos JSON como string
    },
    primaryKey: "id",
  };
  
  const MetricsSchema = {
    name: "Metrics",
    properties: {
      id: "string",
      totalDistance: "float",
      averageSpeed: "float",
      maxSpeed: "float",
      heatmap: "string?", // Datos de mapa de calor como string
    },
    primaryKey: "id",
  };
  
  export { SensorDataSchema, MetricsSchema };
  