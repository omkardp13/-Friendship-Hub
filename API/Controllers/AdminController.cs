using API.Database;
using API.Entities;
using API.Interfaces;
using API.Services;
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

        private readonly IUnitOfWork _unitOfWork;

        private readonly IPhotoService _photoService;

        
        public AdminController(UserManager<AppUser> userManager, IUnitOfWork unitOfWork, IPhotoService photoService)
        {
            _userManager = userManager;
            _unitOfWork = unitOfWork;
            _photoService = photoService;
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpGet("users-with-roles")]
        public async Task<ActionResult> GetUsersWithRoles()
        {
            var users = await _userManager.Users
                .OrderBy(x => x.UserName)
                .Select(x => new
                {
                    x.Id,
                    Username = x.UserName,
                    Roles = x.UserRoles.Select(r => r.Role.Name).ToList()
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

            
            var selectedRoles = roles.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);

            
            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return NotFound("User not found.");
            }

           
            var userRoles = await _userManager.GetRolesAsync(user);

           
            var rolesToAdd = selectedRoles.Except(userRoles).ToList();
            var rolesToRemove = userRoles.Except(selectedRoles).ToList();

          
            if (rolesToAdd.Any())
            {
                var addResult = await _userManager.AddToRolesAsync(user, rolesToAdd);
                if (!addResult.Succeeded)
                {
                    return BadRequest("Failed to add roles.");
                }
            }

            
            if (rolesToRemove.Any())
            {
                var removeResult = await _userManager.RemoveFromRolesAsync(user, rolesToRemove);
                if (!removeResult.Succeeded)
                {
                    return BadRequest("Failed to remove roles.");
                }
            }

           
            var updatedRoles = await _userManager.GetRolesAsync(user);
            return Ok(updatedRoles);
        }


        [Authorize(Policy = "ModeratePhotoRole")]
        [HttpGet("photos-to-moderate")]
        public async Task<ActionResult> GetPhotosForModeration()
        {
            var photos = await _unitOfWork.PhotoRepository.GetUnapprovedPhotos();
            return Ok(photos);
        }


        [Authorize(Policy = "ModeratePhotoRole")]
        [HttpPost("approve-photo/{photoId}")]
        public async Task<ActionResult> ApprovePhoto(int photoId)
        {
            var photo = await _unitOfWork.PhotoRepository.GetPhotoById(photoId);
            if (photo == null) return BadRequest("Could not get photo from db");
            photo.IsApproved = true;
            await _unitOfWork.Complete();
            return Ok();
        }


        [Authorize(Policy = "ModeratePhotoRole")]
        [HttpPost("reject-photo/{photoId}")]
        public async Task<ActionResult> RejectPhoto(int photoId)
        {
            var photo = await _unitOfWork.PhotoRepository.GetPhotoById(photoId);
            if (photo == null) return BadRequest("Could not get photo from db");
            if (photo.PublicId != null)
            {
                var result = await _photoService.DeletePhotoAync(photo.PublicId);
                if (result.Result == "ok")
                {
                    _unitOfWork.PhotoRepository.RemovePhoto(photo);

                }
            }

            else
            {
                _unitOfWork.PhotoRepository.RemovePhoto(photo);
            }
            await _unitOfWork.Complete();
            return Ok();
        }
    }

}
