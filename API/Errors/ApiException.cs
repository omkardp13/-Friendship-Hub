namespace API.Errors
{
    public class ApiException(int statusCode,string message,string? details)
    {
        public int statusCode { get; set; }=statusCode; 
        
        public string Message { get; set; }=message;

        public string? Details { get; set; } = details;
    }
}
