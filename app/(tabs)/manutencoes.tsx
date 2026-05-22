import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import { useAlerts, Alert } from '@/hooks/useAlerts';
import { HistoricoItem, groupMaintenances } from '@/components/HistoricoItem';
import { Colors, FontFamily, Spacing } from '@/constants/theme';

// ─── Constants ────────────────────────────────────────────────────────────────

const SERVICE_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  'Troca de Óleo':    'water-outline',
  'Revisão Geral':    'construct-outline',
  'Rodízio de Pneus': 'disc-outline',
  'Filtro de Ar':     'funnel-outline',
  'Outro':            'build-outline',
};

// ─── Alert Card ───────────────────────────────────────────────────────────────

function lastServiceText(date: Date | null): string {
  if (!date) return '';
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
  if (days < 1) return 'Última revisão: hoje';
  if (days < 30) return `Última revisão: há ${days} dia${days === 1 ? '' : 's'}`;
  const months = Math.round(days / 30);
  return `Última revisão: há ${months} ${months === 1 ? 'mês' : 'meses'}`;
}

function AlertItem({
  alert,
  lastServiceDate,
  onAgendar,
}: {
  alert: Alert;
  lastServiceDate: Date | null;
  onAgendar: (alertType: string) => void;
}) {
  const isUrgente = alert.status === 'urgente';

  const statusText = isUrgente
    ? alert.kmRemaining < 0
      ? `Vencida há ${Math.abs(alert.kmRemaining).toLocaleString('pt-BR')} km`
      : `Vencida há ${Math.abs(alert.daysRemaining)} dias`
    : alert.kmRemaining <= 1500
    ? `Em ${alert.kmRemaining.toLocaleString('pt-BR')} km`
    : `Em ${alert.daysRemaining} dias`;

  const accentColor = isUrgente ? Colors.danger : '#F5A623';
  const icon = SERVICE_ICONS[alert.type] ?? 'build-outline';

  return (
    <View style={[styles.alertCard, { borderLeftColor: accentColor }]}>
      <View style={styles.alertIconWrap}>
        <Ionicons name={icon} size={22} color={Colors.primary} />
      </View>

      <View style={styles.alertInfo}>
        <Text style={styles.alertTitle} numberOfLines={1}>{alert.type}</Text>
        <Text style={styles.alertStatus}>{statusText}</Text>
        <Text style={styles.alertLastService}>{lastServiceText(lastServiceDate)}</Text>
      </View>

      <TouchableOpacity style={styles.alertBtn} onPress={() => onAgendar(alert.type)} activeOpacity={0.7}>
        <Text style={styles.alertBtnText}>
          {isUrgente ? 'Agendar' : 'Lembrar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ManutencoesScreen() {
  const { vehicle, maintenances } = useUser();
  const alerts = useAlerts();

  const [activeTab, setActiveTab] = useState<'alertas' | 'historico'>('alertas');

  const activeAlerts = [...alerts]
    .filter((a) => a.status !== 'ok')
    .sort((a, b) => (a.status === 'urgente' ? -1 : 1) - (b.status === 'urgente' ? -1 : 1));

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeHeader} edges={['top']}>

        {/* ── Header ────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.title}>Manutenção</Text>
          <Text style={styles.subtitle}>
            Acompanhe a saúde do seu Ford e nunca perca uma revisão.
          </Text>
        </View>

        {/* ── Tab switcher ──────────────────────────────────────────────── */}
        <View style={styles.tabCard}>
          {(['alertas', 'historico'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const icon: React.ComponentProps<typeof Ionicons>['name'] =
              tab === 'alertas' ? 'warning-outline' : 'time-outline';
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={icon}
                  size={16}
                  color={isActive ? Colors.primary : Colors.textSecondary}
                />
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab === 'alertas' ? 'Alertas' : 'Histórico'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Vehicle label ─────────────────────────────────────────────── */}
        {vehicle && (
          <View style={styles.vehicleLabel}>
            <Ionicons name="car-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.vehicleLabelText}>
              Ford {vehicle.model} {vehicle.year}
            </Text>
          </View>
        )}
      </SafeAreaView>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'alertas' ? (
          activeAlerts.length > 0 ? (
            activeAlerts.map((alert) => (
              <AlertItem
                key={alert.type}
                alert={alert}
                lastServiceDate={vehicle?.lastServiceDate ?? null}
                onAgendar={(type) => router.push(`/agendamento/novo?alertType=${encodeURIComponent(type)}`)}
              />
            ))
          ) : (
            <View style={styles.empty}>
              <Ionicons name="checkmark-circle-outline" size={52} color={Colors.success} />
              <Text style={styles.emptyTitle}>Tudo em dia!</Text>
              <Text style={styles.emptyText}>Seu Ford está ótimo por enquanto.</Text>
            </View>
          )
        ) : (
          maintenances.length > 0 ? (
            groupMaintenances(maintenances).map((group) => (
              <HistoricoItem key={`${group.date.toISOString()}__${group.dealership}`} group={group} />
            ))
          ) : (
            <View style={styles.empty}>
              <Ionicons name="time-outline" size={52} color="#C8CEDB" />
              <Text style={styles.emptyTitle}>Sem registros</Text>
              <Text style={styles.emptyText}>
                Nenhuma revisão registrada ainda.
              </Text>
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  safeHeader: {
    backgroundColor: '#F4F6FA',
  },

  // Header
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 32,
    color: Colors.primary,
  },
  subtitle: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },

  // Tab switcher
  tabCard: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontFamily: FontFamily.bodySemiBold,
  },
  vehicleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 4,
  },
  vehicleLabelText: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // List
  list: { flex: 1 },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 32,
    gap: Spacing.sm,
  },

  // Alert card
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderLeftWidth: 4,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: 'hidden',
  },
  alertIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(19,58,124,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertInfo: {
    flex: 1,
    gap: 2,
  },
  alertTitle: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  alertStatus: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  alertLastService: {
    fontFamily: FontFamily.body,
    fontSize: 11,
    color: Colors.textSecondary,
    opacity: 0.7,
  },
  alertBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  alertBtnText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
    color: Colors.primary,
  },

  // Empty state
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontFamily: FontFamily.display,
    fontSize: 22,
    color: Colors.textPrimary,
  },
  emptyText: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
});
