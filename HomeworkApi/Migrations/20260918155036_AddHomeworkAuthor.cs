using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeworkApi.Migrations
{
    /// <inheritdoc />
    public partial class AddHomeworkAuthor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CreatedByUserId",
                table: "Homeworks",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPersonal",
                table: "Homeworks",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Homeworks");

            migrationBuilder.DropColumn(
                name: "IsPersonal",
                table: "Homeworks");
        }
    }
}
