import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import { Level } from '@/contexts/UserContext';
import { logout } from '@/services/auth';
import { Colors, FontFamily, Spacing } from '@/constants/theme';

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVEL_NEXT: Record<Level, number | null> = {
  bronze: 500,
  prata: 1500,
  ouro: null,
};

const LEVEL_MIN: Record<Level, number> = {
  bronze: 0,
  prata: 500,
  ouro: 1500,
};

const LEVEL_COLOR: Record<Level, string> = {
  bronze: '#CD7F32',
  prata: '#8A9BB0',
  ouro: '#F5A623',
};

const LEVEL_LABEL: Record<Level, string> = {
  bronze: 'Bronze',
  prata: 'Prata',
  ouro: 'Ouro',
};

const HOW_TO_EARN = [
  { icon: 'construct-outline',  label: 'Revisão Geral',    pts: 200 },
  { icon: 'water-outline',      label: 'Troca de Óleo',    pts: 100 },
  { icon: 'disc-outline',       label: 'Rodízio de Pneus', pts: 100 },
  { icon: 'funnel-outline',     label: 'Filtro de Ar',     pts: 80  },
  { icon: 'person-add-outline', label: 'Indicar amigo',    pts: 100 },
] as const;

const BENEFITS = [
  { icon: 'pricetag-outline',  label: '10% de desconto na revisão', cost: 500  },
  { icon: 'car-outline',       label: 'Lavagem gratuita',           cost: 300  },
  { icon: 'shield-checkmark-outline', label: 'Revisão gratuita',   cost: 1500 },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function progressToNext(points: number, level: Level): number {
  const next = LEVEL_NEXT[level];
  if (!next) return 1;
  const min = LEVEL_MIN[level];
  return Math.min((points - min) / (next - min), 1);
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PerfilScreen() {
  const { profile, vehicle } = useUser();

  const level: Level = profile?.level ?? 'bronze';
  const points = profile?.points ?? 0;
  const nextThreshold = LEVEL_NEXT[level];
  const progress = progressToNext(points, level);
  const levelColor = LEVEL_COLOR[level];

  async function handleLogout() {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth/WelcomeScreen');
        },
      },
    ]);
  }

  function handleResgate(label: string, cost: number) {
    if (points < cost) {
      Alert.alert(
        'Pontos insuficientes',
        `Você precisa de ${cost} pts para resgatar "${label}". Você tem ${points} pts.`,
      );
      return;
    }
    Alert.alert('Benefício resgatado!', `Apresente na concessionária para usar "${label}".`);
  }

  return (
    <View style={styles.root}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <SafeAreaView style={styles.safeHeader} edges={['top']}>
        <View style={styles.header}>
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>
              {profile?.name ? initials(profile.name) : '?'}
            </Text>
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>
              {profile?.name ?? 'Usuário'}
            </Text>
            <Text style={styles.headerEmail} numberOfLines={1}>
              {profile?.email ?? ''}
            </Text>
            {vehicle && (
              <View style={styles.vehicleRow}>
                <Ionicons name="car-outline" size={12} color="rgba(255,255,255,0.6)" />
                <Text style={styles.vehicleText}>
                  Ford {vehicle.model} {vehicle.year}
                </Text>
              </View>
            )}
          </View>

          {/* Level badge */}
          <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
            <Text style={styles.levelBadgeText}>{LEVEL_LABEL[level]}</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Points card ───────────────────────────────────────────────────── */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsTop}>
            <View>
              <Text style={styles.pointsLabel}>Saldo de pontos</Text>
              <Text style={styles.pointsValue}>{points.toLocaleString('pt-BR')}</Text>
              <Text style={styles.pointsSuffix}>pontos FordCare</Text>
            </View>
            <View style={[styles.levelCircle, { borderColor: levelColor }]}>
              <Ionicons name="star" size={20} color={levelColor} />
              <Text style={[styles.levelCircleText, { color: levelColor }]}>
                {LEVEL_LABEL[level]}
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          {nextThreshold !== null ? (
            <View style={styles.progressWrap}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: levelColor }]} />
              </View>
              <Text style={styles.progressLabel}>
                Faltam {(nextThreshold - points).toLocaleString('pt-BR')} pts para{' '}
                {level === 'bronze' ? 'Prata' : 'Ouro'}
              </Text>
            </View>
          ) : (
            <View style={styles.progressWrap}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: '100%', backgroundColor: levelColor }]} />
              </View>
              <Text style={styles.progressLabel}>Nível máximo atingido!</Text>
            </View>
          )}
        </View>

        {/* ── Como ganhar pontos ────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Como ganhar pontos</Text>
        <View style={styles.listCard}>
          {HOW_TO_EARN.map((item, i) => (
            <View
              key={item.label}
              style={[styles.listRow, i < HOW_TO_EARN.length - 1 && styles.listRowBorder]}
            >
              <View style={styles.listIconWrap}>
                <Ionicons name={item.icon} size={18} color={Colors.primary} />
              </View>
              <Text style={styles.listLabel}>{item.label}</Text>
              <View style={styles.ptsBadge}>
                <Text style={styles.ptsBadgeText}>+{item.pts} pts</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Benefícios ────────────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Resgatar benefícios</Text>
        {BENEFITS.map((b) => {
          const canRedeem = points >= b.cost;
          return (
            <TouchableOpacity
              key={b.label}
              style={[styles.benefitCard, !canRedeem && styles.benefitCardLocked]}
              onPress={() => handleResgate(b.label, b.cost)}
              activeOpacity={0.8}
            >
              <View style={[styles.benefitIcon, !canRedeem && styles.benefitIconLocked]}>
                <Ionicons name={b.icon} size={22} color={canRedeem ? Colors.primary : Colors.textSecondary} />
              </View>
              <View style={styles.benefitInfo}>
                <Text style={[styles.benefitLabel, !canRedeem && styles.benefitLabelLocked]}>
                  {b.label}
                </Text>
                <Text style={[styles.benefitCost, { color: canRedeem ? Colors.success : Colors.textSecondary }]}>
                  {b.cost.toLocaleString('pt-BR')} pts
                </Text>
              </View>
              <Ionicons
                name={canRedeem ? 'chevron-forward' : 'lock-closed-outline'}
                size={18}
                color={canRedeem ? Colors.primary : '#C8CEDB'}
              />
            </TouchableOpacity>
          );
        })}

        {/* ── Configurações ─────────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Configurações</Text>
        <View style={styles.listCard}>
          <TouchableOpacity
            style={[styles.listRow, styles.listRowBorder]}
            onPress={() => router.push('/veiculo/cadastro')}
            activeOpacity={0.7}
          >
            <View style={styles.listIconWrap}>
              <Ionicons name="car-outline" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.listLabel}>Meu veículo</Text>
            <Ionicons name="chevron-forward" size={18} color="#C8CEDB" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.listRow}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={[styles.listIconWrap, styles.listIconDanger]}>
              <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
            </View>
            <Text style={[styles.listLabel, styles.listLabelDanger]}>Sair da conta</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>FordCare · v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F6FA' },

  // Header
  safeHeader: { backgroundColor: Colors.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.primary,
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: FontFamily.display,
    fontSize: 22,
    color: '#FFFFFF',
  },
  headerInfo: { flex: 1, gap: 2 },
  headerName: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  headerEmail: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  vehicleText: {
    fontFamily: FontFamily.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  levelBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    flexShrink: 0,
  },
  levelBadgeText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
    gap: Spacing.sm,
  },

  // Points card
  pointsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: Spacing.sm,
  },
  pointsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  pointsLabel: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  pointsValue: {
    fontFamily: FontFamily.display,
    fontSize: 48,
    color: Colors.primary,
    lineHeight: 52,
  },
  pointsSuffix: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  levelCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  levelCircleText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
  },
  progressWrap: { gap: 6 },
  progressTrack: {
    height: 6,
    backgroundColor: '#E8ECF2',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  progressLabel: {
    fontFamily: FontFamily.body,
    fontSize: 11,
    color: Colors.textSecondary,
  },

  // Section title
  sectionTitle: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: Spacing.sm,
  },

  // Generic list card
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  listRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F2F5',
  },
  listIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(19,58,124,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  listIconDanger: {
    backgroundColor: 'rgba(214,43,43,0.07)',
  },
  listLabel: {
    flex: 1,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  listLabelDanger: {
    color: Colors.danger,
  },
  ptsBadge: {
    backgroundColor: 'rgba(30,138,68,0.1)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  ptsBadgeText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
    color: Colors.success,
  },

  // Benefit cards
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  benefitCardLocked: {
    opacity: 0.6,
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(19,58,124,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  benefitIconLocked: {
    backgroundColor: '#F0F2F5',
  },
  benefitInfo: { flex: 1, gap: 2 },
  benefitLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  benefitLabelLocked: {
    color: Colors.textSecondary,
  },
  benefitCost: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
  },

  versionText: {
    fontFamily: FontFamily.body,
    fontSize: 11,
    color: '#C8CEDB',
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
