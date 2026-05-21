import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors, FontFamily, Spacing } from '@/constants/theme';
import { login, esqueceuSenha } from '@/services/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordRef = useRef<TextInput>(null);

  function validate() {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = 'Este campo é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'E-mail inválido';
    if (!password) e.password = 'Este campo é obrigatório';
    return e;
  }

  async function handleLogin() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      const code = err.code ?? '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrors({ general: 'E-mail ou senha incorretos. Tente novamente.' });
      } else {
        setErrors({ general: 'Erro ao entrar. Tente novamente.' });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleEsqueceuSenha() {
    if (!email.trim()) {
      setErrors({ email: 'Digite seu e-mail para recuperar a senha.' });
      return;
    }
    try {
      await esqueceuSenha(email.trim());
      setErrors({ success: 'E-mail de recuperação enviado!' });
    } catch {
      setErrors({ general: 'Não foi possível enviar o e-mail. Verifique o endereço.' });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>

          <Text style={styles.title}>Bem-vindo de volta</Text>
          <Text style={styles.subtitle}>Seu Ford está esperando por você.</Text>

          <View style={styles.form}>
            <Input
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChangeText={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: '', general: '' })); }}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <View>
              <Input
                ref={passwordRef}
                label="Senha"
                placeholder="Sua senha"
                value={password}
                onChangeText={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: '', general: '' })); }}
                error={errors.password}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword((v) => !v)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleEsqueceuSenha} style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Esqueci minha senha</Text>
            </TouchableOpacity>

            {errors.general ? (
              <Text style={styles.errorText}>{errors.general}</Text>
            ) : null}

            {errors.success ? (
              <Text style={styles.successText}>{errors.success}</Text>
            ) : null}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label="Entrar"
            onPress={handleLogin}
            loading={loading}
          />
          <TouchableOpacity onPress={() => router.push('/auth/cadastro')}>
            <Text style={styles.cadastroLink}>
              Não tem conta?{' '}
              <Text style={styles.cadastroLinkBold}>Cadastre-se grátis</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  back: {
    marginBottom: Spacing.lg,
    alignSelf: 'flex-start',
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 28,
    color: Colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  form: {
    gap: Spacing.xs,
  },
  eyeBtn: {
    position: 'absolute',
    right: 0,
    bottom: 22,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.sm,
  },
  forgotText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.primary,
  },
  errorText: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    color: Colors.danger,
    marginTop: Spacing.sm,
  },
  successText: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    color: Colors.success,
    marginTop: Spacing.sm,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  cadastroLink: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  cadastroLinkBold: {
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.primary,
  },
});
