// Siembra usuarios demo (entrenadores + clientes) en el proyecto Supabase cloud
// usando la SECRET KEY (admin API). El trigger handle_new_user crea su profile
// desde la metadata (organization_id, role, full_name).
//
// Se siembran DOS organizaciones para poder probar el aislamiento multi-tenant:
//   • Org A (Gimnasio Demo)  → 1 entrenador + 3 clientes
//   • Org B (Gimnasio Norte) → 1 entrenador + 1 cliente
// La suite de RLS (packages/shared) usa estos usuarios para verificar que org A
// no ve datos de org B y que un cliente solo ve lo suyo.
//
// Uso:  node --env-file=apps/web/.env.local apps/web/scripts/seed-users.mjs
//
// Requiere en .env.local: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY.
// Datos demo, NO para producción. Idempotente: ignora usuarios que ya existen.

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY en .env.local');
  process.exit(1);
}

const ORG_A = '00000000-0000-0000-0000-000000000001'; // Gimnasio Demo  (seed.sql)
const ORG_B = '00000000-0000-0000-0000-000000000002'; // Gimnasio Norte (seed.sql)
const PASSWORD = 'Password123!';

const users = [
  // Org A — Gimnasio Demo
  { email: 'entrenador@opencoach.dev', org: ORG_A, role: 'trainer', full_name: 'Carlos Méndez' },
  { email: 'mariana@opencoach.dev', org: ORG_A, role: 'client', full_name: 'Mariana Ruiz' },
  { email: 'javier@opencoach.dev', org: ORG_A, role: 'client', full_name: 'Javier Ríos' },
  { email: 'lucia@opencoach.dev', org: ORG_A, role: 'client', full_name: 'Lucía Fernández' },
  // Org B — Gimnasio Norte (solo para probar aislamiento)
  { email: 'norte.coach@opencoach.dev', org: ORG_B, role: 'trainer', full_name: 'Diana Soto' },
  { email: 'norte.cliente@opencoach.dev', org: ORG_B, role: 'client', full_name: 'Pedro Lara' },
];

const admin = createClient(url, secret, { auth: { persistSession: false } });

for (const u of users) {
  const { data, error } = await admin.auth.admin.createUser({
    email: u.email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { organization_id: u.org, role: u.role, full_name: u.full_name },
  });
  if (error) {
    console.log(`• ${u.email} → omitido (${error.message})`);
  } else {
    console.log(`✓ ${u.email} (${u.role}) creado — id ${data.user.id}`);
  }
}

console.log(`\nListo. Login en /login con cualquier correo y contraseña: ${PASSWORD}`);
