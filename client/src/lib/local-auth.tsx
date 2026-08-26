import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { signInWithGoogle, signInWithApple } from "@/lib/firebase";
import type { User as SchemaUser } from "@shared/schema";

// The server strips `password` before sending a user to the client
// (see the `authMiddleware`/login/register handlers in server/routes.ts).
type User = Omit<SchemaUser, "password">;

// Auth context type
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
};

// Registration data
type RegisterData = {
  username: string;
  password: string;
  email: string;
  fullName: string;
  isArtist?: boolean;
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  login: async () => {},
  loginWithGoogle: async () => {},
  loginWithApple: async () => {},
  register: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check authentication status on component mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Function to check if user is logged in
  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("GET", "/api/users/me");
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth check error:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (username: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/users/login", { username, password });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setLocation("/");
        toast({
          title: "Login successful",
          description: `Welcome back, ${userData.fullName || userData.username}!`,
        });
      } else {
        const data = await response.json();
        setError(data.message || "Invalid username or password");
        toast({
          variant: "destructive",
          title: "Login failed",
          description: data.message || "Invalid username or password",
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
      toast({
        variant: "destructive",
        title: "Login error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Shared flow for Firebase-backed social sign-in (Google, Apple, ...): run the
  // provider's popup, then exchange the Firebase user for our own session cookie.
  const loginWithFirebaseProvider = async (
    providerName: string,
    signIn: () => Promise<{ user: { email: string | null; uid: string; displayName: string | null; photoURL: string | null } }>
  ) => {
    setError(null);
    setIsLoading(true);
    try {
      const credential = await signIn();
      const firebaseUser = credential.user;

      const response = await apiRequest("POST", "/api/users/firebase-auth", {
        email: firebaseUser.email,
        firebaseUid: firebaseUser.uid,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setLocation("/");
        toast({
          title: "Login successful",
          description: `Welcome, ${userData.fullName || userData.username}!`,
        });
      } else {
        const data = await response.json();
        setError(data.message || `${providerName} sign-in failed`);
        toast({
          variant: "destructive",
          title: `${providerName} sign-in failed`,
          description: data.message || "Please try again.",
        });
      }
    } catch (err) {
      console.error(`${providerName} sign-in error:`, err);
      const message = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setError(message);
      toast({
        variant: "destructive",
        title: `${providerName} sign-in error`,
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = () => loginWithFirebaseProvider("Google", signInWithGoogle);
  const loginWithApple = () => loginWithFirebaseProvider("Apple", signInWithApple);

  // Register function
  const register = async (userData: RegisterData) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/users/register", userData);
      
      if (response.ok) {
        const newUser = await response.json();
        setUser(newUser);
        setLocation("/");
        toast({
          title: "Registration successful",
          description: `Welcome to EXPOSurE.ART, ${newUser.fullName || newUser.username}!`,
        });
      } else {
        const data = await response.json();
        setError(data.message || "Registration failed. Please try again.");
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: data.message || "Registration failed. Please try again.",
        });
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred. Please try again.");
      toast({
        variant: "destructive",
        title: "Registration error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setError(null);
    try {
      const response = await apiRequest("POST", "/api/users/logout");
      
      if (response.ok) {
        setUser(null);
        setLocation("/login");
        toast({
          title: "Logout successful",
          description: "You have been logged out successfully.",
        });
      } else {
        const data = await response.json();
        toast({
          variant: "destructive",
          title: "Logout failed",
          description: data.message || "Logout failed. Please try again.",
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
      toast({
        variant: "destructive",
        title: "Logout error",
        description: "An unexpected error occurred. Please try again.",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        loginWithGoogle,
        loginWithApple,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);