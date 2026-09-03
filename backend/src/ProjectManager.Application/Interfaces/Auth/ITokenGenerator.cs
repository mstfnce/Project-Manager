using ProjectManager.Domain.Entities;

namespace ProjectManager.Application.Interfaces;

// İstek listesi: JWT üretme gerçek işini Infrastructure yapacak.
public interface ITokenGenerator
{
    string GenerateToken(User user);
}
