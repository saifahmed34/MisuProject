using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MisuProject.Migrations
{
    /// <inheritdoc />
    public partial class RestrictToCascade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FollowUsers_Users_FolloweeId",
                table: "FollowUsers");

            migrationBuilder.DropColumn(
                name: "OtpExpiration",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ResetOtp",
                table: "Users");

            migrationBuilder.AddForeignKey(
                name: "FK_FollowUsers_Users_FolloweeId",
                table: "FollowUsers",
                column: "FolloweeId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FollowUsers_Users_FolloweeId",
                table: "FollowUsers");

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

            migrationBuilder.AddForeignKey(
                name: "FK_FollowUsers_Users_FolloweeId",
                table: "FollowUsers",
                column: "FolloweeId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
