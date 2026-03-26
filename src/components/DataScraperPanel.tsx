import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Download, Search, Database, AlertCircle } from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";

interface ScrapedSection {
  section: string;
  title: string;
  content: string;
  keywords: string[];
  category: string;
  source?: string;
}

export const DataScraperPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrapedData, setScrapedData] = useState<ScrapedSection[]>([]);
  const { toast } = useToast();

  const fetchLegalData = async (query: string, isQuickScrape: boolean) => {
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      
      const prompt = isQuickScrape 
        ? "Provide detailed information about the top 10 most common criminal sections in Indian Law (IPC/BNS). Include section number, title, detailed content, keywords, and category."
        : `Provide detailed legal information about the following search query in Indian Law: "${query}". Include relevant section numbers, titles, detailed content, keywords, and category. Return up to 5 relevant sections.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                section: { type: Type.STRING, description: "The legal section number (e.g., Section 420 IPC)" },
                title: { type: Type.STRING, description: "The title of the section" },
                content: { type: Type.STRING, description: "The detailed legal text or explanation" },
                keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Relevant keywords" },
                category: { type: Type.STRING, description: "Category of law (e.g., Criminal, Civil, Corporate)" },
                source: { type: Type.STRING, description: "Source of the law (e.g., Indian Penal Code)" }
              },
              required: ["section", "title", "content", "keywords", "category"]
            }
          }
        }
      });

      const jsonStr = response.text?.trim() || "[]";
      const sections = JSON.parse(jsonStr) as ScrapedSection[];
      
      return { success: true, sections };
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  };

  const handleQuickScrape = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLegalData("", true);

      if (data?.success && data?.sections) {
        setScrapedData(data.sections);
        toast({
          title: "Scraping Complete",
          description: `Successfully retrieved ${data.sections.length} legal sections.`,
        });
      }
    } catch (error) {
      console.error('Scraping error:', error);
      toast({
        title: "Scraping Failed",
        description: error instanceof Error ? error.message : "Failed to retrieve legal data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomScrape = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchLegalData(searchQuery, false);

      if (data?.success && data?.sections) {
        setScrapedData(prev => [...prev, ...data.sections]);
        toast({
          title: "Search Complete",
          description: `Found ${data.sections.length} sections for "${searchQuery}"`,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "Failed to search legal data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAsJSON = () => {
    const dataStr = JSON.stringify(scrapedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `legal-corpus-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Legal corpus saved as JSON file",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Legal Data Scraper
        </CardTitle>
        <CardDescription>
          Scrape and expand your legal knowledge base from India Code and Indian Kanoon
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Web scraping may take a few moments. Rate limits apply to avoid overwhelming source websites.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleQuickScrape}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? "Scraping..." : "Quick Scrape (Top 10 Criminal Sections)"}
          </Button>

          <div className="flex gap-2">
            <Input
              placeholder="Search for specific law (e.g., 'section 420', 'dowry law')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomScrape()}
            />
            <Button onClick={handleCustomScrape} disabled={isLoading || !searchQuery.trim()}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {scrapedData.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                Scraped Sections: <Badge variant="secondary">{scrapedData.length}</Badge>
              </p>
              <Button variant="outline" size="sm" onClick={downloadAsJSON}>
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
            </div>

            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <div className="space-y-4">
                {scrapedData.map((section, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-sm">{section.section}</h4>
                        <Badge variant="outline" className="text-xs">
                          {section.category}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">{section.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-3">{section.content}</p>
                      <div className="flex flex-wrap gap-1">
                        {section.keywords.map((kw, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                      {section.source && (
                        <p className="text-xs text-muted-foreground italic">Source: {section.source}</p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
};
