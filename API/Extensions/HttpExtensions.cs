using API.Helpers;
using Microsoft.AspNetCore.Http;  // Ensure this is added to use HttpResponse
using System.Text.Json;

namespace API.Extensions
{
    public static class HttpExtensions
    {
        public static void AddPaginationHeader<T>(this HttpResponse response, PagedList<T> data)
        {
            // Create a pagination header
            var paginationHeader = new PaginationHeader(data.CurrentPage, data.PageSize, data.TotalCount, data.TotalPages);

            // Setup JSON serialization options for camelCase
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            // Serialize the pagination header to JSON and append it to the response headers
            response.Headers.Append("Pagination", JsonSerializer.Serialize(paginationHeader, jsonOptions));

            // Add CORS-related header to expose the Pagination header in client-side responses
            response.Headers.Append("Access-Control-Expose-Headers", "Pagination");
        }
    }
}
