const router = require("express").Router();
const authRoutes = require("../modules/Auth/auth.routes");
const userRoutes = require("../modules/User/user.routes");
const organizerRoutes = require("../modules/Organizer/organizer.routes");
const eventRoutes = require("../modules/Event/event.routes");
const categoryRoutes = require("../modules/Category/category.routes");
const blogCategoryRoutes = require("../modules/BlogCategory/blogCategory.routes");
const bookingRoutes = require("../modules/Booking/booking.route");
const settingRoutes = require("../modules/Settings/settings.route");
const faqRoutes = require("../modules/Faq/faq.route");
const paymentRoutes = require("../modules/Payments/payment.routes");
const payoutRoutes = require("../modules/Payout/payout.routes");
const newsletterRoutes = require("../modules/Newsletter/newsletter.route");
const addressRoutes = require("../modules/Address/address.route");
const { path } = require("../../app");
const moduleRoutes = [
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/organizers",
    route: organizerRoutes,
  },
  {
    path: "/events",
    route: eventRoutes,
  },
  {
    path: "/categories",
    route: categoryRoutes,
  },
  {
    path: "/blog-categories",
    route: blogCategoryRoutes,
  },
  {
    path: "/bookings",
    route: bookingRoutes,
  },
  {
    path: "/settings",
    route: settingRoutes,
  },
  {
    path: "/faq",
    route: faqRoutes,
  },
  {
    path: "/payments",
    route: paymentRoutes,
  },
  {
    path: "/payouts",
    route: payoutRoutes,
  },
  {
    path: "/newsletter",
    route: newsletterRoutes,
  },
  {
    path: "/address",
    route: addressRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

module.exports = router;
