import { supabase } from "@/src/lib/supabase";
import { useAuthStore } from "@/src/stores/useAuthStore";
import MessageBox from "@/src/widgets/MessageBox";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { PortalHost, PortalProvider } from "@gorhom/portal";
import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "./global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Inter: require("@/assets/fonts/Inter_18pt-Medium.ttf"),
  });

  const { session, isLoading, setSession, fetchProfile } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user) fetchProfile(session.user.id);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // Auth guard — redirect based on session
  useEffect(() => {
    if (isLoading || !fontsLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, isLoading, fontsLoaded, segments]);

  // Hide splash once fonts + auth ready
  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading]);

  if (!fontsLoaded || isLoading) return null;

  return (
    <PortalProvider>
      <Slot />
      <MessageBox />
      <PortalHost name="bottomsheet" />
    </PortalProvider>
  );
}
