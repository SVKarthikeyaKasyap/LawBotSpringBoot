import { Scale, Zap, LogIn, LogOut } from "lucide-react";
import { RoleSwitcher, UserRole } from "./RoleSwitcher";
import { CountrySelector, Country, countries } from "./CountrySelector";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface HeaderProps {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  country: Country;
  onCountryChange: (country: Country) => void;
}

export const Header = ({ role, onRoleChange, country, onCountryChange }: HeaderProps) => {
  const currentCountry = countries.find(c => c.id === country) || countries[0];
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("username");
    if (token && user) {
      setIsLoggedIn(true);
      setUsername(user);
    }
  }, []);

  const handleAuthAction = () => {
    if (isLoggedIn) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      setIsLoggedIn(false);
      setUsername("");
    } else {
      navigate("/login");
    }
  };
  
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-12 h-12 rounded-xl gradient-gold shadow-glow flex items-center justify-center">
              <Scale className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display tracking-tight text-foreground">
                LawBoard
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                AI Legal Assistant • {currentCountry.flag} {currentCountry.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-3 py-1.5 rounded-full bg-law-gold-light text-accent font-bold uppercase tracking-wide">
                {currentCountry.lawSystem}
              </span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/upgrade")}
              className="hidden md:flex gap-1.5 border-accent/50 text-accent hover:bg-accent/10"
            >
              <Zap className="w-3.5 h-3.5" />
              Upgrade Plan
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleAuthAction}
              className="hidden md:flex gap-1.5"
            >
              {isLoggedIn ? (
                <>
                  <LogOut className="w-4 h-4" />
                  Logout ({username})
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Login
                </>
              )}
            </Button>

            <CountrySelector selectedCountry={country} onCountryChange={onCountryChange} />
            <RoleSwitcher role={role} onRoleChange={onRoleChange} />
          </div>
        </div>
      </div>
    </header>
  );
};
