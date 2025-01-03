import React from "react";
import { Button, StyleSheet, View, Text } from "react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";

WebBrowser.maybeCompleteAuthSession(); // Completar sesión para evitar problemas en dispositivos móviles.

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ; // Reemplaza con tu Client ID de Google

const LoginScreen = () => {
  const [userInfo, setUserInfo] = React.useState(null);
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID  || "",
      scopes: ["profile", "email"],
      redirectUri: AuthSession.makeRedirectUri({
      }),
    },
    {
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenEndpoint: "https://oauth2.googleapis.com/token",
    }
  );

  React.useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      fetchUserInfo(authentication?.accessToken);
    }
  }, [response]);

  const fetchUserInfo = async (accessToken: string | undefined) => {
    try {
      const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const user = await response.json();
      setUserInfo(user);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  return (
    <View style={styles.container}>
      {userInfo ? (
        <View>
          {/* <Text style={styles.text}>Welcome, {userInfo.name}!</Text>
          <Text style={styles.text}>Email: {userInfo.email}</Text> */}
        </View>
      ) : (
        <Button
          disabled={!request}
          title="Sign in with Google"
          onPress={() => {
            promptAsync();
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  text: {
    fontSize: 18,
    marginVertical: 8,
    textAlign: "center",
  },
});

export default LoginScreen;
