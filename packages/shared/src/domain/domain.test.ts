import { describe, expect, it } from 'vitest';
import { defaultRouteForRole, slugify } from './index';

describe('defaultRouteForRole', () => {
  it('mapea cada rol a su ruta', () => {
    expect(defaultRouteForRole('trainer')).toBe('/trainer');
    expect(defaultRouteForRole('client')).toBe('/client');
    expect(defaultRouteForRole('super_admin')).toBe('/admin');
  });
});

describe('slugify', () => {
  it('normaliza acentos y espacios', () => {
    expect(slugify('Gimnasio de Papá')).toBe('gimnasio-de-papa');
  });
  it('elimina caracteres no válidos', () => {
    expect(slugify('  Fit & Strong!! ')).toBe('fit-strong');
  });
});
