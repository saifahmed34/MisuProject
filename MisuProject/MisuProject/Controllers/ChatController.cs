using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MisuProject.Data;
using MisuProject.Models;
using System.Security.Claims;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class ChatController : ControllerBase
{
    private readonly AppDbContext _context;

    public ChatController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetMessageHistory()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var messages = await _context.ChatMessages
            .OrderBy(m => m.Timestamp)
            .Take(100)
            .Select(msg => new
            {
                msg.Sender,
                msg.Content,
                Timestamp = msg.Timestamp.ToString("g"),
                IsCurrentUser = msg.SenderId == userId
            })
            .ToListAsync();

        return Ok(messages);
    }

    [HttpPost("send")]
    public async Task<IActionResult> SaveMessage([FromBody] ChatMessage message)
    {
        message.Timestamp = DateTime.UtcNow;
        _context.ChatMessages.Add(message);
        await _context.SaveChangesAsync();
        return Ok();
    }
}