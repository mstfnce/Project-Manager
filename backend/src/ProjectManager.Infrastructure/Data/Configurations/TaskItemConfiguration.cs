using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ProjectManager.Domain.Entities;

namespace ProjectManager.Infrastructure.Data.Configurations;

// TaskItem'ın Project ile ilişkisi (HasMany/cascade) zaten ProjectConfiguration'da
// tanımlı — burada sadece TaskItem'a özel alan kuralları var.
public class TaskItemConfiguration : IEntityTypeConfiguration<TaskItem>
{
    public void Configure(EntityTypeBuilder<TaskItem> builder)
    {
        builder.Property(t => t.Title).IsRequired().HasMaxLength(300);
        builder.Property(t => t.Status).HasConversion<int>();     // enum -> int sütun
        builder.Property(t => t.Priority).HasConversion<int>();
    }
}
