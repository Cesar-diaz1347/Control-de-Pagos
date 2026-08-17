import { ActionIcon, AppShell, Group, NavLink, Select, Title, useMantineColorScheme } from '@mantine/core'
import { NavLink as RouterNavLink, Outlet, useLocation } from 'react-router-dom'

import { MONEDAS_DISPONIBLES, useCurrency, type MonedaCode } from './context/CurrencyContext'

function App() {
  const location = useLocation()
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const { currency, setCurrency } = useCurrency()

  return (
    <AppShell header={{ height: 60 }} navbar={{ width: 220, breakpoint: 'sm' }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Title order={3}>Control de Pagos</Title>
          <Group>
            <Select
              value={currency}
              onChange={(value) => value && setCurrency(value as MonedaCode)}
              data={MONEDAS_DISPONIBLES.map((m) => ({ value: m.code, label: m.label }))}
              w={220}
              aria-label="Moneda"
              allowDeselect={false}
            />
            <ActionIcon
              variant="default"
              size="lg"
              onClick={() => toggleColorScheme()}
              aria-label="Cambiar modo oscuro/claro"
            >
              {colorScheme === 'dark' ? '☀️' : '🌙'}
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavLink
          component={RouterNavLink}
          to="/"
          label="Dashboard"
          active={location.pathname === '/'}
        />
        <NavLink
          component={RouterNavLink}
          to="/deudas"
          label="Deudas"
          active={location.pathname.startsWith('/deudas')}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}

export default App
