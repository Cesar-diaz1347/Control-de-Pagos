import { useEffect } from 'react'
import { Button, Group, Modal, NumberInput, TextInput } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { useForm } from '@mantine/form'

import type { Pago, PagoCreateInput } from '../types/deuda'
import { parseDDMMYYYY } from '../utils/dateParser'
import { toDateInputValue } from '../utils/format'

interface PagoFormProps {
  opened: boolean
  onClose: () => void
  onSubmit: (input: PagoCreateInput) => void
  loading: boolean
  pagoInicial?: Pago
}

export function PagoForm({ opened, onClose, onSubmit, loading, pagoInicial }: PagoFormProps) {
  const form = useForm<PagoCreateInput>({
    initialValues: {
      fecha: pagoInicial?.fecha ?? toDateInputValue(new Date()),
      monto: pagoInicial?.monto ?? 0,
      nota: pagoInicial?.nota ?? '',
    },
    validate: {
      fecha: (value) => (value ? null : 'Requerido'),
      monto: (value) => (value > 0 ? null : 'Debe ser mayor a 0'),
    },
  })

  useEffect(() => {
    if (opened) {
      form.setValues({
        fecha: pagoInicial?.fecha ?? toDateInputValue(new Date()),
        monto: pagoInicial?.monto ?? 0,
        nota: pagoInicial?.nota ?? '',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, pagoInicial])

  return (
    <Modal opened={opened} onClose={onClose} title={pagoInicial ? 'Editar pago' : 'Registrar pago'}>
      <form
        onSubmit={form.onSubmit((values) => {
          onSubmit(values)
          form.reset()
        })}
      >
        <DateInput
          label="Fecha"
          valueFormat="DD/MM/YYYY"
          dateParser={parseDDMMYYYY}
          value={form.values.fecha || null}
          onChange={(value) => form.setFieldValue('fecha', value ?? '')}
          error={form.errors.fecha}
          mb="sm"
        />

        <NumberInput
          label="Monto"
          decimalScale={2}
          fixedDecimalScale
          min={0}
          onFocus={(event) => event.currentTarget.select()}
          {...form.getInputProps('monto')}
          mb="sm"
        />

        <TextInput label="Nota (opcional)" {...form.getInputProps('nota')} mb="md" />

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Guardar
          </Button>
        </Group>
      </form>
    </Modal>
  )
}
