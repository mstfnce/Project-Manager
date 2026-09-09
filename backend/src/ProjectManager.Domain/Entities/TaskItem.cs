using ProjectManager.Domain.Enums;

namespace ProjectManager.Domain.Entities;

// Kanban board'daki tek bir görev kartı. Bir Project'e ait olmak zorunda.
public class TaskItem
{
    public int Id { get; set; }
    public int ProjectId { get; set; }   // foreign key -> Projects tablosu
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public WorkItemStatus Status { get; set; } = WorkItemStatus.Todo;    // hangi kanban sütunu
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public DateTime? DueDate { get; set; }       // opsiyonel son tarih
    public DateTime? CompletedAt { get; set; }   // Done olunca doldurulur
    public int Order { get; set; }               // aynı sütun içindeki sıra

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public Project Project { get; set; } = null!;   // navigation property

    public int? ParentTaskId { get; set; }   // null = ana görev, doluysa bir alt görev

    public TaskItem? ParentTask { get; set; }        // ust gorev (ana gorevse null)
    public List<TaskItem> SubTasks { get; set; } = [];  // alt gorevler (ana gorev degilse hep bos)
}
