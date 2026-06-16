import { z } from 'zod';

/** Esquemas Zod compartidos por web y móvil. Única fuente de validación. */

export const userRoleSchema = z.enum(['trainer', 'client', 'super_admin']);

export const signInSchema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const signUpTrainerSchema = z.object({
  fullName: z.string().min(2, 'Nombre requerido'),
  organizationName: z.string().min(2, 'Nombre de la organización requerido'),
  email: z.string().email('Correo inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});
export type SignUpTrainerInput = z.infer<typeof signUpTrainerSchema>;

export const profileSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  birthDate: z.string().optional().nullable(),
});
export type ProfileInput = z.infer<typeof profileSchema>;

// ── Clientes ──────────────────────────────────────────────────────────────────

/** Alta de cliente por invitación (el entrenador la dispara; pasa por Route Handler). */
export const inviteClientSchema = z.object({
  fullName: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Correo inválido'),
  phone: z.string().trim().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  medicalNotes: z.string().trim().optional().nullable(),
});
export type InviteClientInput = z.infer<typeof inviteClientSchema>;

/** Edición de cliente por el entrenador (incluye datos sensibles). */
export const updateClientSchema = z.object({
  fullName: z.string().min(2, 'Nombre requerido').optional(),
  phone: z.string().trim().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  medicalNotes: z.string().trim().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  status: z.enum(['active', 'inactive']).optional(),
});
export type UpdateClientInput = z.infer<typeof updateClientSchema>;

/** Filtros del listado de clientes. */
export const clientListFilterSchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});
export type ClientListFilter = z.infer<typeof clientListFilterSchema>;

// ── Planes de membresía ───────────────────────────────────────────────────────

export const membershipIntervalSchema = z.enum(['month', 'year', 'custom']);

export const membershipPlanSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().trim().optional().nullable(),
  priceCents: z.number().int().min(0, 'El precio no puede ser negativo'),
  currency: z.string().length(3).default('MXN'),
  interval: membershipIntervalSchema.default('month'),
  features: z.record(z.unknown()).optional(),
  active: z.boolean().optional(),
});
export type MembershipPlanInput = z.infer<typeof membershipPlanSchema>;

// ── Asignar membresía a un cliente ────────────────────────────────────────────

export const assignMembershipSchema = z.object({
  clientId: z.string().uuid(),
  planId: z.string().uuid(),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
  status: z.enum(['active', 'expired', 'pending']).default('active'),
  paymentMethod: z.string().trim().optional().nullable(),
});
export type AssignMembershipInput = z.infer<typeof assignMembershipSchema>;
