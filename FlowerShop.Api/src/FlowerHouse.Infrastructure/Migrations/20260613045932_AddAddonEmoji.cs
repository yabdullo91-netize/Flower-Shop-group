using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlowerHouse.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAddonEmoji : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Emoji",
                table: "Addons",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Emoji",
                table: "Addons");
        }
    }
}
