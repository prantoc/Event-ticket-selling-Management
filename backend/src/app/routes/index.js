const router = require("express").Router();
const authRoutes = require("../modules/Auth/auth.routes");
const userRoutes = require("../modules/User/user.routes");
const organizerRoutes = require("../modules/Organizer/organizer.routes");
const eventRoutes = require("../modules/Event/event.routes");
const categoryRoutes = require("../modules/Category/category.routes");
const bookingRoutes = require("../modules/Booking/booking.route");
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
    path: "/bookings",
    route: bookingRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

module.exports = router;
