using ControlPagos.Api.Dtos;

namespace ControlPagos.Api.Services;

public static class DeudaCalculoService
{
    private const int DiasMargenProximo = 7;

    public static decimal CalcularPorcentajeAvance(decimal saldoInicial, decimal saldoPagado)
    {
        if (saldoInicial <= 0) return 0;
        var porcentaje = Math.Round(saldoPagado / saldoInicial * 100, 1);
        return Math.Clamp(porcentaje, 0, 100);
    }

    public static EstadoDeuda CalcularEstado(
        decimal saldoRemanente, DateOnly fechaInicio, DateOnly fechaFinPropuesta, DateOnly? ultimoPago, DateOnly hoy)
    {
        if (saldoRemanente <= 0) return EstadoDeuda.Pagada;

        if (fechaInicio > hoy)
        {
            var diasParaInicio = fechaInicio.DayNumber - hoy.DayNumber;
            return diasParaInicio <= DiasMargenProximo ? EstadoDeuda.Proximo : EstadoDeuda.Lejana;
        }

        var fechaProximoPago = (ultimoPago ?? fechaInicio).AddMonths(1);

        if (hoy > fechaFinPropuesta || hoy.DayNumber > fechaProximoPago.DayNumber)
            return EstadoDeuda.Vencido;

        var diasParaFin = fechaFinPropuesta.DayNumber - hoy.DayNumber;
        var diasParaProximoPago = fechaProximoPago.DayNumber - hoy.DayNumber;
        var diasMinimos = Math.Min(diasParaFin, diasParaProximoPago);

        return diasMinimos <= DiasMargenProximo ? EstadoDeuda.Proximo : EstadoDeuda.AlDia;
    }

    public static DateOnly? CalcularFechaFinProyectada(
        decimal saldoPagado, decimal saldoRemanente, DateOnly fechaInicio, DateOnly hoy)
    {
        if (saldoRemanente <= 0) return null;

        var mesesTranscurridos = Math.Max(1, (hoy.Year - fechaInicio.Year) * 12 + hoy.Month - fechaInicio.Month);
        var ritmoMensual = saldoPagado / mesesTranscurridos;
        if (ritmoMensual <= 0) return null;

        var mesesRestantes = (int)Math.Ceiling(saldoRemanente / ritmoMensual);
        return hoy.AddMonths(mesesRestantes);
    }
}
