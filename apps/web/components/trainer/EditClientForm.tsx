'use client';

import { useActionState } from 'react';
import type { Profile } from '@open-coach/shared';
import { updateClientAction, type ActionState } from '@/app/(trainer)/trainer/clients/actions';
import { Field, FormAlert, SelectField, SubmitButton, TextAreaField } from '@/components/ui/form';

const initial: ActionState = {};

export function EditClientForm({ client }: { client: Profile }) {
  const action = updateClientAction.bind(null, client.id);
  const [state, formAction] = useActionState(action, initial);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <Field label="Nombre completo" name="fullName" defaultValue={client.full_name} required />
      <Field label="Teléfono" name="phone" defaultValue={client.phone} />
      <Field label="Fecha de nacimiento" name="birthDate" type="date" defaultValue={client.birth_date} />
      <SelectField label="Estado" name="status" defaultValue={client.status}>
        <option value="active">Activo</option>
        <option value="inactive">Inactivo</option>
      </SelectField>
      <div className="sm:col-span-2">
        <TextAreaField label="Notas médicas (sensible)" name="medicalNotes" defaultValue={client.medical_notes} />
      </div>
      <div className="sm:col-span-2 flex items-center gap-3">
        <SubmitButton>Guardar cambios</SubmitButton>
        <FormAlert state={state} />
      </div>
    </form>
  );
}
