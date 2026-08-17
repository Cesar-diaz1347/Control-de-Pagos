using ControlPagos.Data;
using Microsoft.EntityFrameworkCore;

namespace ControlPagos.Api.Services;

public class SaldoRecalculoService
{
    private readonly ControlPagosDbContext _db;

    public SaldoRecalculoService(ControlPagosDbContext db)
    {
        _db = db;
    }

    public async Task RecalcularSaldoAsync(int deudaId)
    {
        var suma = await _db.Pagos
            .Where(p => p.DeudaId == deudaId)
            .SumAsync(p => (decimal?)p.Monto) ?? 0m;

        await _db.Deudas
            .Where(d => d.Id == deudaId)
            .ExecuteUpdateAsync(s => s
                .SetProperty(d => d.SaldoPagado, suma)
                .SetProperty(d => d.UpdatedAt, DateTime.UtcNow));
    }
}
