namespace ProjectManager.Application.Interfaces;

// İstek listesi: şifre hash'leme gerçek işini Infrastructure yapacak,
// Application sadece bu iki metodun var olmasını şart koşuyor.
public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);
}
