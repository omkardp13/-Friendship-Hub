using API.Database;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using System.Security.Claims;

namespace API.Controllers
{

    [Authorize]
    public class UsersController : BaseAPIController
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly IMapper mapper;
        private readonly IPhotoService photoService;

        // Constructor for dependency injection
        public UsersController(IUnitOfWork unitOfWork, IMapper _mapper, IPhotoService _photoService)
        {
            this.unitOfWork = unitOfWork;
            mapper = _mapper;
            photoService = _photoService;
        }

        [Authorize(Roles = "Member")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MemberDto>>> GetUsers([FromQuery] UserParams userParams)
        {
            userParams.CurrentUsername = User.GetUsername();    
            var users = await unitOfWork.UserRepository.GetMembersAsync(userParams);

            Response.AddPaginationHeader(users);

            return Ok(users);
        }


        /*
         * imagine,this request was testy burger that you then give to waiter who then takes order to kitchen so chef can make your burger,now in a synchronous world,the waiter would then hang around the kitchen waiting for the tatsty burger 
            now imagine,if you will ,that this request to go and get this single user and the restaurant analogy and just imagine ,this request for tasty burger that give to a waiter who then takes order to kitchen  
now in synchronous world ,the waiter would take the hang around the kitchen waiting for tasy burger to be coocked by chef in the mean time there could be other requeat coming in your seever or in restaurant anology ,but if yoy're only waiter or if that was the only way to ,he's waiting for the burger to be coocked he cannot take any orders
in web world every server is multithreaded and can be handled maybe hundreds of synchronous requests at any one time 
now in the real world of couser ,in a restaurant ,a waiter will take your order it will take to the kitchen and then he'll come back and take other orders and when the order is ready ,then a bell ring or something and a waiter will go back to the kitchen pick the  order adn dekiver it to the table but it mean time he can handle other request from other dinners

if we make this asynchronous ,sure,we make our requests to the database but then that gets passed on a diffrent threads known as a delegate and the mean time ,that thread can get on the business of handling other requests ,maybe to get the databse and get other quesries or whatever it needs to be beacuse we have request coming in web server but isn't blocked whilst it's waiting for the databse to return 


task at a task represetns an asynchronous operation that can return a value 
we need to use await operator to tell this method that we're going to wait for it and it will notify us when it;s been completed.




         * 
         * 
         */


        [Authorize(Roles = "Member")]
        [HttpGet("{username}")]  //api/users/2      
        public async Task<ActionResult<MemberDto>> GetUser(string username)
        {
            var currentUsername = User.GetUsername();
            return await unitOfWork.UserRepository.GetMemberAsync(username,
            isCurrentUser: currentUsername == username
            );
        }


        [HttpPut]
        public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdateDto)
        {
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (username == null) return BadRequest("No username found in token");

            var user=await unitOfWork.UserRepository.GetUserByUsernameAsync(username);

            if (user == null) return BadRequest("Could not find user");


            mapper.Map(memberUpdateDto, user);

            unitOfWork.UserRepository.Update(user);

            if (await unitOfWork.Complete()) return NoContent();

            return BadRequest("Failed to update the user");

        }

        [HttpPost("add-photo")]
        public async Task<ActionResult<PhotoDto>> AddPhoto(IFormFile file)
        {
            var user = await
            unitOfWork.UserRepository.GetUserByUsernameAsync(User.GetUsername());
            if (user == null) return BadRequest("Cannot update user");
            var result = await photoService.AddPhotoAsync(file);
            if (result.Error != null) return BadRequest(result.Error.Message);
            var photo = new Photo
            {
                Url = result.SecureUrl.AbsoluteUri,
                PublicId = result.PublicId
            };
            user.Photos.Add(photo);
            if (await unitOfWork.Complete())
                return CreatedAtAction(nameof(GetUser),
                new { username = user.UserName }, mapper.Map<PhotoDto>(photo));
            return BadRequest("Problem adding photo");
        }






        [HttpPut("set-main-photo/{photoId:int}")]
        public async Task<ActionResult> SetMainPhoto(int photoId)
        {
            var user=await unitOfWork.UserRepository.GetUserByUsernameAsync(User.GetUsername());

            if (user == null) return BadRequest("Could not find user");

            var photo=user.Photos.FirstOrDefault(x=>x.Id == photoId);

            if (photo == null || photo.IsMain) return BadRequest("Cannot use this as main photo");

            var currentMain=user.Photos.FirstOrDefault(x=>x.IsMain);

            if(currentMain !=null) currentMain.IsMain=false;

            photo.IsMain=true;

            if (await unitOfWork.Complete()) return NoContent();

            return BadRequest("Problem setting main photo");

        }

        [HttpDelete("delete-photo/{photoId:int}")]
        public async Task<ActionResult> DeletePhoto(int photoId)
        {
            var user = await
            unitOfWork.UserRepository.GetUserByUsernameAsync(User.GetUsername());
            if (user == null) return BadRequest("User not found");
            var photo = await unitOfWork.PhotoRepository.GetPhotoById(photoId);
            if (photo == null || photo.IsMain) return BadRequest("This photo cannot be deleted");
if (photo.PublicId != null)
            {
                var result = await photoService.DeletePhotoAync(photo.PublicId);
                if (result.Error != null) return BadRequest(result.Error.Message);
            }
            user.Photos.Remove(photo);
            if (await unitOfWork.Complete()) return Ok();
            return BadRequest("Problem deleting photo");
        }

    }
}
