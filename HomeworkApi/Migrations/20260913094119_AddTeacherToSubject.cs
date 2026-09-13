using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeworkApi.Migrations
{
    /// <inheritdoc />
    public partial class AddTeacherToSubject : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Teacher",
                table: "Subjects",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Teacher",
                table: "Subjects");
        }
    }
}
