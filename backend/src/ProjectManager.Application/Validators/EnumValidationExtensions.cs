namespace ProjectManager.Application.Validators;

// Butun validator'larin enum string'lerini (Priority, Status, Type vb.)
// dogrularken kullandigi ortak yardimci. Her validator kendi Must(...) icinde
// bu tek satiri cagiriyor - TaskService.ApplyStatus'taki paylasilan yardimci
// mantiginin ayni sekilde tekrari.
public static class EnumValidationExtensions
{
    // Enum.Parse yerine Enum.TryParse kullaniyoruz: gecersiz string'de exception
    // firlatmiyor, sadece false donuyor - "gecerli mi" sorusuna cevap ariyoruz,
    // deger istemiyoruz (out _).
    public static bool IsValidEnumValue<TEnum>(string value) where TEnum : struct, Enum =>
        Enum.TryParse<TEnum>(value, ignoreCase: true, out _);
}
