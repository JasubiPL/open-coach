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
