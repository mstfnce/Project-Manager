# Interface, Composition Root, Dependency Inversion/Injection — Bölüm 4 Notu

## Anladığım şey (kendi cümlelerim)

İlk önce interface'lerimizi yazıp Application katmanında birer **söz** verdik
(`IUserRepository`, `IPasswordHasher`). Sonra Infrastructure katmanında bu
sözleri tuttuk — gerçek kodu yazdık, veriyi çektik.

Application katmanı Infrastructure'ı **görmüyor**, o yüzden sözler üzerinden
ilerliyor — sözler olmasaydı bu iş yapılamazdı (Application, Infrastructure'a
doğrudan bağlanamaz, proje referansı bile yok).

Bu sözlere güvenerek Application katmanında `AuthService`'i yazdık — servis,
`IUserRepository`/`IPasswordHasher` arayüzlerini kullanıyor ama gerçek
implementasyonu (Infrastructure) hiç görmüyor/bilmiyor.

Api tarafındaki `AuthController` ise sadece `AuthService`'i çağırıyor,
sonucu bir HTTP koduna çeviriyor (`200`/`409`). Controller da Infrastructure'ı
görmüyor — sadece Application'ı (`AuthService`'i) tanıyor.

**Asıl birleştirme (interface → gerçek implementasyon eşleştirmesi) Program.cs'te
oluyor** — ama Program.cs de Api projesinin bir dosyası olduğu için bu kafa
karıştırıcı geldi. Netleşen kısım: `Api` projesinin hem Application'ı hem
Infrastructure'ı görme **izni** var (proje referansı seviyesinde), ama bu izni
her dosya kullanmıyor — `AuthController.cs`'de Infrastructure'a hiç `using`
yok, sadece `Program.cs`'de var. Yani "aynı projede olmak" ile "aynı şeyi
bilmek" farklı şeyler; her dosya kendi `using`'leriyle kendi görüş alanını
belirliyor.

Program.cs'in bu özel rolüne **Composition Root** deniyor — tüm bağımlılıkların
gerçekten birbirine eşleştirildiği tek nokta.

## Dependency Inversion vs Dependency Injection farkı

- **Dependency Inversion** = tasarım **prensibi**: "somut sınıfa değil,
  arayüze bağımlı ol" (`IUserRepository` kullanmak, `UserRepository` değil)
- **Dependency Injection** = bunu **gerçekleştiren teknik**: bağımlılığı
  dışarıdan (constructor üzerinden) vermek

`Program.cs`'teki `AddScoped<IUserRepository, UserRepository>()` = **kayıt**
("kim istenirse ne verilecek" kuralı). `AuthService`'in constructor'ı =
**enjeksiyon noktası** (container'ın gerçekten nesneyi doldurduğu yer).
İkisi birlikte Dependency Injection mekanizmasını oluşturuyor.

## Somut örnek — MVC'den bildiğim karşılığı

ASP.NET Core Identity'deki `IEmailSender` arayüzü tam olarak aynı desen:
Identity, e-posta göndermeyi bilmiyor, sadece "e-posta gönderebilecek bir şey
ver" diyor; `SendGridEmailSender` gibi bir sınıf bu sözü tutuyor, `Program.cs`/
`Startup.cs`'te `AddTransient<IEmailSender, SendGridEmailSender>()` ile
eşleştiriliyor.

## Ek not — DTO'lar neden Infrastructure'da değil Application'da

"Dış dünyaya bakan yüz" (DTO) ile Infrastructure'ın "dış dünya"sı aynı şey
değil. Infrastructure'daki dış dünya = **teknoloji bağımlılığı** (EF Core,
BCrypt, JWT kütüphaneleri). DTO'lar (`CreateProjectRequest`, `ProjectResponse`
gibi) ise saf `record` — hiçbir teknoloji `using`'i taşımıyor, sadece veri
şekli tanımlıyor. Bu yüzden Domain entity'leri gibi "temiz" kalıyorlar ve
Application'a ait olabiliyorlar; asıl kriter "dışa mı bakıyor" değil,
"teknik bağımlılığı var mı" sorusu.
