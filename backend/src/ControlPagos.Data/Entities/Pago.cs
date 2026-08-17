namespace ControlPagos.Data.Entities;

public class Pago
{
    public int Id { get; set; }
    public int DeudaId { get; set; }
    public Deuda Deuda { get; set; } = default!;
    public DateOnly Fecha { get; set; }
    public decimal Monto { get; set; }
    public string? Nota { get; set; }
    public DateTime CreatedAt { get; set; }
}
