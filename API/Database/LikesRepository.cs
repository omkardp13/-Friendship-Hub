﻿using API.DTOs;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Database
{
    public class LikesRepository(DataContext context,IMapper mapper) : ILikesRepository
    {
        public void AddLike(UserLike like)
        {
            context.Likes.Add(like);
        }

        public void DeleteLike(UserLike like)
        {
           context.Likes.Remove(like);
        }

        public async Task<IEnumerable<int>> GetCurrentUserLikesIds(int currentUserId)
        {
            return await context.Likes
                .Where(x => x.SourceUserId == currentUserId)
                .Select(x => x.TargetUserId)
                .ToListAsync();
        }

        public async Task<UserLike> GetUserLike(int sourceUserId, int targetUserId)
        {
            return await context.Likes.FindAsync(sourceUserId,targetUserId);
        }

        public async Task<PagedList<MemberDto>> GetUserLikes(LikesParams likesParams)
        {
            var likes = context.Likes.AsQueryable();

            IQueryable<MemberDto> query;

            switch (likesParams.Predicate)
            {
                case "liked":
                    query = likes
                        .Where(x => x.SourceUserId == likesParams.UserId)
                        .Select(x => x.TargetUser) // Select the full TargetUser entity, not just the ID
                        .ProjectTo<MemberDto>(mapper.ConfigurationProvider);
                    break;

                case "likedBy":
                    query= likes
                        .Where(x => x.TargetUserId == likesParams.UserId)
                        .Select(x => x.SourceUser) // Select the full SourceUser entity
                        .ProjectTo<MemberDto>(mapper.ConfigurationProvider);
                    break;

                default:
                    var likeIds = await GetCurrentUserLikesIds(likesParams.UserId);
                    query = likes
                        .Where(x => x.TargetUserId == likesParams.UserId && likeIds.Contains(x.SourceUserId))
                        .Select(x => x.SourceUser) // Select the full SourceUser entity
                        .ProjectTo<MemberDto>(mapper.ConfigurationProvider);
                        
                       break;
            }

            return await PagedList<MemberDto>.CreateAsync(query, likesParams.PageNumber, likesParams.PageSize);
        }


    }
}
