﻿using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc.Filters;

namespace API;

public class LogUserActivity : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var resultContext = await next();

        if (!resultContext.HttpContext.User.Identity.IsAuthenticated) return;

        var userId = resultContext.HttpContext.User.GetUserIdAsInt();
        var userRepository = resultContext.HttpContext.RequestServices.GetService<IUserRepository>();
        var user = await userRepository.GetUserByIdAsync(userId);

        user.LastActive = DateTime.UtcNow;

        await userRepository.SaveAllAsync();
    }
}
