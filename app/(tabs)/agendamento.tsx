import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontFamily, Spacing } from '@/constants/theme';

export default function AgendamentoScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Concessionárias Ford</Text>
        <Text style={styles.subtitle}>Encontre a mais próxima de você</Text>
      </View>

      {/* TODO: campo de busca por nome ou bairro */}
      {/* TODO: MapView com pins das concessionárias */}
      {/* TODO: lista de <DealershipCard /> */}
      {/* TODO: BottomSheet de agendamento ao selecionar concessionária */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 32,
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
});
