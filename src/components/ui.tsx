import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { CATEGORY_ICONS, FALLBACK_ICON, isCategoryIconKey } from '@/constants/categories';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ title, onPress, variant = 'primary', disabled, style }: ButtonProps) {
  const theme = useTheme();
  const background =
    variant === 'primary' ? theme.tint : variant === 'danger' ? 'transparent' : theme.backgroundElement;
  const color = variant === 'primary' ? theme.onTint : variant === 'danger' ? theme.danger : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: background, opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
        variant === 'danger' && { borderWidth: 1, borderColor: theme.danger },
        style,
      ]}>
      <ThemedText style={[styles.buttonText, { color }]}>{title}</ThemedText>
    </Pressable>
  );
}

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
  icon?: string;
};

export function Chip({ label, selected, onPress, color, icon }: ChipProps) {
  const theme = useTheme();
  const accent = color ?? theme.tint;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? accent : theme.backgroundElement,
          opacity: pressed ? 0.7 : 1,
        },
      ]}>
      {icon && <CategoryGlyph icon={icon} size={16} color={selected ? '#fff' : accent} />}
      <ThemedText type="small" style={{ color: selected ? '#fff' : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <ThemedView type="backgroundElement" style={[styles.card, style]}>
      {children}
    </ThemedView>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.sectionTitle}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitleText}>
        {children}
      </ThemedText>
      {right}
    </View>
  );
}

/** Ícono de categoría sin fondo. */
export function CategoryGlyph({
  icon,
  size = 20,
  color,
}: {
  icon: string | null;
  size?: number;
  color: string;
}) {
  const key = icon && isCategoryIconKey(icon) ? icon : FALLBACK_ICON;
  return (
    <SymbolView
      name={{ ios: CATEGORY_ICONS[key], android: key, web: key }}
      size={size}
      tintColor={color}
    />
  );
}

/** Ícono de categoría dentro de un círculo de su color. */
export function CategoryBadge({
  icon,
  color,
  size = 40,
}: {
  icon: string | null;
  color: string;
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <CategoryGlyph icon={icon} size={size * 0.5} color="#fff" />
    </View>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={styles.empty}>
      <ThemedText themeColor="textSecondary">{title}</ThemedText>
      {hint && (
        <ThemedText type="small" themeColor="textSecondary" style={styles.emptyHint}>
          {hint}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingHorizontal: Spacing.four,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: 600,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three - 2,
    borderRadius: 999,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  sectionTitleText: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
    gap: Spacing.one,
  },
  emptyHint: {
    textAlign: 'center',
  },
});
