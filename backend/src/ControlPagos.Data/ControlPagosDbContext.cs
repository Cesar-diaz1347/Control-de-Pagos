using ControlPagos.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace ControlPagos.Data;

public class ControlPagosDbContext : DbContext
{
    public ControlPagosDbContext(DbContextOptions<ControlPagosDbContext> options) : base(options)
    {
    }

    public DbSet<Deuda> Deudas => Set<Deuda>();
    public DbSet<Pago> Pagos => Set<Pago>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Deuda>(entity =>
        {
            entity.Property(d => d.Nombre).HasMaxLength(200).IsRequired();
            entity.Property(d => d.SaldoInicial).HasPrecision(18, 2);
            entity.Property(d => d.CuotaMensual).HasPrecision(18, 2);
            entity.Property(d => d.SaldoPagado).HasPrecision(18, 2);

            entity.Property(d => d.SaldoRemanente)
                .HasPrecision(18, 2)
                .HasComputedColumnSql("[SaldoInicial] - [SaldoPagado]", stored: true);

            entity.Property(d => d.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            entity.Property(d => d.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

            entity.ToTable(t => t.HasCheckConstraint("CK_Deuda_Tipo", "[Tipo] IN (0, 1)"));

            entity.HasIndex(d => d.Tipo).HasDatabaseName("IX_Deuda_Tipo");
            entity.HasIndex(d => d.FechaFinPropuesta).HasDatabaseName("IX_Deuda_FechaFinPropuesta");
        });

        modelBuilder.Entity<Pago>(entity =>
        {
            entity.Property(p => p.Monto).HasPrecision(18, 2);
            entity.Property(p => p.Nota).HasMaxLength(500);
            entity.Property(p => p.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

            entity.ToTable(t => t.HasCheckConstraint("CK_Pago_Monto", "[Monto] > 0"));

            entity.HasOne(p => p.Deuda)
                .WithMany(d => d.Pagos)
                .HasForeignKey(p => p.DeudaId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(p => p.DeudaId).HasDatabaseName("IX_Pago_DeudaId");
        });
    }
}
