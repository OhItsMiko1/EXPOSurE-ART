import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/local-auth";
import { loginFormSchema, LoginFormValues } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowLeft, User, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { login, loginWithGoogle, loginWithApple, isLoading } = useAuth();
  const { toast } = useToast();

  const onGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Google sign-in failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const onAppleSignIn = async () => {
    try {
      await loginWithApple();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Apple sign-in failed",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.username, values.password);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Invalid username or password. Please try again."
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-primary text-sm hover:underline">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to home
          </Link>
          
          <h2 className="mt-6 text-3xl font-bold text-gray-800 font-poppins">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-500">
            Or{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              create a new account
            </Link>
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input 
                        placeholder="Enter your username" 
                        className="pl-10" 
                        disabled={isLoading}
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input 
                        type="password" 
                        placeholder="Enter your password" 
                        className="pl-10" 
                        disabled={isLoading}
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <Button 
                type="submit" 
                className="w-full py-6" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
              
              <Button
                type="button"
                variant="link"
                className="w-full"
                asChild
              >
                <Link href="/forgot-password">
                  Forgot password?
                </Link>
              </Button>
            </div>
          </form>
        </Form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full mt-4"
            disabled={isLoading}
            onClick={onGoogleSignIn}
          >
            Continue with Google
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full mt-3"
            disabled={isLoading}
            onClick={onAppleSignIn}
          >
            Continue with Apple
          </Button>
        </div>
      </div>
    </div>
  );
}
