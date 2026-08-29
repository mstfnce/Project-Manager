using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ProjectManager.Domain.Entities;

namespace ProjectManager.Infrastructure.Data.Configurations;

public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.Property(p => p.Name).IsRequired().HasMaxLength(200);
        builder.Property(p => p.Slug).IsRequired().HasMaxLength(200);
        builder.HasIndex(p => p.Slug).IsUnique();

        builder.Property(p => p.Status)
               .HasConversion<int>();

        builder.HasMany(p => p.Tasks)
               .WithOne(t => t.Project)
               .HasForeignKey(t => t.ProjectId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Notes)
               .WithOne(n => n.Project)
               .HasForeignKey(n => n.ProjectId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.RoadmapItems)
               .WithOne(r => r.Project)
               .HasForeignKey(r => r.ProjectId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
