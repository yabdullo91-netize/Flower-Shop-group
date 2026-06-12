using System.IO;
using System.Threading.Tasks;

namespace FlowerHouse.Domain.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(Stream fileStream, string fileName, string folderName);
    Task DeleteFileAsync(string fileUrl);
}
