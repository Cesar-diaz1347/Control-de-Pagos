using System.ComponentModel.DataAnnotations;

namespace ControlPagos.Api.Dtos;

public class PagoDto
{
    public int Id { get; set; }
    public DateOnly Fecha { get; set; }
    public decimal Monto { get; set; }
    public string? Nota { get; set; }
}

public class PagoCreateDto
{
    [Required]
    public DateOnly Fecha { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "El monto debe ser mayor a 0.")]
    public decimal Monto { get; set; }

    [MaxLength(500)]
    public string? Nota { get; set; }
}
