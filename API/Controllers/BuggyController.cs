using API.Database;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BuggyController : BaseAPIController
    {
        private readonly DataContext context;

        // Constructor for dependency injection
        public BuggyController(DataContext _context)
        {
            context = _context;
        }
        [Authorize]
        [HttpGet("auth")]
        public ActionResult<string> GetAuth()
        {
            return "secret text";
        }

        [HttpGet("not-found")]

        public ActionResult<AppUser> GetNotFound()
        {
            var thing = context.Users.Find(-1);

            if(thing ==null)
                return NotFound();


            return thing;
        }


       
        [HttpGet("server-error")]

        public ActionResult<string> GetServerError()
        {
           
                var thing = context.Users.Find(-1) ?? throw new Exception("A bad thing has happened");

                return "secret text";
            
        }


        [HttpGet("bad-request")]

        public ActionResult<string> GetBadRequest()
        {
            return BadRequest("This was not a good request");
        }

    }
}
