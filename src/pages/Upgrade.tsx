import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, ArrowLeft, Zap, Globe, Shield, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Upgrade() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");

  const handleUpgrade = (plan: string) => {
    setIsDialogOpen(true);
  };

  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length < 10) {
      toast.error("Please enter a valid mobile number.");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const token = localStorage.getItem("token");
      
      // Call the Spring Boot backend API via Vite proxy
      const response = await fetch("/api/upgrade-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          mobileNumber,
          plan: "Pro",
          billingCycle
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit request");
      }

      // Check if the response is actually JSON (optional, but good practice)
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn("Response was not JSON, but request succeeded.");
      }

      toast.success(`Request received! We'll contact you at ${mobileNumber} shortly to activate your Pro plan.`);
      setIsDialogOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Error submitting upgrade request:", error);
      toast.error("Failed to submit request. Please try again later.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to App
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-gold shadow-glow flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-xl font-display tracking-tight text-foreground font-bold">
              LawBoard Pro
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-law-gold/20 text-accent hover:bg-law-gold/30 border-law-gold/50">
            Unlock Advanced Legal AI
          </Badge>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Choose the right plan for your needs
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get access to multi-country legal databases, deep search capabilities, and professional document drafting tools.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <button 
              onClick={() => setBillingCycle(prev => prev === "monthly" ? "yearly" : "monthly")}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${billingCycle === "yearly" ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <span className={`text-sm font-medium flex items-center gap-1.5 ${billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"}`}>
              Yearly <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Save 20%</Badge>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="p-8 border-border flex flex-col relative overflow-hidden">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Basic</h3>
              <p className="text-muted-foreground text-sm">Essential tools for personal legal queries.</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Basic AI Chat Assistant</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Single Country Access (India)</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Standard Search</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <X className="w-5 h-5 text-muted-foreground/50 shrink-0" />
                <span>Deep Search (Multi-level database)</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <X className="w-5 h-5 text-muted-foreground/50 shrink-0" />
                <span>Global Jurisdictions (US, UK, etc.)</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <X className="w-5 h-5 text-muted-foreground/50 shrink-0" />
                <span>Advanced Document Generation</span>
              </li>
            </ul>

            <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
              Current Plan
            </Button>
          </Card>

          {/* Pro Plan */}
          <Card className="p-8 border-accent/50 shadow-[0_0_40px_hsl(43,96%,56%,0.15)] bg-card relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 bg-accent text-primary text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
              Most Popular
            </div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2 text-accent">Pro</h3>
              <p className="text-muted-foreground text-sm">Advanced features for legal professionals.</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold">{billingCycle === "monthly" ? "$29" : "$24"}</span>
              <span className="text-muted-foreground">/month</span>
              {billingCycle === "yearly" && <div className="text-xs text-emerald-500 mt-1">Billed $288 annually</div>}
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-accent shrink-0" />
                <span className="font-medium">Everything in Basic, plus:</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Zap className="w-5 h-5 text-accent shrink-0" />
                <span><strong>Deep Search</strong> (Local + Cloud + Kanoon)</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Globe className="w-5 h-5 text-accent shrink-0" />
                <span><strong>All Countries</strong> (US, UK, China, Russia, Japan)</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <FileText className="w-5 h-5 text-accent shrink-0" />
                <span>Unlimited Document Scanning & Generation</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Shield className="w-5 h-5 text-accent shrink-0" />
                <span>Priority AI Processing</span>
              </li>
            </ul>

            <Button 
              className="w-full bg-accent text-primary hover:bg-accent/90 font-bold text-md h-12"
              onClick={() => handleUpgrade("Pro")}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Upgrade to Pro"}
            </Button>
          </Card>
        </div>
      </main>

      {/* Mobile Number Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade to Pro</DialogTitle>
            <DialogDescription>
              Enter your mobile number to request an upgrade. Our team will contact you shortly to activate your Pro plan.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMobileSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="Enter your 10-digit number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
