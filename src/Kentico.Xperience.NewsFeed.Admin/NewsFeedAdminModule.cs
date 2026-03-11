using Kentico.Xperience.Admin.Base;
using Kentico.Xperience.NewsFeed.Admin;

[assembly: CMS.RegisterModule(typeof(NewsFeedAdminModule))]

namespace Kentico.Xperience.NewsFeed.Admin
{
    public class NewsFeedAdminModule : AdminModule
    {
        public NewsFeedAdminModule()
            : base("Kentico.Xperience.NewsFeed.Admin")
        {
        }

        protected override void OnInit()
        {
            base.OnInit();

            // Makes the module accessible to the admin UI
            RegisterClientModule("kentico", "xperience-integrations-news-feed-web-admin");
        }
    }
}
