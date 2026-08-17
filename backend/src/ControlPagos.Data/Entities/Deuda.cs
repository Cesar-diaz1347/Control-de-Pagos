namespace ControlPagos.Data.Entities;

public class Deuda
{
    public int Id { get; set; }
    public string Nombre { get; set; } = default!;
    public TipoDeuda Tipo { get; set; }
    public DateOnly FechaInicio { get; set; }
    public DateOnly FechaFinPropuesta { get; set; }
    public decimal SaldoInicial { get; set; }
    public decimal CuotaMensual { get; set; }
    public decimal SaldoPagado { get; set; }
    public decimal SaldoRemanente { get; private set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<Pago> Pagos { get; set; } = new List<Pago>();
}
