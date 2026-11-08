import { addDatabaseChangeListener, useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';

type QueryResult<T> = { data: T | undefined; error: Error | null; loading: boolean };

type Resolved<T> = { key: string; data: T | undefined; error: Error | null };

/**
 * Ejecuta una consulta y la vuelve a ejecutar:
 * - cuando cambian `deps` (p. ej. el mes o los filtros), y
 * - cuando cambia cualquier tabla de la BD (requiere `enableChangeListener: true`).
 *
 * Así las pantallas se actualizan solas al guardar/editar/borrar desde otra pantalla.
 * Mientras llega el nuevo resultado se sigue mostrando el anterior (`loading: true`).
 */
export function useQuery<T>(
  query: (db: SQLiteDatabase) => Promise<T>,
  deps: readonly unknown[] = [],
): QueryResult<T> {
  const db = useSQLiteContext();
  const [dbVersion, setDbVersion] = useState(0);
  const [resolved, setResolved] = useState<Resolved<T>>({
    key: '',
    data: undefined,
    error: null,
  });

  // Guardamos la última función para no depender de su identidad.
  const queryRef = useRef(query);
  useEffect(() => {
    queryRef.current = query;
  });

  useEffect(() => {
    const subscription = addDatabaseChangeListener(() => setDbVersion((v) => v + 1));
    return () => subscription.remove();
  }, []);

  const key = `${JSON.stringify(deps)}#${dbVersion}`;

  useEffect(() => {
    let cancelled = false;
    queryRef
      .current(db)
      .then((data) => {
        if (!cancelled) setResolved({ key, data, error: null });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setResolved((prev) => ({
            key,
            data: prev.data,
            error: error instanceof Error ? error : new Error(String(error)),
          }));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [db, key]);

  return { data: resolved.data, error: resolved.error, loading: resolved.key !== key };
}
