import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, ChevronDown, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export type Country = "india" | "usa" | "russia" | "china" | "japan" | "uk";

interface CountryInfo {
  id: Country;
  name: string;
  flag: string;
  lawSystem: string;
  isPremium?: boolean;
}

export const countries: CountryInfo[] = [
  { id: "india", name: "India", flag: "🇮🇳", lawSystem: "IPC • CrPC • Constitution" },
  { id: "usa", name: "United States", flag: "🇺🇸", lawSystem: "US Code • State Laws", isPremium: true },
  { id: "russia", name: "Russia", flag: "🇷🇺", lawSystem: "Criminal Code • Civil Code", isPremium: true },
  { id: "china", name: "China", flag: "🇨🇳", lawSystem: "Criminal Law • Civil Code", isPremium: true },
  { id: "japan", name: "Japan", flag: "🇯🇵", lawSystem: "Penal Code • Civil Code", isPremium: true },
  { id: "uk", name: "United Kingdom", flag: "🇬🇧", lawSystem: "Common Law • Statutory Law", isPremium: true },
];

interface CountrySelectorProps {
  selectedCountry: Country;
  onCountryChange: (country: Country) => void;
}

export const CountrySelector = ({ selectedCountry, onCountryChange }: CountrySelectorProps) => {
  const current = countries.find(c => c.id === selectedCountry) || countries[0];
  const navigate = useNavigate();

  const handleSelect = (country: CountryInfo) => {
    if (country.isPremium) {
      toast.error(`Access to ${country.name} laws requires a Pro plan.`);
      navigate("/upgrade");
      return;
    }
    onCountryChange(country.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 font-semibold">
          <Globe className="w-4 h-4" />
          <span className="text-lg">{current.flag}</span>
          <span className="hidden sm:inline">{current.name}</span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {countries.map((country) => (
          <DropdownMenuItem
            key={country.id}
            onClick={() => handleSelect(country)}
            className="flex items-center gap-3 cursor-pointer justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{country.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{country.name}</span>
                <span className="text-xs text-muted-foreground">{country.lawSystem}</span>
              </div>
            </div>
            {country.isPremium && (
              <Lock className="w-3.5 h-3.5 text-muted-foreground/50" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
