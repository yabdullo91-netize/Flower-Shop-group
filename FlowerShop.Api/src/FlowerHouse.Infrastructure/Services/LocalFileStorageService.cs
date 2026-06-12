using System;
using System.IO;
using System.Threading.Tasks;
using FlowerHouse.Domain.Interfaces;

namespace FlowerHouse.Infrastructure.Services;

public class LocalFileStorageService : IFileStorageService
{
    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string folderName)
    {
        var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
        // Ensure folder exists
        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", folderName);
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var filePath = Path.Combine(uploadsFolder, uniqueFileName);
        using (var ws = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(ws);
        }

        return $"/uploads/{folderName}/{uniqueFileName}";
    }

    public Task DeleteFileAsync(string fileUrl)
    {
        if (string.IsNullOrWhiteSpace(fileUrl))
            return Task.CompletedTask;

        // Extract relative path
        var relativePath = fileUrl.TrimStart('/');
        var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", relativePath.Replace('/', Path.DirectorySeparatorChar));

        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }

        return Task.CompletedTask;
    }
}
