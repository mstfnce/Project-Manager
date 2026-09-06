using FluentValidation;
using ProjectManager.Application.DTOs.Notes;
using ProjectManager.Domain.Enums;

namespace ProjectManager.Application.Validators;

public class CreateNoteRequestValidator : AbstractValidator<CreateNoteRequest>
{
    public CreateNoteRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Baslik bos olamaz.")
            .MaximumLength(200).WithMessage("Baslik en fazla 200 karakter olabilir.");

        // Content markdown metin - Title kadar kisa olmasi beklenmiyor, o yuzden
        // MaximumLength koymuyoruz, sadece bos gonderilmesini engelliyoruz.
        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Icerik bos olamaz.");

        RuleFor(x => x.Type)
            .Must(EnumValidationExtensions.IsValidEnumValue<NoteType>)
            .WithMessage("Gecersiz not turu.");
    }
}
