namespace MisuProject.Models.Follow
{
    public class UserFollow
    {
        public Guid FollowerId { get; set; }  // FK to User
        public Guid FolloweeId { get; set; }  // FK to User

        public DateTime FollowedAt { get; set; } = DateTime.UtcNow;
    }

}
