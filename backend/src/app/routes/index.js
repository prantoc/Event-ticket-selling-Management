const router = require('express').Router();
const authRoutes = require('../modules/Auth/auth.routes');
const userRoutes = require('../modules/User/user.routes');
const organizerRoutes = require('../modules/Organizer/organizer.routes');
const moduleRoutes = [
    {
        path: '/auth',
        route: authRoutes,
    },
    {
        path: '/users',
        route: userRoutes,
    },
    {
        path: '/organizers',
        route: organizerRoutes,
    }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

module.exports = router;
