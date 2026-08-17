import { apiClient } from './client';
import type {
  DashboardResumen,
  DeudaDetail,
  DeudaFormInput,
  DeudaListItem,
  PagoCreateInput,
  TipoDeuda,
} from '../types/deuda';

export async function getDeudas(tipo?: TipoDeuda): Promise<DeudaListItem[]> {
  const { data } = await apiClient.get<DeudaListItem[]>('/deudas', {
    params: tipo ? { tipo } : undefined,
  });
  return data;
}

export async function getDeuda(id: number): Promise<DeudaDetail> {
  const { data } = await apiClient.get<DeudaDetail>(`/deudas/${id}`);
  return data;
}

export async function createDeuda(input: DeudaFormInput): Promise<DeudaDetail> {
  const { data } = await apiClient.post<DeudaDetail>('/deudas', input);
  return data;
}

export async function updateDeuda(id: number, input: DeudaFormInput): Promise<void> {
  await apiClient.put(`/deudas/${id}`, input);
}

export async function deleteDeuda(id: number): Promise<void> {
  await apiClient.delete(`/deudas/${id}`);
}

export async function createPago(deudaId: number, input: PagoCreateInput): Promise<DeudaDetail> {
  const { data } = await apiClient.post<DeudaDetail>(`/deudas/${deudaId}/pagos`, input);
  return data;
}

export async function updatePago(
  deudaId: number,
  pagoId: number,
  input: PagoCreateInput,
): Promise<DeudaDetail> {
  const { data } = await apiClient.put<DeudaDetail>(`/deudas/${deudaId}/pagos/${pagoId}`, input);
  return data;
}

export async function deletePago(deudaId: number, pagoId: number): Promise<DeudaDetail> {
  const { data } = await apiClient.delete<DeudaDetail>(`/deudas/${deudaId}/pagos/${pagoId}`);
  return data;
}

export async function getDashboardResumen(): Promise<DashboardResumen> {
  const { data } = await apiClient.get<DashboardResumen>('/dashboard/resumen');
  return data;
}
