namespace MisuProject.Models.AuthModels
{
    public class Role
    {
        public enum RoleName
        {
            Admin,
            User,
            // Add more roles as needed
        }
        public Guid Id { get; set; }
        public RoleName Name { get; set; }
        public int Level { get; set; }

        public List<User> Users { get; set; }
    }
}
