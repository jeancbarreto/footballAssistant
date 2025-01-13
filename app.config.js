import 'dotenv/config';

export default () => ({
  expo: {
    name: "sport-IQ",
    slug: "football-assistant",
    version: "1.1.1",
    orientation: "portrait",
    icon: "./assets/images/sportiqadaptative.png",
    scheme: "myapp-dev",
    jsEngine: "hermes",
    userInterfaceStyle: "automatic",
    permissions: [
      "ACCESS_BACKGROUND_LOCATION",
      "FOREGROUND_SERVICE",
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
    ],
    newArchEnabled: true,
    ios: {
      config: {
        googleMapsApiKey: process.env.GOOGLE_IOS_API_KEY,
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "This app needs access to your location to display maps and provide accurate tracking.",
        NSLocationAlwaysUsageDescription: "This app needs access to your location in the background to track your activities.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "This app needs access to your location to provide seamless tracking.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/sportiqadaptative.png",
        backgroundColor: "#4d7aae",
      },
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_API_KEY,
        },
      },
      package: "com.jeancbarreto24.footballassistant",
    },
    plugins: [
      "expo-router",
      "expo-sqlite",
      [
        "expo-build-properties", // Este debe estar en un arreglo
        {
          android: {
            permissions: [
              "ACCESS_BACKGROUND_LOCATION",
              "FOREGROUND_SERVICE",
              "ACCESS_FINE_LOCATION",
              "ACCESS_COARSE_LOCATION",
            ],
          },
        },
      ],
      "expo-secure-store",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location.",
          isAndroidBackgroundLocationEnabled: true,
          isAndroidForegroundServiceEnabled: true,
        },
      ],
      
      [
        "expo-asset",
        {
          "assets": ["./assets/images/sportiq.png"]
        }
      ],
      
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "fb4389ee-4a27-4eda-9ad1-acb3b6dd2384",
      },
    },
    owner: "jeancbarreto24",
  },
});
