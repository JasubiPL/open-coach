import type { PostgrestError, PostgrestSingleResponse } from '@supabase/supabase-js';

/**
 * Desempaqueta una respuesta de PostgREST: devuelve `data` o lanza el error.
 * Las queries de `shared` lanzan en error para que la capa de UI (Server Action /
 * TanStack Query) lo maneje de forma uniforme.
 */
export async function unwrap<T>(promise: PromiseLike<PostgrestSingleResponse<T>>): Promise<T> {
  const { data, error } = await promise;
  if (error) throw new QueryError(error);
  return data as T;
}

/** Error tipado de acceso a datos. */
export class QueryError extends Error {
  readonly cause: PostgrestError;
  constructor(cause: PostgrestError) {
    super(cause.message);
    this.name = 'QueryError';
    this.cause = cause;
  }
}
