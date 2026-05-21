import { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/contexts/UserContext';
import { computeAlerts } from '@/hooks/useAlerts';
import { VehicleCard } from '@/components/VehicleCard';
import { Colors, FontFamily, Spacing } from '@/constants/theme';

const QUICK_ACTIONS = [
  { icon: 'calendar-outline'    as const, label: 'Agendar\nrevisão', route: '/(tabs)/agendamento' },
  { icon: 'construct-outline'   as const, label: 'Ver\nhistórico',   route: '/(tabs)/manutencoes' },
  { icon: 'speedometer-outline' as const, label: 'Atualizar\nKM',    route: '/(tabs)/home'        },
  { icon: 'star-outline'        as const, label: 'Meus\npontos',     route: '/(tabs)/perfil'      },
];

export default function HomeScreen() {
  const { profile, vehicles, selectedVehicleIndex, dispatch } = useUser();
  const { width: screenWidth } = useWindowDimensions();
  const swiperRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const firstName = profile?.name?.split(' ')[0] ?? 'você';

  // Sync swiper position when navigating back to this screen
  useEffect(() => {
    if (selectedVehicleIndex > 0 && vehicles.length > 1) {
      setTimeout(() => {
        swiperRef.current?.scrollTo({ x: selectedVehicleIndex * screenWidth, animated: false });
        setCurrentIndex(selectedVehicleIndex);
      }, 50);
    }
  }, []);

  function handleScrollEnd(e: any) {
    const idx = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    setCurrentIndex(idx);
    dispatch({ type: 'SELECT_VEHICLE', payload: idx });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {firstName} 👋</Text>
            <Text style={styles.headerSub}>
              {vehicles.length > 0
                ? `Veja como está seu ${vehicles[currentIndex]?.model ?? 'Ford'}`
                : 'Cadastre seu veículo'}
            </Text>
          </View>
          <View style={styles.pointsBadge}>
            <Ionicons name="star" size={14} color="#F5A623" />
            <Text style={styles.pointsText}>{profile?.points ?? 0} pts</Text>
          </View>
        </View>

        {/* ── Veículos ────────────────────────────────────────────────── */}
        <View style={styles.vehicleSection}>
          <Text style={styles.sectionLabel}>MEU FORD</Text>
          <TouchableOpacity
            style={styles.addVehicleBtn}
            onPress={() => router.push('/veiculo/cadastro?back=true')}
          >
            <Ionicons name="add" size={15} color={Colors.primary} />
            <Text style={styles.addVehicleText}>Adicionar</Text>
          </TouchableOpacity>
        </View>

        {vehicles.length > 0 ? (
          <>
            {/* Swiper: negative margin breaks out of scroll padding */}
            <ScrollView
              ref={swiperRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScrollEnd}
              style={styles.swiper}
            >
              {vehicles.map((v) => {
                const vehicleAlerts = computeAlerts(v);
                return (
                  <View key={v.id} style={[styles.swiperPage, { width: screenWidth }]}>
                    <View style={styles.cardWrapper}>
                      <VehicleCard
                        vehicle={v}
                        alerts={vehicleAlerts}
                        onAgendar={() => router.push('/(tabs)/agendamento')}
                      />
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Dots indicator */}
            {vehicles.length > 1 && (
              <View style={styles.dotsRow}>
                {vehicles.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i === currentIndex && styles.dotActive]}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          /* Empty state */
          <TouchableOpacity
            style={styles.emptyCard}
            onPress={() => router.push('/veiculo/cadastro')}
          >
            <Ionicons name="car-outline" size={40} color={Colors.primary} />
            <Text style={styles.emptyTitle}>Cadastre seu Ford</Text>
            <Text style={styles.emptySubtitle}>
              Adicione seu veículo para ver alertas e histórico de manutenções.
            </Text>
            <Text style={styles.emptyAction}>Adicionar agora →</Text>
          </TouchableOpacity>
        )}

        {/* ── Atalhos ─────────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Atalhos</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionCard}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.7}
            >
              <View style={styles.actionIcon}>
                <Ionicons name={action.icon} size={22} color={Colors.primary} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 100,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  greeting: {
    fontFamily: FontFamily.display,
    fontSize: 26,
    color: Colors.primary,
  },
  headerSub: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pointsText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.textPrimary,
  },

  // Vehicle section header
  vehicleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  addVehicleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  addVehicleText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
    color: Colors.primary,
  },

  // Swiper
  swiper: {
    marginHorizontal: -Spacing.lg,
  },
  swiperPage: {
    // width set dynamically via screenWidth
  },
  cardWrapper: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C8CEDB',
  },
  dotActive: {
    width: 18,
    backgroundColor: Colors.primary,
  },

  // Empty state
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  emptyTitle: {
    fontFamily: FontFamily.display,
    fontSize: 20,
    color: Colors.primary,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 20,
  },
  emptyAction: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.primary,
    marginTop: Spacing.md,
  },

  // Quick actions
  sectionTitle: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
});
