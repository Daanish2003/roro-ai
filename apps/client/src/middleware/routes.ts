export const AuthRoutes = [
    '/auth/login',
];

export const PublicRoutes = [
    '/'
]

export const ProtectedRoutes = [
    '/dashboard/practice',
    '/dashboard/overview',
    '/dashboard/achievements',
    '/dashboard/feedback',
    '/dashboard/leaderboard',
    '/dashboard/settings',
    '/dashboard/topics',
    '/dashboard/progress',
]

export function matchesProtectedRoute(path: string): boolean {
    return ProtectedRoutes.some(route => {
      if (route.includes(":")) {
        const baseRoute = route.split("/:")[0]; // Extract base path (e.g., "/room")
        return path.startsWith(baseRoute);
      }
      return path === route;
    });
  }

