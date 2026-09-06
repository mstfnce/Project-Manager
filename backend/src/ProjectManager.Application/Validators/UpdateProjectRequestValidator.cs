using FluentValidation;
using ProjectManager.Application.DTOs.Project;
using ProjectManager.Domain.Enums;

namespace ProjectManager.Application.Validators;

public class UpdateProjectRequestValidator : AbstractValidator<UpdateProjectRequest>
{
    public UpdateProjectRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Proje adi bos olamaz.")
            .MaximumLength(200).WithMessage("Proje adi en fazla 200 karakter olabilir.");

        // Create'ten farkli olarak Status da degistirilebiliyor (Planning/Active/
        // Paused/Completed/Archived arasi) - o yuzden burada ekstra bir kural var.
        RuleFor(x => x.Status)
            .Must(EnumValidationExtensions.IsValidEnumValue<ProjectStatus>)
            .WithMessage("Gecersiz proje durumu.");
    }
}
