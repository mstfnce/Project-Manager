using FluentValidation;
using ProjectManager.Application.DTOs.Project;

namespace ProjectManager.Application.Validators;

public class CreateProjectRequestValidator : AbstractValidator<CreateProjectRequest>
{
    public CreateProjectRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Proje adi bos olamaz.")
            .MaximumLength(200).WithMessage("Proje adi en fazla 200 karakter olabilir.");
    }
}
