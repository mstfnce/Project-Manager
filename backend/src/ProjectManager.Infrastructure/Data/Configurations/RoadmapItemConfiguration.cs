using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ProjectManager.Domain.Entities;

namespace ProjectManager.Infrastructure.Data.Configurations;

public class RoadmapItemConfiguration : IEntityTypeConfiguration<RoadmapItem>
{
    public void Configure(EntityTypeBuilder<RoadmapItem> builder)
    {
        builder.Property(r => r.Title).IsRequired().HasMaxLength(300);

        // Kendine referans (self-reference): bir madde başka bir maddenin altında olabilir.
        // Restrict: altında maddesi olan bir üst maddeyi silmeye çalışırsan veritabanı reddeder
        // (Cascade olsaydı tüm alt ağaç sessizce silinirdi — istenmeyen veri kaybı riski).
        builder.HasOne(r => r.Parent)
               .WithMany(r => r.Children)
               .HasForeignKey(r => r.ParentId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
