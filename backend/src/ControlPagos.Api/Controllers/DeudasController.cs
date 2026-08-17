using ControlPagos.Api.Dtos;
using ControlPagos.Api.Services;
using ControlPagos.Data;
using ControlPagos.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ControlPagos.Api.Controllers;

[ApiController]
[Route("api/deudas")]
public class DeudasController : ControllerBase
{
    private readonly ControlPagosDbContext _db;
    private readonly SaldoRecalculoService _saldoRecalculo;

    public DeudasController(ControlPagosDbContext db, SaldoRecalculoService saldoRecalculo)
    {
        _db = db;
        _saldoRecalculo = saldoRecalculo;
    }

    [HttpGet]
    public async Task<ActionResult<List<DeudaListItemDto>>> GetDeudas([FromQuery] TipoDeuda? tipo)
    {
        var query = _db.Deudas.AsQueryable();
        if (tipo is not null)
        {
            query = query.Where(d => d.Tipo == tipo);
        }

        var raw = await query
            .OrderBy(d => d.FechaFinPropuesta)
            .Select(d => new
            {
                d.Id,
                d.Nombre,
                d.Tipo,
                d.FechaInicio,
                d.FechaFinPropuesta,
                d.SaldoInicial,
                d.SaldoPagado,
                d.SaldoRemanente,
                d.CuotaMensual,
                UltimoPago = d.Pagos.OrderByDescending(p => p.Fecha).Select(p => (DateOnly?)p.Fecha).FirstOrDefault()
            })
            .ToListAsync();

        var hoy = DateOnly.FromDateTime(DateTime.UtcNow);

        var result = raw.Select(d => new DeudaListItemDto
        {
            Id = d.Id,
            Nombre = d.Nombre,
            Tipo = d.Tipo,
            FechaFinPropuesta = d.FechaFinPropuesta,
            SaldoInicial = d.SaldoInicial,
            SaldoPagado = d.SaldoPagado,
            SaldoRemanente = d.SaldoRemanente,
            CuotaMensual = d.CuotaMensual,
            PorcentajeAvance = DeudaCalculoService.CalcularPorcentajeAvance(d.SaldoInicial, d.SaldoPagado),
            Estado = DeudaCalculoService.CalcularEstado(d.SaldoRemanente, d.FechaInicio, d.FechaFinPropuesta, d.UltimoPago, hoy)
        }).ToList();

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<DeudaDetailDto>> GetDeuda(int id)
    {
        var deuda = await _db.Deudas
            .Include(d => d.Pagos)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (deuda is null) return NotFound();

        return Ok(MapToDetailDto(deuda));
    }

    [HttpPost]
    public async Task<ActionResult<DeudaDetailDto>> CreateDeuda(DeudaCreateDto dto)
    {
        var deuda = new Deuda
        {
            Nombre = dto.Nombre,
            Tipo = dto.Tipo,
            FechaInicio = dto.FechaInicio,
            FechaFinPropuesta = dto.FechaFinPropuesta,
            SaldoInicial = dto.SaldoInicial,
            CuotaMensual = dto.CuotaMensual,
            SaldoPagado = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Deudas.Add(deuda);
        await _db.SaveChangesAsync();

        await _db.Entry(deuda).ReloadAsync();
        deuda.Pagos = new List<Pago>();

        return CreatedAtAction(nameof(GetDeuda), new { id = deuda.Id }, MapToDetailDto(deuda));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateDeuda(int id, DeudaUpdateDto dto)
    {
        var deuda = await _db.Deudas.FirstOrDefaultAsync(d => d.Id == id);
        if (deuda is null) return NotFound();

        deuda.Nombre = dto.Nombre;
        deuda.Tipo = dto.Tipo;
        deuda.FechaInicio = dto.FechaInicio;
        deuda.FechaFinPropuesta = dto.FechaFinPropuesta;
        deuda.SaldoInicial = dto.SaldoInicial;
        deuda.CuotaMensual = dto.CuotaMensual;
        deuda.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteDeuda(int id)
    {
        var deuda = await _db.Deudas.FirstOrDefaultAsync(d => d.Id == id);
        if (deuda is null) return NotFound();

        _db.Deudas.Remove(deuda);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:int}/pagos")]
    public async Task<ActionResult<DeudaDetailDto>> CreatePago(int id, PagoCreateDto dto)
    {
        var deudaExiste = await _db.Deudas.AnyAsync(d => d.Id == id);
        if (!deudaExiste) return NotFound();

        var pago = new Pago
        {
            DeudaId = id,
            Fecha = dto.Fecha,
            Monto = dto.Monto,
            Nota = dto.Nota,
            CreatedAt = DateTime.UtcNow
        };

        _db.Pagos.Add(pago);
        await _db.SaveChangesAsync();

        await _saldoRecalculo.RecalcularSaldoAsync(id);

        var deuda = await _db.Deudas.Include(d => d.Pagos).FirstAsync(d => d.Id == id);
        return Ok(MapToDetailDto(deuda));
    }

    [HttpPut("{id:int}/pagos/{pagoId:int}")]
    public async Task<ActionResult<DeudaDetailDto>> UpdatePago(int id, int pagoId, PagoCreateDto dto)
    {
        var pago = await _db.Pagos.FirstOrDefaultAsync(p => p.Id == pagoId && p.DeudaId == id);
        if (pago is null) return NotFound();

        pago.Fecha = dto.Fecha;
        pago.Monto = dto.Monto;
        pago.Nota = dto.Nota;
        await _db.SaveChangesAsync();

        await _saldoRecalculo.RecalcularSaldoAsync(id);

        var deuda = await _db.Deudas.Include(d => d.Pagos).FirstAsync(d => d.Id == id);
        return Ok(MapToDetailDto(deuda));
    }

    [HttpDelete("{id:int}/pagos/{pagoId:int}")]
    public async Task<ActionResult<DeudaDetailDto>> DeletePago(int id, int pagoId)
    {
        var pago = await _db.Pagos.FirstOrDefaultAsync(p => p.Id == pagoId && p.DeudaId == id);
        if (pago is null) return NotFound();

        _db.Pagos.Remove(pago);
        await _db.SaveChangesAsync();

        await _saldoRecalculo.RecalcularSaldoAsync(id);

        var deuda = await _db.Deudas.Include(d => d.Pagos).FirstAsync(d => d.Id == id);
        return Ok(MapToDetailDto(deuda));
    }

    private static DeudaDetailDto MapToDetailDto(Deuda deuda)
    {
        var hoy = DateOnly.FromDateTime(DateTime.UtcNow);
        var ultimoPago = deuda.Pagos.OrderByDescending(p => p.Fecha).Select(p => (DateOnly?)p.Fecha).FirstOrDefault();

        return new DeudaDetailDto
        {
            Id = deuda.Id,
            Nombre = deuda.Nombre,
            Tipo = deuda.Tipo,
            FechaInicio = deuda.FechaInicio,
            FechaFinPropuesta = deuda.FechaFinPropuesta,
            SaldoInicial = deuda.SaldoInicial,
            SaldoPagado = deuda.SaldoPagado,
            SaldoRemanente = deuda.SaldoRemanente,
            CuotaMensual = deuda.CuotaMensual,
            PorcentajeAvance = DeudaCalculoService.CalcularPorcentajeAvance(deuda.SaldoInicial, deuda.SaldoPagado),
            Estado = DeudaCalculoService.CalcularEstado(deuda.SaldoRemanente, deuda.FechaInicio, deuda.FechaFinPropuesta, ultimoPago, hoy),
            FechaFinProyectada = DeudaCalculoService.CalcularFechaFinProyectada(
                deuda.SaldoPagado, deuda.SaldoRemanente, deuda.FechaInicio, hoy),
            Pagos = deuda.Pagos
                .OrderByDescending(p => p.Fecha)
                .Select(p => new PagoDto { Id = p.Id, Fecha = p.Fecha, Monto = p.Monto, Nota = p.Nota })
                .ToList()
        };
    }
}
