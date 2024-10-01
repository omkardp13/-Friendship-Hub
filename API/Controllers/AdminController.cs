using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Immutable;

namespace API.Controllers
{
    
    public class AdminController : BaseAPIController
    {
        private readonly UserManager<AppUser> _userManager;

        // Constructor for dependency injection
        public AdminController(UserManager<AppUser> userManager)
        {
            _userManager = userManager;
        }

        [Authorize(Policy ="RequireAdminRole")]
        [HttpGet("users-with-roles")]
        public async Task<ActionResult> GetUsersWithRoles()
        {
            var users = await _userManager.Users
                .OrderBy(x => x.UserName)
                .Select(x => new
                {
                    x.Id,
                    Username = x.UserName,
                    Roles = x.UserRoles.Select(r=>r.Role.Name).ToList()
                }).ToListAsync();

            return Ok(users);
        }


        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("edit-roles/{username}")]
        public async Task<ActionResult> EditRoles(string username, string roles)
        {
            if (string.IsNullOrEmpty(roles))
            {
                return BadRequest("You must select at least one role.");
            }

            // Split roles into an array
            var selectedRoles = roles.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);

            // Find user by username
            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Get the current roles of the user
            var userRoles = await _userManager.GetRolesAsync(user);

            // Determine roles to add and remove
            var rolesToAdd = selectedRoles.Except(userRoles).ToList();
            var rolesToRemove = userRoles.Except(selectedRoles).ToList();

            // Add new roles
            if (rolesToAdd.Any())
            {
                var addResult = await _userManager.AddToRolesAsync(user, rolesToAdd);
                if (!addResult.Succeeded)
                {
                    return BadRequest("Failed to add roles.");
                }
            }

            // Remove old roles
            if (rolesToRemove.Any())
            {
                var removeResult = await _userManager.RemoveFromRolesAsync(user, rolesToRemove);
                if (!removeResult.Succeeded)
                {
                    return BadRequest("Failed to remove roles.");
                }
            }

            // Return the updated list of roles
            var updatedRoles = await _userManager.GetRolesAsync(user);
            return Ok(updatedRoles);
        }





        [Authorize(Policy="ModeratePhotoRole")]
        [HttpGet("photos-to-moderate")]

        public ActionResult GetPhotosForModerations()
        {
            return Ok("Admins or moderators can see this");
        }
    }
}
