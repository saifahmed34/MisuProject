using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using MisuProject.Data;
using MisuProject.Models;

namespace MisuProject.Hubs;
[Authorize]
public class ChatHub:Hub
{
    private readonly AppDbContext _context;

    public ChatHub(AppDbContext context)
    {
        _context = context;
    }

    public async Task SendMessageToGroup(string groupName, string message)
    {
        var senderEmail = Context.User?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value ?? "unknown@email.com";
        var senderId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "anonymous";

        var chatMessage = new ChatMessage
        {
            Sender = senderEmail,
            SenderId = senderId,
            Content = message,
            Timestamp = DateTime.UtcNow,
            Group = groupName
        };

        _context.ChatMessages.Add(chatMessage);
        await _context.SaveChangesAsync();

        await Clients.Group(groupName).SendAsync("ReceiveMessage", senderEmail, message);
    }


    public Task JoinGroup(string groupName)
    {
        return Groups.AddToGroupAsync(Context.ConnectionId, groupName);
    }
   
}