const AUTH_TOKEN_KEY = "bearer_token" 

export const setAuthToken = (token: string): boolean => {
    try {
      if (typeof window === "undefined") {
        return false
      }
  
      localStorage.setItem(AUTH_TOKEN_KEY, token)
      return true
    } catch (error) {
      console.error("Failed to store auth token:", error)
      return false
    }
  }