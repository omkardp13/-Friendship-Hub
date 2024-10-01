using API.Entities;

namespace API.DTOs
{
    public class MessageDto
    {
        
            public int Id { get; set; }

            public int SenderId { get; set; }

            public required string SenderUsername { get; set; }

            public required string SenderPhotoUrl { get; set; }

            public required string Content { get; set; }

            public DateTime? DateRead { get; set; }

            public DateTime MessageSent { get; set; } = DateTime.UtcNow;

            public string RecipientUsername { get; set; }

            public bool SenderDeleted { get; set; }

            public bool RecipientDeleted { get; set; }
            public required string RecipientPhotoUrl { get; set; }
    }
}
