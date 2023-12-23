﻿using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class DataContext : DbContext
{
    public DataContext(DbContextOptions dbContextOptions) : base(dbContextOptions)
    {

    }

    public DbSet<AppUser> Users { get; set; }
}
