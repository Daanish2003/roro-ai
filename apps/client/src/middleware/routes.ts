export const AuthRoutes = [
    '/auth/login',
];

export const PublicRoutes = [
    '/'
]

export const ProtectedRoutes = [
    '/practice',
    '/history',
    '/feedback',
    '/settings',
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

