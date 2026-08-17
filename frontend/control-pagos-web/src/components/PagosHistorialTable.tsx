import { ActionIcon, Group, Table, Text } from '@mantine/core'

import { useCurrency } from '../context/CurrencyContext'
import type { Pago } from '../types/deuda'
import { formatDate } from '../utils/format'

interface PagosHistorialTableProps {
  pagos: Pago[]
  onEdit: (pago: Pago) => void
  onDelete: (pago: Pago) => void
}

export function PagosHistorialTable({ pagos, onEdit, onDelete }: PagosHistorialTableProps) {
  const { format } = useCurrency()

  if (pagos.length === 0) {
    return (
      <Text c="dimmed" size="sm">
        Aún no hay pagos registrados.
      </Text>
    )
  }

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Fecha</Table.Th>
          <Table.Th>Monto</Table.Th>
          <Table.Th>Nota</Table.Th>
          <Table.Th />
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {pagos.map((pago) => (
          <Table.Tr key={pago.id}>
            <Table.Td>{formatDate(pago.fecha)}</Table.Td>
            <Table.Td>{format(pago.monto)}</Table.Td>
            <Table.Td>{pago.nota || '—'}</Table.Td>
            <Table.Td>
              <Group gap="xs" justify="flex-end">
                <ActionIcon variant="subtle" onClick={() => onEdit(pago)} aria-label="Editar pago">
                  ✎
                </ActionIcon>
                <ActionIcon variant="subtle" color="red" onClick={() => onDelete(pago)} aria-label="Eliminar pago">
                  ✕
                </ActionIcon>
              </Group>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}
