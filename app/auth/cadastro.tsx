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
import { cadastrar } from '@/services/auth';

export default function CadastroScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Este campo é obrigatório';
    if (!email.trim()) e.email = 'Este campo é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'E-mail inválido';
    if (!password) e.password = 'Este campo é obrigatório';
    else if (password.length < 6) e.password = 'Mínimo de 6 caracteres';
    if (!confirmPassword) e.confirmPassword = 'Este campo é obrigatório';
    else if (password !== confirmPassword) e.confirmPassword = 'As senhas não coincidem';
    return e;
  }

  async function handleCadastro() {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await cadastrar(name.trim(), email.trim(), password);
      router.replace('/veiculo/cadastro');
    } catch (err: any) {
      const msg = err?.message ?? '';
      if (msg === 'EMAIL_CONFIRMATION_REQUIRED') {
        setErrors({ general: 'Confirmação de e-mail necessária. Desative "Confirm email" no painel do Supabase.' });
      } else if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('User already registered')) {
        setErrors({ email: 'Esse e-mail já está cadastrado. Que tal fazer login?' });
      } else {
        setErrors({ general: `Erro: ${msg || 'Tente novamente.'}` });
      }
    } finally {
      setLoading(false);
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

          <Text style={styles.title}>Crie sua conta</Text>
          <Text style={styles.subtitle}>
            Leva menos de 1 minuto. Seus dados ficam seguros com a gente.
          </Text>

          <View style={styles.form}>
            <Input
              label="Nome completo"
              placeholder="Seu nome"
              value={name}
              onChangeText={(v) => { setName(v); setErrors((p) => ({ ...p, name: '' })); }}
              error={errors.name}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />

            <Input
              ref={emailRef}
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChangeText={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: '' })); }}
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
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChangeText={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: '' })); }}
                error={errors.password}
                secureTextEntry={!showPassword}
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
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

            <View>
              <Input
                ref={confirmRef}
                label="Confirmar senha"
                placeholder="Repita a senha"
                value={confirmPassword}
                onChangeText={(v) => { setConfirmPassword(v); setErrors((p) => ({ ...p, confirmPassword: '' })); }}
                error={errors.confirmPassword}
                secureTextEntry={!showConfirm}
                returnKeyType="done"
                onSubmitEditing={handleCadastro}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowConfirm((v) => !v)}
              >
                <Ionicons
                  name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {errors.general ? (
              <Text style={styles.generalError}>{errors.general}</Text>
            ) : null}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label="Continuar"
            onPress={handleCadastro}
            loading={loading}
          />
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginLink}>
              Já tem uma conta? <Text style={styles.loginLinkBold}>Entrar</Text>
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
  generalError: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    color: Colors.danger,
    marginTop: Spacing.sm,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  loginLink: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  loginLinkBold: {
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.primary,
  },
});
