import { View, Text, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Colors, FontFamily, Spacing } from '@/constants/theme';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoSection}>
        <Image
          source={require('@/assets/splash.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.tagline}>
          Seu <Text style={styles.highlight}>Ford</Text>. Sua concessionária.{'\n'}
          <Text style={styles.highlight}>Sempre juntos.</Text>
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          label="Já tenho conta"
          onPress={() => router.push('/auth/login')}
          variant="primary"
        />
        <Button
          label="Criar uma conta"
          onPress={() => router.push('/auth/cadastro')}
          variant="outline"
          style={styles.outlineBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
    paddingBottom: Spacing.xl,
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  logo: {
    width: 220,
    height: 220,
  },
  tagline: {
    fontFamily: FontFamily.body,
    fontSize: 20,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
  },
  highlight: {
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.primary,
  },
  actions: {
    gap: Spacing.sm,
  },
  outlineBtn: {
    marginTop: 4,
  },
});
