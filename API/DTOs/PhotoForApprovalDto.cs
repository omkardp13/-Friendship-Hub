using API.Entities;

namespace API.DTOs
{
    public class PhotoForApprovalDto
    {
        public int Id { get; set; }
        public required string Url { get; set; }
        public string? Username { get; set; } // optional as this matches the
       
          public bool IsApproved { get; set; }
    }

}
