using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MisuProject.Migrations
{
    /// <inheritdoc />
    public partial class RemoveOtpExpiration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            //migrationBuilder.DropColumn(
            //    name: "OtpExpiration",
            //    table: "Users");

            //migrationBuilder.DropColumn(
            //    name: "ResetOtp",
            //    table: "Users");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "OtpExpiration",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResetOtp",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
