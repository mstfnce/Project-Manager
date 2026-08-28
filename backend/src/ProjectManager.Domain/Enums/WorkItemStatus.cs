namespace ProjectManager.Domain.Enums;

// Bir TaskItem'ın kanban board'daki hangi sütunda olduğunu belirler.
// İsim "TaskStatus" değil çünkü System.Threading.Tasks.TaskStatus ile çakışır.
public enum WorkItemStatus
{
    Todo,        // henüz başlanmadı
    InProgress,  // üzerinde çalışılıyor
    Blocked,     // bir engel var, ilerleyemiyor
    Done         // tamamlandı
}
