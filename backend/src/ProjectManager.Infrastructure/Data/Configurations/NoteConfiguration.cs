using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ProjectManager.Domain.Entities;

namespace ProjectManager.Infrastructure.Data.Configurations;

// Note'un Project ile ilişkisi zaten ProjectConfiguration'da tanımlı.
public class NoteConfiguration : IEntityTypeConfiguration<Note>
{
    public void Configure(EntityTypeBuilder<Note> builder)
    {
        builder.Property(n => n.Title).IsRequired().HasMaxLength(300);
        builder.Property(n => n.Type).HasConversion<int>();
    }
}
