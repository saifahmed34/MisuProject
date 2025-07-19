using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MisuProject.Data;
using MisuProject.Models.Follow;
using System.Security.Claims;

namespace MisuProject.Controllers.FollowUsers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FollowController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FollowController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpPost("{followeeId}")]
        public async Task<IActionResult> FollowUser(Guid followeeId)
        {
            var followerIdString = User.FindFirstValue(ClaimTypes.Name);
            if (string.IsNullOrEmpty(followerIdString))
                return Unauthorized("User identifier not found.");
            var followerId = Guid.Parse(followerIdString);

            if (followerId == followeeId)
                return BadRequest("You cannot follow yourself.");

            var alreadyFollowed = await _context.FollowUsers
                .AnyAsync(f => f.FollowerId == followerId && f.FolloweeId == followeeId);

            if (alreadyFollowed)
                return BadRequest("You are already following this user.");

            var follow = new UserFollow
            {
                FollowerId = followerId,
                FolloweeId = followeeId,
                FollowedAt = DateTime.UtcNow
            };

            _context.FollowUsers.Add(follow);
            await _context.SaveChangesAsync();

            return Ok("Followed user successfully.");
        }

        [Authorize]
        [HttpDelete("{followeeId}")]
        public async Task<IActionResult> UnfollowUser(Guid followeeId)
        {
            var followerIdString = User.FindFirstValue(ClaimTypes.Name);
            if (string.IsNullOrEmpty(followerIdString))
                return Unauthorized("User identifier not found.");
            var followerId = Guid.Parse(followerIdString);

            var follow = await _context.FollowUsers
                .FirstOrDefaultAsync(f => f.FollowerId == followerId && f.FolloweeId == followeeId);

            if (follow == null)
                return NotFound("You are not following this user.");

            _context.FollowUsers.Remove(follow);
            await _context.SaveChangesAsync();

            return Ok("Unfollowed user successfully.");
        }

        [Authorize]
        [HttpGet("my-following")]
        public async Task<IActionResult> GetMyFollowing()
        {
            var followerId = Guid.Parse(User.FindFirstValue(ClaimTypes.Name));

            var followingNames = await _context.FollowUsers
                .Where(f => f.FollowerId == followerId)
                .Join(_context.Users,
                    follow => follow.FolloweeId,
                    user => user.Id,
                    (follow, user) => user.Name)
                .ToListAsync();

            return Ok(followingNames);
        }

        [Authorize]
        [HttpGet("my-followers")]
        public async Task<IActionResult> GetMyFollowers()
        {
            var followeeId = Guid.Parse(User.FindFirstValue(ClaimTypes.Name));

            var followerNames = await _context.FollowUsers
                .Where(f => f.FolloweeId == followeeId)
                .Join(_context.Users,
                    follow => follow.FollowerId,
                    user => user.Id,
                    (follow, user) => user.Name)
                .ToListAsync();

            return Ok(followerNames);
        }

    }
}

