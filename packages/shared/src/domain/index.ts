import type { UserRole } from '../types';

/**
 * Lógica de negocio pura (sin I/O), testeable. Se irá ampliando por sprint
 * (resolveAssignmentForDate, computeAdherence, membershipStatus, ...).
 */

/** Ruta inicial según el rol tras autenticarse. */
export function defaultRouteForRole(role: UserRole): string {
  switch (role) {
    case 'trainer':
      return '/trainer';
    case 'client':
      return '/client';
    case 'super_admin':
      return '/admin';
  }
}

/** Genera un slug a partir del nombre de la organización. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}
