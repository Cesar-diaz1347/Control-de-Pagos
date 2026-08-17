using ControlPagos.Api.Dtos;
using ControlPagos.Api.Services;
using ControlPagos.Data;
using ControlPagos.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ControlPagos.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly ControlPagosDbContext _db;

    public DashboardController(ControlPagosDbContext db)
    {
        _db = db;
    }

    [HttpGet("resumen")]
    public async Task<ActionResult<DashboardResumenDto>> GetResumen()
    {
        var raw = await _db.Deudas
            .Select(d => new
            {
                d.Tipo,
                d.FechaInicio,
                d.FechaFinPropuesta,
                d.SaldoRemanente,
                UltimoPago = d.Pagos.OrderByDescending(p => p.Fecha).Select(p => (DateOnly?)p.Fecha).FirstOrDefault()
            })
            .ToListAsync();

        var hoy = DateOnly.FromDateTime(DateTime.UtcNow);

        var resumen = new DashboardResumenDto
        {
            TotalPorCobrar = raw.Where(d => d.Tipo == TipoDeuda.Recibido).Sum(d => d.SaldoRemanente),
            TotalPorPagar = raw.Where(d => d.Tipo == TipoDeuda.Realizado).Sum(d => d.SaldoRemanente),
        };

        foreach (var d in raw)
        {
            var estado = DeudaCalculoService.CalcularEstado(d.SaldoRemanente, d.FechaInicio, d.FechaFinPropuesta, d.UltimoPago, hoy);
            if (estado == EstadoDeuda.Vencido) resumen.CantidadVencidas++;
            if (estado == EstadoDeuda.Proximo) resumen.CantidadProximas++;
        }

        return Ok(resumen);
    }
}
