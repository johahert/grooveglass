namespace groove_glass_api.Services.Interfaces
{
    public interface IOpenAiApiService
    {
        Task<string> GetQuizPrompt(string description, int questionCount);
    }
}
