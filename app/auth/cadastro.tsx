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
import { logAuditEvent } from '@/services/auditLog';
import { safeErrorMessage } from '@/utils/safeError';

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
    // Nome: apenas letras, espaços e acentos — sem caracteres especiais
    if (!name.trim()) e.name = 'Este campo é obrigatório';
    else if (!/^[\p{L}\s'-]{2,80}$/u.test(name.trim())) e.name = 'Nome inválido';
    // E-mail: formato padrão RFC estrito
    if (!email.trim()) e.email = 'Este campo é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) e.email = 'E-mail inválido';
    // Senha: mínimo 6, máximo 72 (limite do bcrypt do Supabase)
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
      await logAuditEvent({ action: 'REGISTER', status: 'success' });
      router.replace('/veiculo/cadastro');
    } catch (err) {
      await logAuditEvent({ action: 'REGISTER', status: 'failure' });
      setErrors({ general: safeErrorMessage(err, 'Não foi possível criar sua conta. Tente novamente.') });
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
              maxLength={80}
              onSubmitEditing={() => emailRef.current?.focus()}
            />

            <Input
              ref={emailRef}
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChangeText={(v) => { setEmail(v.trim()); setErrors((p) => ({ ...p, email: '' })); }}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={100}
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
                maxLength={72}
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
                maxLength={72}
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
