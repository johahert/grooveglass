using groove_glass_api.Services.Interfaces;
using OpenAI.Chat;

namespace groove_glass_api.Services.Implementations
{
    public class OpenAiApiService : IOpenAiApiService
    {
        private readonly ChatClient _chatClient;

        public OpenAiApiService(ChatClient chatClient)
        {
            _chatClient = chatClient;
        }

        public async Task<string> GetQuizPrompt(string description, int questionCount)
        {
            var prompt = $"Generate a quiz with {questionCount} questions about the following: {description}";
            ChatCompletion completion = await _chatClient.CompleteChatAsync(prompt);

            var response = completion.Content[0].Text ?? string.Empty;

            return response;
        }
    }
}
