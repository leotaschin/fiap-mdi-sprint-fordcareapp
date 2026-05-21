import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import { useAlerts } from '@/hooks/useAlerts';
import { AlertCard } from '@/components/AlertCard';
import { MaintenanceItem } from '@/components/MaintenanceItem';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { registrarManutencao } from '@/services/maintenance';
import { atualizarServico } from '@/services/vehicle';
import { Colors, FontFamily, Spacing } from '@/constants/theme';
import { Level } from '@/contexts/UserContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_CHIPS = ['Todos', 'Revisão', 'Óleo', 'Pneus', 'Filtro'];

const FILTER_MATCH: Record<string, string> = {
  Revisão: 'Revisão',
  Óleo: 'Óleo',
  Pneus: 'Pneus',
  Filtro: 'Filtro',
};

const SERVICE_TYPES = [
  { key: 'Troca de Óleo',    label: '🛢️ Óleo',    points: 100 },
  { key: 'Revisão Geral',    label: '🔧 Revisão',  points: 200 },
  { key: 'Rodízio de Pneus', label: '🔄 Pneus',    points: 100 },
  { key: 'Filtro de Ar',     label: '💨 Filtro',   points: 80  },
  { key: 'Outro',            label: '⚙️ Outro',    points: 50  },
];

function computeLevel(points: number): Level {
  if (points >= 1500) return 'ouro';
  if (points >= 500) return 'prata';
  return 'bronze';
}

function parseDate(str: string): Date | null {
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  const d = new Date(`${year}-${month}-${day}`);
  return isNaN(d.getTime()) ? null : d;
}

function maskDate(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  let out = digits;
  if (digits.length > 2) out = digits.slice(0, 2) + '/' + digits.slice(2);
  if (digits.length > 4) out = out.slice(0, 5) + '/' + digits.slice(4);
  return out;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ManutencoesScreen() {
  const { user, profile, vehicle, maintenances, dispatch } = useUser();
  const alerts = useAlerts();

  const [activeTab, setActiveTab] = useState<'alertas' | 'historico'>('alertas');
  const [filter, setFilter] = useState('Todos');
  const [showSheet, setShowSheet] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });

  // Register form
  const [regType, setRegType] = useState('');
  const [regDate, setRegDate] = useState('');
  const [regKm, setRegKm] = useState('');
  const [regDealership, setRegDealership] = useState('');
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [regLoading, setRegLoading] = useState(false);

  // Computed lists
  const filteredAlerts = filter === 'Todos'
    ? alerts
    : alerts.filter((a) => a.type.includes(FILTER_MATCH[filter] ?? ''));

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    const order = { urgente: 0, atencao: 1, ok: 2 };
    return order[a.status] - order[b.status];
  });

  const filteredHistory = filter === 'Todos'
    ? maintenances
    : maintenances.filter((m) => m.type.includes(FILTER_MATCH[filter] ?? ''));

  const selectedService = SERVICE_TYPES.find((s) => s.key === regType);

  function handleTabChange(tab: 'alertas' | 'historico') {
    setActiveTab(tab);
    setFilter('Todos');
  }

  function openSheet() {
    setRegType('');
    setRegDate('');
    setRegKm(vehicle ? String(vehicle.currentKm) : '');
    setRegDealership('');
    setRegErrors({});
    setShowSheet(true);
  }

  function validateForm() {
    const e: Record<string, string> = {};
    if (!regType) e.type = 'Selecione o tipo de serviço';
    if (!regKm.trim() || isNaN(Number(regKm))) e.km = 'KM inválido';
    if (!regDate.trim() || !parseDate(regDate)) e.date = 'Data inválida (DD/MM/AAAA)';
    return e;
  }

  async function handleRegistrar() {
    const e = validateForm();
    if (Object.keys(e).length > 0) { setRegErrors(e); return; }
    if (!user || !vehicle || !profile) return;

    const date = parseDate(regDate)!;
    const km = parseInt(regKm);
    const pointsEarned = selectedService?.points ?? 50;

    setRegLoading(true);
    try {
      const id = await registrarManutencao(user.uid, {
        type: regType,
        date,
        km,
        dealership: regDealership.trim(),
        notes: '',
        pointsEarned,
      });

      await atualizarServico(user.uid, vehicle.id, km, date);

      const newPoints = profile.points + pointsEarned;
      dispatch({
        type: 'ADD_MAINTENANCE',
        payload: { id, type: regType, date, km, dealership: regDealership.trim(), notes: '', pointsEarned },
      });
      dispatch({ type: 'UPDATE_POINTS', payload: { points: newPoints, level: computeLevel(newPoints) } });
      dispatch({ type: 'SET_VEHICLE', payload: { ...vehicle, lastServiceKm: km, lastServiceDate: date } });

      setShowSheet(false);
      setTimeout(() => {
        setToast({ visible: true, message: `Serviço registrado! +${pointsEarned} pontos adicionados.` });
      }, 350);
    } catch {
      setRegErrors({ general: 'Erro ao registrar. Tente novamente.' });
    } finally {
      setRegLoading(false);
    }
  }

  return (
    <View style={styles.root}>

      {/* ── Header azul ─────────────────────────────────────────────────────── */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <Text style={styles.title}>Manutenções</Text>
        <Text style={styles.subtitle}>Acompanhe a saúde do seu Ford.</Text>

        <View style={styles.tabRow}>
          {(['alertas', 'historico'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => handleTabChange(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'alertas' ? 'Alertas' : 'Histórico'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>

      {/* ── Filter chips ─────────────────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipContainer}
        style={styles.chipRow}
      >
        {FILTER_CHIPS.map((chip) => (
          <TouchableOpacity
            key={chip}
            style={[styles.chip, filter === chip && styles.chipActive]}
            onPress={() => setFilter(chip)}
          >
            <Text style={[styles.chipText, filter === chip && styles.chipTextActive]}>{chip}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'alertas' ? (
          sortedAlerts.length > 0 ? (
            sortedAlerts.map((alert) => (
              <AlertCard
                key={alert.type}
                alert={alert}
                onAgendar={() => router.push('/(tabs)/agendamento')}
              />
            ))
          ) : (
            <View style={styles.empty}>
              <Ionicons name="checkmark-circle-outline" size={48} color={Colors.success} />
              <Text style={styles.emptyTitle}>Tudo em dia!</Text>
              <Text style={styles.emptyText}>Seu Ford está ótimo por enquanto.</Text>
            </View>
          )
        ) : (
          filteredHistory.length > 0 ? (
            filteredHistory.map((item) => (
              <MaintenanceItem key={item.id} item={item} />
            ))
          ) : (
            <View style={styles.empty}>
              <Ionicons name="time-outline" size={48} color="#C8CEDB" />
              <Text style={styles.emptyTitle}>Sem registros</Text>
              <Text style={styles.emptyText}>
                Nenhuma revisão registrada ainda. Registre sua primeira manutenção e comece a acumular pontos.
              </Text>
            </View>
          )
        )}
      </ScrollView>

      {/* ── FAB ──────────────────────────────────────────────────────────────── */}
      <TouchableOpacity style={styles.fab} onPress={openSheet} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* ── Register sheet ───────────────────────────────────────────────────── */}
      <BottomSheet
        visible={showSheet}
        onClose={() => setShowSheet(false)}
        title="Registrar serviço"
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Text style={styles.sheetSubtitle}>
            Registre revisões na rede oficial e ganhe pontos FordCare.
          </Text>

          {regErrors.type ? <Text style={styles.fieldError}>{regErrors.type}</Text> : null}
          <View style={styles.typeGrid}>
            {SERVICE_TYPES.map((s) => (
              <TouchableOpacity
                key={s.key}
                style={[styles.typeChip, regType === s.key && styles.typeChipActive]}
                onPress={() => { setRegType(s.key); setRegErrors((p) => ({ ...p, type: '' })); }}
              >
                <Text style={[styles.typeChipText, regType === s.key && styles.typeChipTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedService && (
            <View style={styles.pointsPreview}>
              <Ionicons name="star" size={14} color="#F5A623" />
              <Text style={styles.pointsPreviewText}>
                Você vai ganhar +{selectedService.points} pontos com esse registro
              </Text>
            </View>
          )}

          <Input
            label="KM no momento do serviço"
            placeholder={vehicle ? String(vehicle.currentKm) : 'Ex: 38000'}
            value={regKm}
            onChangeText={(v) => { setRegKm(v); setRegErrors((p) => ({ ...p, km: '' })); }}
            error={regErrors.km}
            keyboardType="number-pad"
            returnKeyType="next"
          />
          <Input
            label="Data do serviço"
            placeholder="DD/MM/AAAA"
            value={regDate}
            onChangeText={(v) => { setRegDate(maskDate(v)); setRegErrors((p) => ({ ...p, date: '' })); }}
            error={regErrors.date}
            keyboardType="number-pad"
            returnKeyType="next"
          />
          <Input
            label="Concessionária (opcional)"
            placeholder="Ex: Ford Morumbi"
            value={regDealership}
            onChangeText={setRegDealership}
            returnKeyType="done"
            onSubmitEditing={handleRegistrar}
          />

          {regErrors.general ? <Text style={styles.fieldError}>{regErrors.general}</Text> : null}

          <View style={styles.sheetFooter}>
            <Button label="Registrar serviço" onPress={handleRegistrar} loading={regLoading} />
          </View>
        </KeyboardAvoidingView>
      </BottomSheet>

      {/* ── Toast ────────────────────────────────────────────────────────────── */}
      <Toast
        message={toast.message}
        visible={toast.visible}
        type="success"
        onHide={() => setToast((p) => ({ ...p, visible: false }))}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },

  // Header
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 32,
    color: '#FFFFFF',
    marginTop: Spacing.xs,
  },
  subtitle: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.70)',
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  tabRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  tabText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
  },
  tabTextActive: {
    color: Colors.primary,
  },

  // Filter chips
  chipRow: {
    backgroundColor: '#FFFFFF',
    maxHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F7',
  },
  chipContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#D0D5E0',
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },

  // List
  list: { flex: 1 },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 120,
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

  // FAB
  fab: {
    position: 'absolute',
    bottom: 110,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },

  // Bottom sheet form
  sheetSubtitle: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  typeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#D0D5E0',
    backgroundColor: '#FFFFFF',
  },
  typeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeChipText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  typeChipTextActive: {
    color: '#FFFFFF',
  },
  pointsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBF0',
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    marginBottom: Spacing.md,
  },
  pointsPreviewText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: '#8A6200',
    flex: 1,
  },
  fieldError: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    color: Colors.danger,
    marginBottom: Spacing.xs,
  },
  sheetFooter: {
    marginTop: Spacing.md,
  },
});
