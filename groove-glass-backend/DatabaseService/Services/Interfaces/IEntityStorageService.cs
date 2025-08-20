using System.Threading.Tasks;

namespace DatabaseService.Services.Interfaces
{
    public interface IEntityStorageService<TEntity, TKey>
    {
        Task<TEntity?> GetAsync(TKey id);
        Task StoreOrUpdateAsync(TEntity entity);
    }
}
