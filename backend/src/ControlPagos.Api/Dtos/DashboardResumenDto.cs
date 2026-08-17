namespace ControlPagos.Api.Dtos;

public class DashboardResumenDto
{
    public decimal TotalPorCobrar { get; set; }
    public decimal TotalPorPagar { get; set; }
    public int CantidadVencidas { get; set; }
    public int CantidadProximas { get; set; }
}
