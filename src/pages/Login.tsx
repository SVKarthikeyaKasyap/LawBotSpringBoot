import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      // Check if the response is actually JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Cannot connect to the Spring Boot backend. Make sure it is running on localhost:8080.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      if (isLogin) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        toast.success("Logged in successfully!");
        navigate("/");
      } else {
        toast.success("Registration successful! Please log in.");
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-accent/20 shadow-[0_0_40px_hsl(43,96%,56%,0.05)]">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl gradient-gold shadow-glow flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-display font-bold">
            {isLogin ? "Welcome back" : "Create an account"}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? "Enter your credentials to access your account" 
              : "Enter your details to create a new account"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                type="text" 
                placeholder="johndoe" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-accent text-primary hover:bg-accent/90" disabled={isLoading}>
              {isLoading ? "Processing..." : (isLogin ? "Sign In" : "Sign Up")}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-accent hover:underline font-medium"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
