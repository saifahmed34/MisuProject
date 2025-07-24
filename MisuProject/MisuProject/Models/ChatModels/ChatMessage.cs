namespace MisuProject.Models;

public class ChatMessage
{
    public Guid Id { get; set; }
    public string Sender { get; set; }
    public string SenderId { get; set; }
    public string Content { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.Now;
    public string Group { get; set; } = "general"; // default group
}