using Microsoft.AspNetCore.Mvc;

namespace API.Contollers;

[ServiceFilter(typeof(LogUserActivity))]
[ApiController]
[Route("api/[controller]")] // api/users
public class BaseApiController : ControllerBase
{

}
