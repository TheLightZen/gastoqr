import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Platform, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { formatDay, formatTime, toLocalIso } from '@/lib/dates';

import { Chip } from './ui';

type Props = { value: Date; onChange: (date: Date) => void };

function sameDay(a: Date, b: Date) {
  return toLocalIso(a).slice(0, 10) === toLocalIso(b).slice(0, 10);
}

/** Atajos Hoy / Ayer + selector de fecha y hora. */
export function DateField({ value, onChange }: Props) {
  const now = new Date();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, now.getHours(), now.getMinutes());
  const isToday = sameDay(value, now);
  const isYesterday = sameDay(value, yesterday);
  const iso = toLocalIso(value);

  const openAndroid = (mode: 'date' | 'time') => {
    DateTimePickerAndroid.open({
      value,
      mode,
      is24Hour: true,
      maximumDate: mode === 'date' ? now : undefined,
      onValueChange: (_event, date) => {
        if (mode === 'date') {
          // Mantener la hora que ya tenía
          const next = new Date(value);
          next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
          onChange(next);
        } else {
          const next = new Date(value);
          next.setHours(date.getHours(), date.getMinutes(), 0, 0);
          onChange(next);
        }
      },
    });
  };

  return (
    <View style={styles.row}>
      <Chip label="Hoy" selected={isToday} onPress={() => onChange(new Date())} />
      <Chip label="Ayer" selected={isYesterday} onPress={() => onChange(yesterday)} />
      {Platform.OS === 'android' ? (
        <>
          <Chip
            label={isToday || isYesterday ? 'Otra fecha' : formatDay(iso.slice(0, 10))}
            selected={!isToday && !isYesterday}
            onPress={() => openAndroid('date')}
          />
          <Chip label={formatTime(iso)} selected={false} onPress={() => openAndroid('time')} />
        </>
      ) : (
        <DateTimePicker
          value={value}
          mode="datetime"
          display="compact"
          maximumDate={now}
          onValueChange={(_event, date) => onChange(date)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
