﻿using System.Security.Claims;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Contollers;

public class UsersController : BaseApiController
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;
    private readonly IPhotoService _photoService;

    public UsersController(IUserRepository userRepository, IMapper mapper, IPhotoService photoService)
    {
        _userRepository = userRepository;
        _mapper = mapper;
        _photoService = photoService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedList<MemberDto>>> GetUsers([FromQuery] UserParams userParams)
    {
        var user = await _userRepository.GetUserByUsernameAsync(User.GetUsername());

        userParams.CurrentUsername = user.UserName;

        if (string.IsNullOrEmpty(userParams.Gender))
        {
            userParams.Gender = user.Gender == "male" ? "female" : "male";
        }

        var users = await _userRepository.GetMembersAsync(userParams);

        Response.AddPaginationHeader(new PaginationHeader(users.CurrentPage, users.PageSize, users.TotalCount, users.TotalPages));

        // Map from AppUser to MemberDto
        var userDto = _mapper.Map<IEnumerable<MemberDto>>(users);

        return Ok(userDto);
    }

    [HttpGet("{username}")]
    public async Task<ActionResult<MemberDto>> GetUser(string username)
    {
        var user = await _userRepository.GetMemberAsync(username);

        // Map from AppUser to MemberDto
        var userDto = _mapper.Map<MemberDto>(user);

        return Ok(userDto);
    }

    [HttpPut]
    public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdateDto)
    {
        // Get the username from the token
        var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (username == null) return Unauthorized();

        // Get the user from the database
        var user = await _userRepository.GetUserByUsernameAsync(username);

        if (user == null) return NotFound();

        // Map from MemberUpdateDto to AppUser
        _mapper.Map(memberUpdateDto, user);

        // Update the user
        _userRepository.Update(user);

        // Save the changes to the database
        if (await _userRepository.SaveAllAsync()) return NoContent();

        return BadRequest("Failed to update user");
    }

    [HttpPost("add-photo")]
    public async Task<ActionResult<PhotoDto>> AddPhoto(IFormFile file)
    {
        // Get the username from the token
        // Created a new extension method in API/Extensions/ClaimsPrincipalExtensions.cs
        var username = User.GetUsername();

        if (username == null) return Unauthorized();

        // Get the user from the database
        var user = await _userRepository.GetUserByUsernameAsync(username);

        if (user == null) return NotFound();

        // Upload the photo to Cloudinary
        var result = await _photoService.AddPhotoAsync(file);

        if (result.Error != null) return BadRequest(result.Error.Message);

        // Create a new photo object
        var photo = new Photo
        {
            Url = result.SecureUrl.AbsoluteUri,
            PublicId = result.PublicId
        };

        // If the user doesn't have a main photo, set this photo as the main photo
        if (user.Photos.Count == 0)
        {
            photo.IsMain = true;
        }

        // Add the photo to the user's photos
        user.Photos.Add(photo);

        // Save the changes to the database
        if (await _userRepository.SaveAllAsync())
        {
            // Map from Photo to PhotoDto
            // return CreatedAtRoute("GetUser", new { username = user.UserName }, _mapper.Map<PhotoDto>(photo));
            return CreatedAtAction(nameof(GetUser), new { username = user.UserName }, _mapper.Map<PhotoDto>(photo));
        }

        return BadRequest("Problem adding photo");
    }

    [HttpPut("set-main-photo/{photoId}")]
    public async Task<ActionResult> SetMainPhoto(int photoId)
    {
        // Get the username from the token
        var username = User.GetUsername();

        if (username == null) return Unauthorized();

        // Get the user from the database
        var user = await _userRepository.GetUserByUsernameAsync(username);

        if (user == null) return NotFound();

        // Get the photo from the database
        var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);

        if (photo == null) return NotFound();

        // If the photo is already the main photo, return BadRequest
        if (photo.IsMain) return BadRequest("This is already your main photo");

        // Get the current main photo
        var currentMain = user.Photos.FirstOrDefault(x => x.IsMain);

        // If there is a current main photo, set it to false
        if (currentMain != null) currentMain.IsMain = false;

        // Set the new photo to true
        photo.IsMain = true;

        // Save the changes to the database
        if (await _userRepository.SaveAllAsync()) return NoContent();

        return BadRequest("Failed to set main photo");
    }

    [HttpDelete("delete-photo/{photoId}")]
    public async Task<ActionResult> DeletePhoto(int photoId)
    {
        // Get the username from the token
        var username = User.GetUsername();

        if (username == null) return Unauthorized();

        // Get the user from the database
        var user = await _userRepository.GetUserByUsernameAsync(username);

        if (user == null) return NotFound();

        // Get the photo from the database
        var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);

        if (photo == null) return NotFound();

        // If the photo is the main photo, return BadRequest
        if (photo.IsMain) return BadRequest("You cannot delete your main photo");

        // If the photo has a public id, delete it from Cloudinary
        if (photo.PublicId != null)
        {
            var result = await _photoService.DeletePhotoAsync(photo.PublicId);

            if (result.Error != null) return BadRequest(result.Error.Message);
        }

        // Remove the photo from the user's photos
        user.Photos.Remove(photo);

        // Save the changes to the database
        if (await _userRepository.SaveAllAsync()) return Ok();

        return BadRequest("Failed to delete photo");
    }
}
