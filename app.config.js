import 'dotenv/config';

export default ({ config }) => ({
  expo: {
    name: "sport-IQ",
    slug: "football-assistant",
    version: "1.1.1",
    orientation: "portrait",
    icon: "./assets/images/sportiq-app.png",
    scheme: "myapp-dev",
    jsEngine: "hermes",
    userInterfaceStyle: "automatic",
    permissions: [
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
      "ACCESS_BACKGROUND_LOCATION",
      "FOREGROUND_SERVICE",
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
        foregroundImage: "./assets/images/sportiq-app-bg.png",
        backgroundColor: "#4d7aae",
      },
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_API_KEY,
        },
      },
      package: "com.jeancbarreto24.footballassistant",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/sportiq-app.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#4d7aae",
        },
      ],
      "expo-sqlite",
      [
        "expo-build-properties", // Este debe estar en un arreglo
        {
          android: {
            compileSdkVersion: 33,
            targetSdkVersion: 33,
            minSdkVersion: 21,
            permissions: [
              "ACCESS_FINE_LOCATION",
              "ACCESS_COARSE_LOCATION",
              "ACCESS_BACKGROUND_LOCATION",
              "FOREGROUND_SERVICE",
            ],
          },
        },
      ],
      "expo-secure-store",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location.",
        },
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
