// Backend'deki LoginRequest ve AuthResponse DTO'larinin TypeScript karsiligi.
// Alan adlari camelCase: ASP.NET Core, C#'taki PascalCase (Email, UserId)
// property'lerini JSON'a cevirirken varsayilan olarak camelCase yapiyor.

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  userId: number
  email: string
  displayName: string
  token: string
}
