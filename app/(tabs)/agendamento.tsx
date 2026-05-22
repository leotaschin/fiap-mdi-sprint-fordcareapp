import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { FORD_DEALERSHIPS, Dealership } from '@/constants/fordDealerships';
import { buscarAgendamentos, Agendamento } from '@/services/agendamentos';
import { useUser } from '@/contexts/UserContext';
import { AgendamentoItem } from '@/components/AgendamentoItem';
import { Colors, FontFamily, Spacing } from '@/constants/theme';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isOpen(d: Dealership): boolean {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun, 6 = Sat
  const hour = now.getHours() + now.getMinutes() / 60;
  if (day === 0) return false;
  if (day === 6) return d.openSaturday != null && hour >= d.openSaturday[0] && hour < d.openSaturday[1];
  return hour >= d.openWeekday[0] && hour < d.openWeekday[1];
}

// ─── Dealership Card ──────────────────────────────────────────────────────────

function DealershipCard({
  item,
  onAgendar,
}: {
  item: Dealership;
  onAgendar: (d: Dealership) => void;
}) {
  const open = isOpen(item);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardIcon}>
          <Ionicons name="storefront-outline" size={22} color={Colors.primary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.cardAddress} numberOfLines={1}>
            {item.address} · {item.neighborhood}, {item.city}
          </Text>
          <View style={styles.cardStatus}>
            <View style={[styles.statusDot, { backgroundColor: open ? Colors.success : '#C8CEDB' }]} />
            <Text style={[styles.statusText, { color: open ? Colors.success : Colors.textSecondary }]}>
              {open ? 'Aberto agora' : 'Fechado'}
            </Text>
            <Text style={styles.hoursText}> · {item.hours}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.btnPhone}
          onPress={() => Linking.openURL(`tel:${item.phone.replace(/\D/g, '')}`)}
          activeOpacity={0.7}
        >
          <Ionicons name="call-outline" size={15} color={Colors.primary} />
          <Text style={styles.btnPhoneText}>Ligar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnAgendar}
          onPress={() => onAgendar(item)}
          activeOpacity={0.85}
        >
          <Text style={styles.btnAgendarText}>Agendar visita</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AgendamentoScreen() {
  const { user } = useUser();
  const { confirmedId } = useLocalSearchParams<{ confirmedId?: string }>();
  const [activeTab, setActiveTab] = useState<'concessionarias' | 'agendamentos'>('concessionarias');
  const [search, setSearch] = useState('');
  const [appointments, setAppointments] = useState<Agendamento[]>([]);
  const [statusFilter, setStatusFilter] = useState<'todos' | 'agendado' | 'concluido'>('todos');
  useEffect(() => {
    if (!confirmedId) return;
    setActiveTab('agendamentos');
  }, [confirmedId]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      buscarAgendamentos(user.id)
        .then(setAppointments)
        .catch(() => {});
    }, [user]),
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return FORD_DEALERSHIPS;
    return FORD_DEALERSHIPS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.neighborhood.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q),
    );
  }, [search]);

  const filteredAppointments = useMemo(() => {
    if (statusFilter === 'todos') return appointments;
    return appointments.filter((a) => a.status === statusFilter);
  }, [appointments, statusFilter]);

  function handleAgendar(dealership: Dealership) {
    router.push(`/agendamento/novo?dealershipId=${dealership.id}`);
  }

  return (
    <View style={styles.root}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <SafeAreaView style={styles.safeHeader} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Concessionárias Ford</Text>
          <Text style={styles.subtitle}>Encontre a mais próxima de você</Text>
        </View>

          {/* ── Tab switcher ────────────────────────────────────────────── */}
        <View style={styles.tabCard}>
          {([
            { key: 'concessionarias', label: 'Concessionárias', icon: 'storefront-outline' },
            { key: 'agendamentos',    label: 'Agendamentos',    icon: 'calendar-outline'   },
          ] as const).map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <Ionicons name={tab.icon} size={16} color={isActive ? Colors.primary : Colors.textSecondary} />
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Status filters (only for agendamentos) ──────────────────── */}
        {activeTab === 'agendamentos' && (
          <View style={styles.filterRow}>
            {([
              { key: 'todos',     label: 'Todos'     },
              { key: 'agendado',  label: 'Agendado'  },
              { key: 'concluido', label: 'Concluído' },
            ] as const).map((f) => {
              const isActive = statusFilter === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setStatusFilter(f.key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── Search (only for concessionarias) ───────────────────────── */}
        {activeTab === 'concessionarias' && (
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nome ou bairro…"
              placeholderTextColor={Colors.textSecondary}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              autoCorrect={false}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </SafeAreaView>

      {/* ── List ──────────────────────────────────────────────────────────── */}
      {activeTab === 'concessionarias' ? (
        <FlatList
          data={filtered}
          keyExtractor={(d) => d.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={44} color="#C8CEDB" />
              <Text style={styles.emptyText}>Nenhuma concessionária encontrada.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <DealershipCard item={item} onAgendar={handleAgendar} />
          )}
        />
      ) : (
        <FlatList
          data={filteredAppointments}
          keyExtractor={(a) => a.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={44} color="#C8CEDB" />
              <Text style={styles.emptyText}>Nenhum agendamento ainda.</Text>
              <TouchableOpacity onPress={() => setActiveTab('concessionarias')}>
                <Text style={styles.emptyAction}>Encontrar concessionária →</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => <AgendamentoItem item={item} />}
        />
      )}

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F6FA' },

  // Header
  safeHeader: { backgroundColor: '#F4F6FA' },
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
    fontSize: 13,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontFamily: FontFamily.bodySemiBold,
  },

  // Filter chips
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#D0D5E0',
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchIcon: { flexShrink: 0 },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.textPrimary,
    padding: 0,
  },

  // List
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 100,
  },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(19,58,124,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardInfo: { flex: 1, gap: 3 },
  cardName: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  cardAddress: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  cardStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 11,
  },
  hoursText: {
    fontFamily: FontFamily.body,
    fontSize: 11,
    color: Colors.textSecondary,
    flexShrink: 1,
  },

  // Card actions
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
    paddingTop: Spacing.md,
  },
  btnPhone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 999,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  btnPhoneText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.primary,
  },
  btnAgendar: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
  },
  btnAgendarText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: '#FFFFFF',
  },

  // Empty
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: Spacing.sm,
  },
  emptyText: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyAction: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.primary,
    marginTop: 4,
  },

});
