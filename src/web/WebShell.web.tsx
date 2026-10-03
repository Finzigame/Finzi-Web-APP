import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import AlertHost from "./AlertHost";
import { PHONE_MAX_WIDTH, PHONE_MAX_HEIGHT } from "./phoneFrame";

// Tamaño real de la ventana (Dimensions esta limitado al tamaño del celular, ver setup.web.ts)
const isWideWindow = () =>
  typeof window !== "undefined" &&
  (window.innerWidth > PHONE_MAX_WIDTH ||
    window.innerHeight > PHONE_MAX_HEIGHT);

// En celular ocupa toda la pantalla. En computadora muestra la app centrada con forma de celular.
export default function WebShell({ children }: { children: React.ReactNode }) {
  const [wide, setWide] = useState(isWideWindow);

  useEffect(() => {
    const onResize = () => setWide(isWideWindow());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <View style={styles.page}>
      <View style={[styles.phone, wide && styles.phoneFramed]}>{children}</View>
      <AlertHost />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5BA4CF",
  },
  phone: {
    width: "100%",
    height: "100%",
    maxWidth: PHONE_MAX_WIDTH,
    maxHeight: PHONE_MAX_HEIGHT,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  phoneFramed: {
    borderRadius: 28,
    shadowColor: "#094069",
    shadowOpacity: 0.35,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 16 },
  },
});
