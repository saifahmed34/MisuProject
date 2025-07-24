using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MisuProject.Data;
using MisuProject.Dtos;
using MisuProject.Models;

namespace MisuProject.Controllers;

[Route("api/[controller]")]
[ApiController]


public class MessageController : ControllerBase
{
    private readonly AppDbContext _context;

    public MessageController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendMessage([FromBody] ChatMessageDto dto)
    {
        var sender = User.Identity?.Name;
        if (string.IsNullOrEmpty(sender)) return Unauthorized();

        var message = new ChatMessage
        {
            Id = Guid.NewGuid(),
            Content = dto.Message,
            Sender = dto.Sender,
            Timestamp = DateTime.UtcNow
        };

        _context.ChatMessages.Add(message);
        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpGet("messages")]
    public async Task<IActionResult> GetMessages([FromQuery] DateTime? since)
    {
        var messages = await _context.ChatMessages
            .Where(m => !since.HasValue || m.Timestamp > since)
            .OrderBy(m => m.Timestamp)
            .Select(m => new ChatMessageDto
            {
                Message = m.Content,
                Sender = m.Sender,
                Timestamp = m.Timestamp
            })
            .ToListAsync();

        return Ok(messages);
    }
}