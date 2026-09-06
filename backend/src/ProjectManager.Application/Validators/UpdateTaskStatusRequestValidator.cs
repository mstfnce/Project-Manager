using FluentValidation;
using ProjectManager.Application.DTOs.Tasks;
using ProjectManager.Domain.Enums;

namespace ProjectManager.Application.Validators;

// PATCH /api/tasks/{id}/status icin - tek alanli DTO, o yuzden tek kural.
public class UpdateTaskStatusRequestValidator : AbstractValidator<UpdateTaskStatusRequest>
{
    public UpdateTaskStatusRequestValidator()
    {
        RuleFor(x => x.Status)
            .Must(EnumValidationExtensions.IsValidEnumValue<WorkItemStatus>)
            .WithMessage("Gecersiz gorev durumu.");
    }
}
