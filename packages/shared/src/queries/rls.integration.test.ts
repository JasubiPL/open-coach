/**
 * Suite de RLS (innegociable, ver specs/03-convenciones-y-migraciones.md §Testing).
 *
 * Prueba el aislamiento multi-tenant REAL contra el proyecto Supabase cloud:
 * autentica usuarios demo de dos organizaciones (con la publishable/anon key, NO
 * la secret) y verifica que las políticas RLS impiden cruzar datos entre orgs y
 * entre clientes.
 *
 * Es un test de integración: se ejecuta SOLO si están presentes las env vars
 * (de lo contrario `describe.skipIf` lo omite, para que `pnpm test` siga verde sin
 * red). En CI corre contra un preview branch. Requisitos:
 *   - RLS_TEST_URL              → URL del proyecto/preview Supabase
 *   - RLS_TEST_PUBLISHABLE_KEY  → publishable (anon) key del proyecto
 *   - Usuarios demo sembrados con apps/web/scripts/seed-users.mjs
 *
 * Correr:  RLS_TEST_URL=… RLS_TEST_PUBLISHABLE_KEY=… pnpm --filter @open-coach/shared test
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { createSupabaseClient, type TypedSupabaseClient } from '../supabase';
import { listClients, listMembershipPlans } from '.';

const URL = process.env.RLS_TEST_URL;
const KEY = process.env.RLS_TEST_PUBLISHABLE_KEY;
const PASSWORD = 'Password123!';

const ORG_A = '00000000-0000-0000-0000-000000000001'; // Gimnasio Demo
const ORG_B = '00000000-0000-0000-0000-000000000002'; // Gimnasio Norte

const TRAINER_A = 'entrenador@opencoach.dev';
const CLIENT_A = 'mariana@opencoach.dev';
const OTHER_CLIENT_A = 'javier@opencoach.dev';
const TRAINER_B = 'norte.coach@opencoach.dev';

async function signIn(email: string): Promise<TypedSupabaseClient> {
  const client = createSupabaseClient(URL as string, KEY as string, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password: PASSWORD });
  if (error) throw new Error(`No se pudo iniciar sesión como ${email}: ${error.message}`);
  return client;
}

describe.skipIf(!URL || !KEY)('RLS — aislamiento multi-tenant', () => {
  let trainerA: TypedSupabaseClient;
  let trainerB: TypedSupabaseClient;
  let clientA: TypedSupabaseClient;

  beforeAll(async () => {
    [trainerA, trainerB, clientA] = await Promise.all([
      signIn(TRAINER_A),
      signIn(TRAINER_B),
      signIn(CLIENT_A),
    ]);
  });

  describe('entrenador', () => {
    it('ve a los clientes de su propia organización', async () => {
      const clients = await listClients(trainerA, ORG_A);
      expect(clients.length).toBeGreaterThanOrEqual(3);
      expect(clients.every((c) => c.organization_id === ORG_A)).toBe(true);
    });

    it('NO ve clientes de otra organización', async () => {
      // RLS limita a su org: aunque pida por la org B, no devuelve nada.
      const fromOtherOrg = await listClients(trainerA, ORG_B);
      expect(fromOtherOrg).toHaveLength(0);
    });

    it('ve los planes de su org pero NO los de otra', async () => {
      const own = await listMembershipPlans(trainerA, ORG_A);
      expect(own.length).toBeGreaterThanOrEqual(3);
      expect(own.every((p) => p.organization_id === ORG_A)).toBe(true);

      const foreign = await listMembershipPlans(trainerA, ORG_B);
      expect(foreign).toHaveLength(0);
    });

    it('el entrenador de la org B no ve perfiles de la org A', async () => {
      const ownClients = await listClients(trainerB, ORG_B);
      expect(ownClients.length).toBeGreaterThanOrEqual(1);
      expect(ownClients.every((c) => c.organization_id === ORG_B)).toBe(true);

      const { data } = await trainerB
        .from('profiles')
        .select('id')
        .eq('organization_id', ORG_A);
      expect(data ?? []).toHaveLength(0);
    });
  });

  describe('cliente', () => {
    it('solo ve su propio perfil (no a otros clientes)', async () => {
      const { data: user } = await clientA.auth.getUser();
      const { data: profiles } = await clientA.from('profiles').select('id');
      expect(profiles).toHaveLength(1);
      expect(profiles?.[0]?.id).toBe(user.user?.id);
    });

    it('NO puede leer el perfil de otro cliente de su misma org', async () => {
      // id del otro cliente, obtenido con la sesión del entrenador (que sí lo ve).
      const otherClients = await listClients(trainerA, ORG_A);
      const other = otherClients.find((c) => c.email === OTHER_CLIENT_A);
      expect(other).toBeDefined();

      const { data } = await clientA
        .from('profiles')
        .select('id')
        .eq('id', other!.id)
        .maybeSingle();
      expect(data).toBeNull();
    });

    it('NO puede listar planes de membresía (tabla solo-entrenador)', async () => {
      const { data } = await clientA.from('membership_plans').select('id');
      expect(data ?? []).toHaveLength(0);
    });

    it('solo ve sus propias membresías', async () => {
      const { data: user } = await clientA.auth.getUser();
      const { data } = await clientA.from('client_memberships').select('client_id');
      expect((data ?? []).every((m) => m.client_id === user.user?.id)).toBe(true);
    });
  });
});
