import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Maintenance } from '@/contexts/UserContext';
import { Colors, FontFamily, Spacing } from '@/constants/theme';

export type MaintenanceGroup = {
  date: Date;
  dealership: string;
  items: Maintenance[];
  totalPoints: number;
};

const SERVICE_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  'Troca de Óleo':    'water-outline',
  'Revisão Geral':    'construct-outline',
  'Rodízio de Pneus': 'disc-outline',
  'Filtro de Ar':     'funnel-outline',
  'Outro':            'build-outline',
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

type Props = { group: MaintenanceGroup };

export function HistoricoItem({ group }: Props) {
  return (
    <View style={styles.card}>

      {/* Header — date + dealership + total points */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={13} color={Colors.primary} />
            <Text style={styles.dateText}>{formatDate(group.date)}</Text>
          </View>
          {group.dealership ? (
            <View style={styles.dealerRow}>
              <Ionicons name="storefront-outline" size={12} color={Colors.textSecondary} />
              <Text style={styles.dealerText} numberOfLines={1}>{group.dealership}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.pointsBadge}>
          <Text style={styles.pointsValue}>+{group.totalPoints}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Service rows */}
      {group.items.map((item, i) => (
        <View
          key={item.id}
          style={[styles.serviceRow, i < group.items.length - 1 && styles.serviceRowBorder]}
        >
          <View style={styles.serviceIconWrap}>
            <Ionicons
              name={SERVICE_ICONS[item.type] ?? 'build-outline'}
              size={16}
              color={Colors.primary}
            />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceType}>{item.type}</Text>
            {item.km > 0 && (
              <Text style={styles.serviceMeta}>{item.km.toLocaleString('pt-BR')} km</Text>
            )}
          </View>
          <View style={styles.servicePoints}>
            <Text style={styles.servicePointsText}>+{item.pointsEarned} pts</Text>
          </View>
        </View>
      ))}

    </View>
  );
}

// ─── Group helper ─────────────────────────────────────────────────────────────

export function groupMaintenances(maintenances: Maintenance[]): MaintenanceGroup[] {
  const map = new Map<string, MaintenanceGroup>();

  for (const m of maintenances) {
    const day = m.date.toISOString().slice(0, 10);
    const key = `${day}__${m.dealership}`;
    if (!map.has(key)) {
      map.set(key, { date: m.date, dealership: m.dealership, items: [], totalPoints: 0 });
    }
    const group = map.get(key)!;
    group.items.push(m);
    group.totalPoints += m.pointsEarned;
  }

  return Array.from(map.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.primary,
  },
  dealerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dealerText: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },

  // Points badge
  pointsBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(30,138,68,0.09)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 52,
  },
  pointsValue: {
    fontFamily: FontFamily.display,
    fontSize: 17,
    color: Colors.success,
    lineHeight: 20,
  },
  pointsLabel: {
    fontFamily: FontFamily.body,
    fontSize: 10,
    color: Colors.success,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E8ECF2',
    marginHorizontal: Spacing.md,
  },

  // Service rows
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  serviceRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F2F5',
  },
  serviceIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(19,58,124,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  serviceInfo: {
    flex: 1,
    gap: 2,
  },
  serviceType: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  serviceMeta: {
    fontFamily: FontFamily.body,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  servicePoints: {
    alignItems: 'flex-end',
  },
  servicePointsText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 11,
    color: Colors.success,
  },
});
