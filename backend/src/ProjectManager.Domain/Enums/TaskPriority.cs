namespace ProjectManager.Domain.Enums;

// Bir TaskItem'ın önem sırası. Sıralama önemli: Low=0 ... Critical=3,
// önceliğe göre sıralama/filtreleme bu sayısal değere dayanır.
public enum TaskPriority
{
    Low,
    Medium,
    High,
    Critical
}
