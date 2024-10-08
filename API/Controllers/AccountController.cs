﻿using API.Database;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections;
using System.Security.Cryptography;
using System.Text;

namespace API.Controllers
{
   
    public class AccountController : BaseAPIController
    {
        private readonly UserManager<AppUser> userManager;
        private readonly ITokenService tokenService;
        private readonly IMapper mapper;

        // Constructor for dependency injection
        public AccountController(UserManager<AppUser> _userManager, ITokenService _tokenService, IMapper _mapper)
        {
            userManager = _userManager;
            tokenService = _tokenService;
            mapper = _mapper;
        }
        [HttpPost("register")] //POST: api/account/register?username=dave&password=pwd;       
        
        /*controller look inside the body of the request to find out what it is we're passing up to it,but 
         * 
         * */
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {
            if(await UserExists(registerDto.Username))
            {
                return BadRequest("Username is taken");
            }

        
            var user= mapper.Map<AppUser>(registerDto);

            user.UserName = registerDto.Username.ToLower();

            var result=await userManager.CreateAsync(user,registerDto.Password);

            if (!result.Succeeded) return BadRequest(result.Errors);

            return new UserDto
            {
                Username = user.UserName,
                Token = await tokenService.CreateToken(user),
                Gender = user.Gender,
                KnownAs =user.KnownAs
            };

        }

        private async Task<bool> UserExists(string username)
        {
            return await userManager.Users.AnyAsync(x => x.NormalizedUserName == username.ToUpper());

        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user =await userManager.Users
                .Include(p => p.Photos)
                .SingleOrDefaultAsync(x => x.UserName == loginDto.Username.ToUpper());

        
            if (user == null || user.UserName ==null)
            {
                return Unauthorized("invalid username");
            }

            var result = await userManager.CheckPasswordAsync(user, loginDto.Password);
            
            if(!result)
                return Unauthorized();
        

            return new UserDto
            {
                Username = user.UserName,
                KnownAs = user.KnownAs,
                Token = await tokenService.CreateToken(user),
                Gender = user.Gender,
                PhotoUrl=user.Photos.FirstOrDefault(x=>x.IsMain)?.Url
            };
        }

    }
}
