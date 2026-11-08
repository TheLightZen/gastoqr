import Constants from 'expo-constants';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { TabScreen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Card, SectionTitle } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function SettingsScreen() {
  const theme = useTheme();
  const version = Constants.expoConfig?.version ?? '—';

  return (
    <TabScreen title="Ajustes">
      <SectionTitle>Datos</SectionTitle>
      <Card style={styles.noPadding}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/categories')}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
          <View style={styles.rowText}>
            <ThemedText>Categorías y presupuestos</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Crear, editar o eliminar categorías
            </ThemedText>
          </View>
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={20}
            tintColor={theme.textSecondary}
          />
        </Pressable>
      </Card>

      <SectionTitle>Acerca de</SectionTitle>
      <Card style={styles.about}>
        <ThemedText>GastoQR · versión {version}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Tus gastos se guardan solo en este celular. No hay cuenta ni servidor.
        </ThemedText>
      </Card>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  noPadding: {
    padding: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  rowText: {
    flex: 1,
  },
  pressed: {
    opacity: 0.6,
  },
  about: {
    gap: Spacing.one,
  },
});
