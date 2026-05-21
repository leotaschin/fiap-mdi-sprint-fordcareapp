import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Dealership } from '@/constants/fordDealerships';
import { Colors, FontFamily, Spacing } from '@/constants/theme';

type Props = {
  dealership: Dealership & { distanceKm?: number };
  onAgendar: () => void;
};

export function DealershipCard({ dealership, onAgendar }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{dealership.name}</Text>
        <Text style={styles.address}>{dealership.address}, {dealership.neighborhood}</Text>
        {dealership.distanceKm !== undefined && (
          <Text style={styles.distance}>{dealership.distanceKm.toFixed(1)} km de você</Text>
        )}
      </View>
      <TouchableOpacity style={styles.btn} onPress={onAgendar}>
        <Text style={styles.btnText}>Agendar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  info: { flex: 1 },
  name: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  address: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  distance: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
    color: Colors.primaryLight,
    marginTop: 2,
  },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  btnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
});
