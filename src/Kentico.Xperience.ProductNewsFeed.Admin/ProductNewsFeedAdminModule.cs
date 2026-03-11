using Kentico.Xperience.Admin.Base;
using Kentico.Xperience.ProductNewsFeed.Admin;

[assembly: CMS.RegisterModule(typeof(ProductNewsFeedAdminModule))]

namespace Kentico.Xperience.ProductNewsFeed.Admin
{
    public class ProductNewsFeedAdminModule : AdminModule
    {
        public ProductNewsFeedAdminModule()
            : base("Kentico.Xperience.ProductNewsFeed.Admin")
        {
        }

        protected override void OnInit()
        {
            base.OnInit();

            // Makes the module accessible to the admin UI
            RegisterClientModule("kentico", "xperience-integrations-product-news-feed-web-admin");
        }
    }
}
