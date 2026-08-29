using Microsoft.EntityFrameworkCore;
using ProjectManager.Domain.Entities;

namespace ProjectManager.Infrastructure.Data;

// EF Core'un veritabanıyla konuştuğu ana sınıf. Bağlantı bilgisini kendisi
// taşımaz, dışarıdan (Program.cs) alır — bu sayede test ortamında farklı
// bir veritabanı ayarı verilebilir.
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Her DbSet bir tabloya karşılık gelir: _db.Projects -> Projects tablosu
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<Note> Notes => Set<Note>();
    public DbSet<User> Users => Set<User>();
    public DbSet<RoadmapItem> RoadmapItems => Set<RoadmapItem>();

    // Uygulama ilk açılırken bir kere çalışır; EF Core şemayı buradan öğrenir.
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Data/Configurations altındaki tüm IEntityTypeConfiguration<T> sınıflarını
        // otomatik bulup uygular — yeni bir konfigürasyon eklediğinde bu satır değişmez.
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
