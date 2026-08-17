using System.ComponentModel.DataAnnotations;
using ControlPagos.Data.Entities;

namespace ControlPagos.Api.Dtos;

public class DeudaListItemDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = default!;
    public TipoDeuda Tipo { get; set; }
    public DateOnly FechaFinPropuesta { get; set; }
    public decimal SaldoInicial { get; set; }
    public decimal SaldoPagado { get; set; }
    public decimal SaldoRemanente { get; set; }
    public decimal CuotaMensual { get; set; }
    public decimal PorcentajeAvance { get; set; }
    public EstadoDeuda Estado { get; set; }
}

public class DeudaDetailDto : DeudaListItemDto
{
    public DateOnly FechaInicio { get; set; }
    public DateOnly? FechaFinProyectada { get; set; }
    public List<PagoDto> Pagos { get; set; } = new();
}

public class DeudaCreateDto
{
    [Required, MaxLength(200)]
    public string Nombre { get; set; } = default!;

    [Required]
    public TipoDeuda Tipo { get; set; }

    [Required]
    public DateOnly FechaInicio { get; set; }

    [Required]
    public DateOnly FechaFinPropuesta { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "El saldo inicial debe ser mayor a 0.")]
    public decimal SaldoInicial { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "La cuota mensual debe ser mayor a 0.")]
    public decimal CuotaMensual { get; set; }
}

public class DeudaUpdateDto : DeudaCreateDto
{
}
