import { useCallback, useEffect, useRef, useState } from 'react';

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** Vuelve a ejecutar la función (p. ej. pull-to-refresh o tras una mutación). */
  reload: () => void;
};

/**
 * Hook mínimo de data-fetching para las pantallas Expo (no usamos TanStack Query
 * en móvil todavía). Ejecuta `fn` al montar y cuando cambian las `deps`; ignora
 * resultados de llamadas obsoletas. Las queries de @open-coach/shared lanzan en
 * error, así que aquí lo capturamos para la UI.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: readonly unknown[]): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const callId = useRef(0);

  const run = useCallback(() => {
    const id = ++callId.current;
    setLoading(true);
    setError(null);
    fn()
      .then((result) => {
        if (id === callId.current) setData(result);
      })
      .catch((e: unknown) => {
        if (id === callId.current) setError(e instanceof Error ? e.message : 'Error desconocido');
      })
      .finally(() => {
        if (id === callId.current) setLoading(false);
      });
  }, deps);

  useEffect(run, [run]);

  return { data, loading, error, reload: run };
}
