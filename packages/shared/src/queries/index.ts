/**
 * Capa de acceso a datos. Las funciones reciben el cliente Supabase por inyección
 * para correr igual en server (RSC/action), browser (web) y native (móvil).
 * No leen process.env ni construyen el cliente. Ver specs/01-spec-tecnico.md §6.
 */
export { QueryError } from './internal';
export * from './profile-queries';
export * from './client-queries';
export * from './plan-queries';
export * from './membership-queries';
