using FluentValidation;
using ProjectManager.Application.DTOs.Tasks;
using ProjectManager.Domain.Enums;

namespace ProjectManager.Application.Validators;

// CreateTaskRequest icin dogrulama kurallari. Bu sinif hicbir yerden elle
// cagrilmiyor - Program.cs'teki DI kaydi sayesinde ASP.NET Core, controller'a
// girmeden once model binding sirasinda otomatik calistiriyor.
public class CreateTaskRequestValidator : AbstractValidator<CreateTaskRequest>
{
    public CreateTaskRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Baslik bos olamaz.")
            .MaximumLength(200).WithMessage("Baslik en fazla 200 karakter olabilir.");

        // TaskPriority (Low/Medium/High/Critical) disinda bir string gelirse
        // service katmanindaki Enum.Parse patlamadan once burada 400'e cevriliyor.
        RuleFor(x => x.Priority)
            .Must(EnumValidationExtensions.IsValidEnumValue<TaskPriority>)
            .WithMessage("Gecersiz oncelik degeri.");
    }
}
