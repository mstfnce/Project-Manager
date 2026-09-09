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
        // Kendine referans: bir gorev baska bir gorevin altinda olabilir.
        // Restrict: alt gorevi olan bir ana gorevi silmeye calisirsan veritabani
        // reddeder (Cascade olsaydi tum alt gorevler sessizce silinirdi).
        builder.HasOne(t => t.ParentTask)
               .WithMany(t => t.SubTasks)
               .HasForeignKey(t => t.ParentTaskId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
