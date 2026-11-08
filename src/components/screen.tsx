import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';

type Props = {
  title: string;
  children: ReactNode;
  /** Elemento fijo encima del contenido (p. ej. el botón "+"). */
  overlay?: ReactNode;
};

/** Pantalla de pestaña: título grande + contenido desplazable. */
export function TabScreen({ title, children, overlay }: Props) {
  const theme = useTheme();
  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic">
        <View style={styles.inner}>
          <ThemedText type="subtitle">{title}</ThemedText>
          {children}
        </View>
      </ScrollView>
      {overlay}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six + Spacing.five,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
});
