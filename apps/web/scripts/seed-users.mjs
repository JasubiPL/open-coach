// Siembra usuarios demo (entrenador + clientes) en el proyecto Supabase cloud usando
// la SECRET KEY (admin API). El trigger handle_new_user crea su profile desde la
// metadata (organization_id, role, full_name).
//
// Uso:  node --env-file=.env.local scripts/seed-users.mjs
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

const ORG_ID = '00000000-0000-0000-0000-000000000001'; // Gimnasio Demo (seed.sql)
const PASSWORD = 'Password123!';

const users = [
  { email: 'entrenador@opencoach.dev', role: 'trainer', full_name: 'Carlos Méndez' },
  { email: 'mariana@opencoach.dev', role: 'client', full_name: 'Mariana Ruiz' },
  { email: 'javier@opencoach.dev', role: 'client', full_name: 'Javier Ríos' },
];

const admin = createClient(url, secret, { auth: { persistSession: false } });

for (const u of users) {
  const { data, error } = await admin.auth.admin.createUser({
    email: u.email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { organization_id: ORG_ID, role: u.role, full_name: u.full_name },
  });
  if (error) {
    console.log(`• ${u.email} → omitido (${error.message})`);
  } else {
    console.log(`✓ ${u.email} (${u.role}) creado — id ${data.user.id}`);
  }
}

console.log(`\nListo. Login en /login con cualquier correo y contraseña: ${PASSWORD}`);
