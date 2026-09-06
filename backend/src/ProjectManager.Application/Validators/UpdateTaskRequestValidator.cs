using FluentValidation;
using ProjectManager.Application.DTOs.Tasks;
using ProjectManager.Domain.Enums;

namespace ProjectManager.Application.Validators;

public class UpdateTaskRequestValidator : AbstractValidator<UpdateTaskRequest>
{
    public UpdateTaskRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Baslik bos olamaz.")
            .MaximumLength(200).WithMessage("Baslik en fazla 200 karakter olabilir.");

        RuleFor(x => x.Priority)
            .Must(EnumValidationExtensions.IsValidEnumValue<TaskPriority>)
            .WithMessage("Gecersiz oncelik degeri.");

        // Create'te olmayan bir alan: PUT ile Status da degistirilebiliyor
        // (Todo/InProgress/Blocked/Done arasi).
        RuleFor(x => x.Status)
            .Must(EnumValidationExtensions.IsValidEnumValue<WorkItemStatus>)
            .WithMessage("Gecersiz gorev durumu.");

        // CreateTaskRequestValidator ile ayni kural: DueDate nullable, sadece
        // deger varsa kontrol ediyoruz.
        RuleFor(x => x.DueDate)
            .GreaterThanOrEqualTo(DateTime.UtcNow.Date)
            .When(x => x.DueDate.HasValue)
            .WithMessage("Son tarih gecmis olamaz.");
    }
}
