import { useEffect } from 'react'
import { Button, Group, LoadingOverlay, NumberInput, Paper, SegmentedControl, TextInput, Title } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'

import { createDeuda, getDeuda, updateDeuda } from '../api/deudas'
import type { DeudaFormInput, TipoDeuda } from '../types/deuda'
import { parseDDMMYYYY } from '../utils/dateParser'

export function DeudaFormPage() {
  const { id } = useParams()
  const deudaId = id ? Number(id) : undefined
  const isEdit = deudaId !== undefined
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: existente, isLoading } = useQuery({
    queryKey: ['deuda', deudaId],
    queryFn: () => getDeuda(deudaId!),
    enabled: isEdit,
  })

  const form = useForm<DeudaFormInput>({
    initialValues: {
      nombre: '',
      tipo: 'Recibido',
      fechaInicio: '',
      fechaFinPropuesta: '',
      saldoInicial: 0,
      cuotaMensual: 0,
    },
    validate: {
      nombre: (value) => (value.trim().length === 0 ? 'El nombre es obligatorio' : null),
      fechaInicio: (value) => (value ? null : 'Requerido'),
      fechaFinPropuesta: (value) => (value ? null : 'Requerido'),
      saldoInicial: (value) => (value > 0 ? null : 'Debe ser mayor a 0'),
      cuotaMensual: (value) => (value > 0 ? null : 'Debe ser mayor a 0'),
    },
  })

  useEffect(() => {
    if (existente) {
      form.setValues({
        nombre: existente.nombre,
        tipo: existente.tipo,
        fechaInicio: existente.fechaInicio,
        fechaFinPropuesta: existente.fechaFinPropuesta,
        saldoInicial: existente.saldoInicial,
        cuotaMensual: existente.cuotaMensual,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existente])

  const mutation = useMutation({
    mutationFn: (values: DeudaFormInput) =>
      isEdit ? updateDeuda(deudaId!, values) : createDeuda(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deudas'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-resumen'] })
      notifications.show({
        message: isEdit ? 'Deuda actualizada' : 'Deuda creada',
        color: 'green',
      })
      navigate(isEdit ? `/deudas/${deudaId}` : '/deudas')
    },
    onError: () => {
      notifications.show({ message: 'Ocurrió un error al guardar', color: 'red' })
    },
  })

  return (
    <Paper withBorder p="lg" maw={520} pos="relative">
      <LoadingOverlay visible={isEdit && isLoading} />
      <Title order={2} mb="md">
        {isEdit ? 'Editar deuda' : 'Nueva deuda'}
      </Title>

      <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
        <TextInput label="Nombre" placeholder="Nombre de la persona/entidad" {...form.getInputProps('nombre')} mb="sm" />

        <SegmentedControl
          fullWidth
          data={[
            { label: 'Recibido (me deben)', value: 'Recibido' },
            { label: 'Realizado (yo debo)', value: 'Realizado' },
          ]}
          value={form.values.tipo}
          onChange={(value) => form.setFieldValue('tipo', value as TipoDeuda)}
          mb="sm"
        />

        <DateInput
          label="Fecha inicio deuda"
          valueFormat="DD/MM/YYYY"
          dateParser={parseDDMMYYYY}
          value={form.values.fechaInicio || null}
          onChange={(value) => form.setFieldValue('fechaInicio', value ?? '')}
          error={form.errors.fechaInicio}
          mb="sm"
        />

        <DateInput
          label="Fecha fin propuesta"
          valueFormat="DD/MM/YYYY"
          dateParser={parseDDMMYYYY}
          value={form.values.fechaFinPropuesta || null}
          onChange={(value) => form.setFieldValue('fechaFinPropuesta', value ?? '')}
          error={form.errors.fechaFinPropuesta}
          mb="sm"
        />

        <NumberInput
          label="Saldo inicial"
          decimalScale={2}
          fixedDecimalScale
          min={0}
          onFocus={(event) => event.currentTarget.select()}
          {...form.getInputProps('saldoInicial')}
          mb="sm"
        />

        <NumberInput
          label="Cuota al mes"
          decimalScale={2}
          fixedDecimalScale
          min={0}
          onFocus={(event) => event.currentTarget.select()}
          {...form.getInputProps('cuotaMensual')}
          mb="md"
        />

        <Group justify="flex-end">
          <Button variant="default" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Guardar
          </Button>
        </Group>
      </form>
    </Paper>
  )
}
