import { useState } from 'react'
import { Alert, Box, Button, Card, Group, Loader, SimpleGrid, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { createPago, deleteDeuda, deletePago, getDeuda, updatePago } from '../api/deudas'
import { EstadoBadge } from '../components/EstadoBadge'
import { PagoForm } from '../components/PagoForm'
import { PagosHistorialTable } from '../components/PagosHistorialTable'
import { ProgresoBar } from '../components/ProgresoBar'
import { useCurrency } from '../context/CurrencyContext'
import type { Pago, PagoCreateInput } from '../types/deuda'
import { formatDate } from '../utils/format'

export function DeudaDetailPage() {
  const { id } = useParams()
  const deudaId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { format } = useCurrency()

  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false)
  const [pagoEnEdicion, setPagoEnEdicion] = useState<Pago | undefined>(undefined)

  const { data: deuda, isLoading, isError } = useQuery({
    queryKey: ['deuda', deudaId],
    queryFn: () => getDeuda(deudaId),
  })

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ['deuda', deudaId] })
    queryClient.invalidateQueries({ queryKey: ['deudas'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard-resumen'] })
  }

  const pagoMutation = useMutation({
    mutationFn: (input: PagoCreateInput) =>
      pagoEnEdicion ? updatePago(deudaId, pagoEnEdicion.id, input) : createPago(deudaId, input),
    onSuccess: () => {
      invalidateAll()
      notifications.show({ message: pagoEnEdicion ? 'Pago actualizado' : 'Pago registrado', color: 'green' })
      closeModal()
      setPagoEnEdicion(undefined)
    },
    onError: () => notifications.show({ message: 'Ocurrió un error al guardar el pago', color: 'red' }),
  })

  const deletePagoMutation = useMutation({
    mutationFn: (pagoId: number) => deletePago(deudaId, pagoId),
    onSuccess: () => {
      invalidateAll()
      notifications.show({ message: 'Pago eliminado', color: 'green' })
    },
    onError: () => notifications.show({ message: 'Ocurrió un error al eliminar el pago', color: 'red' }),
  })

  const deleteDeudaMutation = useMutation({
    mutationFn: () => deleteDeuda(deudaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deudas'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-resumen'] })
      notifications.show({ message: 'Deuda eliminada', color: 'green' })
      navigate('/deudas')
    },
    onError: () => notifications.show({ message: 'Ocurrió un error al eliminar la deuda', color: 'red' }),
  })

  if (isLoading) return <Loader />
  if (isError || !deuda) return <Alert color="red">No se encontró la deuda.</Alert>

  return (
    <>
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>{deuda.nombre}</Title>
          <Text c="dimmed">{deuda.tipo === 'Recibido' ? 'Pago recibido (me deben)' : 'Pago realizado (yo debo)'}</Text>
        </div>
        <Group>
          <EstadoBadge estado={deuda.estado} />
          <Button variant="default" component={Link} to={`/deudas/${deuda.id}/editar`}>
            Editar
          </Button>
          <Button
            variant="outline"
            color="red"
            onClick={() => {
              if (window.confirm('¿Eliminar esta deuda y todo su histórico de pagos?')) {
                deleteDeudaMutation.mutate()
              }
            }}
            loading={deleteDeudaMutation.isPending}
          >
            Eliminar
          </Button>
        </Group>
      </Group>

      <Card withBorder mb="lg">
        <Box mb="md">
          <ProgresoBar porcentaje={deuda.porcentajeAvance} estado={deuda.estado} />
        </Box>

        <SimpleGrid cols={{ base: 2, sm: 4 }}>
          <div>
            <Text size="sm" c="dimmed">Saldo inicial</Text>
            <Text fw={600}>{format(deuda.saldoInicial)}</Text>
          </div>
          <div>
            <Text size="sm" c="dimmed">Saldo pagado</Text>
            <Text fw={600}>{format(deuda.saldoPagado)}</Text>
          </div>
          <div>
            <Text size="sm" c="dimmed">Saldo remanente</Text>
            <Text fw={600}>{format(deuda.saldoRemanente)}</Text>
          </div>
          <div>
            <Text size="sm" c="dimmed">Cuota al mes</Text>
            <Text fw={600}>{format(deuda.cuotaMensual)}</Text>
          </div>
          <div>
            <Text size="sm" c="dimmed">Fecha inicio</Text>
            <Text fw={600}>{formatDate(deuda.fechaInicio)}</Text>
          </div>
          <div>
            <Text size="sm" c="dimmed">Fecha fin propuesta</Text>
            <Text fw={600}>{formatDate(deuda.fechaFinPropuesta)}</Text>
          </div>
          <div>
            <Text size="sm" c="dimmed">Fecha fin proyectada</Text>
            <Text fw={600}>{deuda.fechaFinProyectada ? formatDate(deuda.fechaFinProyectada) : '—'}</Text>
          </div>
        </SimpleGrid>
      </Card>

      <Group justify="space-between" mb="sm">
        <Title order={3}>Histórico de pagos</Title>
        <Button
          onClick={() => {
            setPagoEnEdicion(undefined)
            openModal()
          }}
        >
          Registrar pago
        </Button>
      </Group>

      <PagosHistorialTable
        pagos={deuda.pagos}
        onEdit={(pago) => {
          setPagoEnEdicion(pago)
          openModal()
        }}
        onDelete={(pago) => {
          if (window.confirm('¿Eliminar este pago del histórico?')) {
            deletePagoMutation.mutate(pago.id)
          }
        }}
      />

      <PagoForm
        opened={modalOpened}
        onClose={() => {
          closeModal()
          setPagoEnEdicion(undefined)
        }}
        onSubmit={(values) => pagoMutation.mutate(values)}
        loading={pagoMutation.isPending}
        pagoInicial={pagoEnEdicion}
      />
    </>
  )
}
