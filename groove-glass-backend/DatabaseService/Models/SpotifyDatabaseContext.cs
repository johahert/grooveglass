using DatabaseService.Models.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DatabaseService.Models
{
    public class SpotifyDatabaseContext : DbContext
    {
        public SpotifyDatabaseContext(DbContextOptions options) : base(options)
        {
        }

        protected SpotifyDatabaseContext()
        {
        }

        public DbSet<SpotifyUser> Users { get; set; }
    }
}
