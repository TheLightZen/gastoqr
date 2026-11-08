import type { SFSymbol } from 'sf-symbols-typescript';
import type { AndroidSymbol } from 'expo-symbols';

/**
 * Íconos disponibles para categorías. En la BD se guarda la clave (nombre Material),
 * y aquí se traduce a SF Symbol para iOS.
 */
export const CATEGORY_ICONS = {
  restaurant: 'fork.knife',
  directions_bus: 'bus.fill',
  fitness_center: 'dumbbell.fill',
  bolt: 'bolt.fill',
  autorenew: 'arrow.triangle.2.circlepath',
  sports_esports: 'gamecontroller.fill',
  category: 'square.grid.2x2.fill',
  shopping_cart: 'cart.fill',
  home: 'house.fill',
  school: 'graduationcap.fill',
  local_hospital: 'cross.case.fill',
  local_cafe: 'cup.and.saucer.fill',
  pets: 'pawprint.fill',
  checkroom: 'tshirt.fill',
  card_giftcard: 'gift.fill',
  phone_iphone: 'iphone',
  local_gas_station: 'fuelpump.fill',
  movie: 'film.fill',
  flight: 'airplane',
  local_bar: 'wineglass.fill',
} as const satisfies Partial<Record<AndroidSymbol, SFSymbol>>;

export type CategoryIconKey = keyof typeof CATEGORY_ICONS;
export const CATEGORY_ICON_KEYS = Object.keys(CATEGORY_ICONS) as CategoryIconKey[];
export const FALLBACK_ICON: CategoryIconKey = 'category';

export function isCategoryIconKey(key: string): key is CategoryIconKey {
  return key in CATEGORY_ICONS;
}

export const CATEGORY_COLORS = [
  '#F97316',
  '#3B82F6',
  '#22C55E',
  '#EAB308',
  '#A855F7',
  '#EC4899',
  '#64748B',
  '#EF4444',
  '#14B8A6',
  '#6366F1',
  '#84CC16',
  '#0EA5E9',
] as const;

export const UNCATEGORIZED_COLOR = '#94A3B8';

export const DEFAULT_CATEGORIES: { name: string; icon: CategoryIconKey; color: string }[] = [
  { name: 'Comida', icon: 'restaurant', color: '#F97316' },
  { name: 'Transporte', icon: 'directions_bus', color: '#3B82F6' },
  { name: 'Gym', icon: 'fitness_center', color: '#22C55E' },
  { name: 'Servicios', icon: 'bolt', color: '#EAB308' },
  { name: 'Suscripciones', icon: 'autorenew', color: '#A855F7' },
  { name: 'Ocio', icon: 'sports_esports', color: '#EC4899' },
  { name: 'Otros', icon: 'category', color: '#64748B' },
];
