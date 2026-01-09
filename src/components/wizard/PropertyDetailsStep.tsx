import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddressSearch } from "@/components/AddressSearch";
import { KatastralgemeindeCombobox } from "@/components/KatastralgemeindeCombobox";
import type { PropertyData } from "@/pages/Anfordern";
import { Search, FileText } from "lucide-react";

const propertySchema = z.object({
  katastralgemeinde: z.string().min(1, "Katastralgemeinde ist erforderlich").max(100),
  grundstuecksnummer: z.string().min(1, "Grundstücksnummer ist erforderlich").max(50),
  grundbuchsgericht: z.string().min(1, "Grundbuchsgericht ist erforderlich").max(100),
  bundesland: z.string().min(1, "Bundesland ist erforderlich"),
  wohnungsHinweis: z.string().max(200).optional(),
});

const bundeslaender = [
  "Burgenland",
  "Kärnten",
  "Niederösterreich",
  "Oberösterreich",
  "Salzburg",
  "Steiermark",
  "Tirol",
  "Vorarlberg",
  "Wien",
];

interface AddressSearchResult {
  kgNummer: string;
  kgName: string;
  ez: string;
  gst: string;
  adresse: string;
  plz: string;
  ort: string;
  bundesland: string;
}

interface PropertyDetailsStepProps {
  initialData: PropertyData;
  onSubmit: (data: PropertyData) => void;
}

export function PropertyDetailsStep({ initialData, onSubmit }: PropertyDetailsStepProps) {
  const [activeTab, setActiveTab] = useState<string>("address");
  const [selectedFromSearch, setSelectedFromSearch] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<PropertyData>({
    resolver: zodResolver(propertySchema),
    defaultValues: initialData,
  });

  const bundesland = watch("bundesland");
  const katastralgemeinde = watch("katastralgemeinde");

  const handleAddressSelect = (result: AddressSearchResult) => {
    // Fill in the form with the selected result
    setValue("katastralgemeinde", result.kgName || result.kgNummer, { shouldValidate: true });
    setValue("grundstuecksnummer", result.gst || result.ez, { shouldValidate: true });
    setValue("bundesland", result.bundesland, { shouldValidate: true });
    
    // Auto-generate Grundbuchsgericht based on Bundesland
    const gerichtMap: Record<string, string> = {
      "Wien": "Bezirksgericht Innere Stadt Wien",
      "Niederösterreich": "Bezirksgericht " + (result.ort || ""),
      "Oberösterreich": "Bezirksgericht " + (result.ort || ""),
      "Salzburg": "Bezirksgericht " + (result.ort || "Salzburg"),
      "Tirol": "Bezirksgericht " + (result.ort || "Innsbruck"),
      "Vorarlberg": "Bezirksgericht " + (result.ort || "Feldkirch"),
      "Kärnten": "Bezirksgericht " + (result.ort || "Klagenfurt"),
      "Steiermark": "Bezirksgericht " + (result.ort || "Graz"),
      "Burgenland": "Bezirksgericht " + (result.ort || "Eisenstadt"),
    };
    setValue("grundbuchsgericht", gerichtMap[result.bundesland] || "", { shouldValidate: true });
    
    setSelectedFromSearch(true);
    setActiveTab("manual"); // Switch to manual tab to show/edit the filled data
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
        Grundstücksdaten eingeben
      </h1>
      <p className="text-muted-foreground mb-8">
        Suchen Sie nach einer Adresse oder geben Sie die Grundbuchdaten manuell ein.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="address" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Adresse suchen
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Manuelle Eingabe
          </TabsTrigger>
        </TabsList>

        <TabsContent value="address" className="space-y-4">
          <div className="bg-info p-4 rounded-lg mb-4">
            <p className="text-sm text-muted-foreground">
              <strong>Tipp:</strong> Geben Sie eine Adresse ein (z.B. "Ringstraße 1, 1010 Wien") um das zugehörige Grundstück zu finden. 
              Die Daten werden automatisch in das Formular übernommen.
            </p>
          </div>
          
          <AddressSearch onSelectResult={handleAddressSelect} />
          
          {selectedFromSearch && (
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
              <p className="text-sm text-primary font-medium">
                ✓ Grundstücksdaten wurden übernommen. Sie können diese im Tab "Manuelle Eingabe" überprüfen und anpassen.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="manual">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="bundesland">Bundesland *</Label>
              <Select
                value={bundesland}
                onValueChange={(value) => setValue("bundesland", value, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Bundesland auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {bundeslaender.map((land) => (
                    <SelectItem key={land} value={land}>
                      {land}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bundesland && (
                <p className="text-sm text-destructive">{errors.bundesland.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="katastralgemeinde">Katastralgemeinde *</Label>
              <KatastralgemeindeCombobox
                value={katastralgemeinde}
                onChange={(value) => setValue("katastralgemeinde", value, { shouldValidate: true })}
                bundesland={bundesland}
                placeholder="Katastralgemeinde suchen..."
              />
              {errors.katastralgemeinde && (
                <p className="text-sm text-destructive">{errors.katastralgemeinde.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="grundstuecksnummer">Grundstücksnummer *</Label>
              <Input
                id="grundstuecksnummer"
                {...register("grundstuecksnummer")}
                placeholder="z.B. 123/4"
              />
              {errors.grundstuecksnummer && (
                <p className="text-sm text-destructive">{errors.grundstuecksnummer.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="grundbuchsgericht">Grundbuchsgericht *</Label>
              <Input
                id="grundbuchsgericht"
                {...register("grundbuchsgericht")}
                placeholder="z.B. Bezirksgericht Innere Stadt Wien"
              />
              {errors.grundbuchsgericht && (
                <p className="text-sm text-destructive">{errors.grundbuchsgericht.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="wohnungsHinweis">Wohnungs- / Anteilshinweis (optional)</Label>
              <Input
                id="wohnungsHinweis"
                {...register("wohnungsHinweis")}
                placeholder="z.B. Top 5, Anteil 1/10"
              />
              {errors.wohnungsHinweis && (
                <p className="text-sm text-destructive">{errors.wohnungsHinweis.message}</p>
              )}
            </div>

            <div className="bg-info p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Hinweis:</strong> Genaue Angaben erleichtern die eindeutige Zuordnung im Grundbuch.
                Die Katastralgemeinde und Grundstücksnummer finden Sie auf Ihrem Grundbuchauszug oder im{" "}
                <a 
                  href="https://www.bev.gv.at/Services/Produkte/Kataster-und-Verzeichnisse/Katastralgemeindesuche.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  BEV-Katasterverzeichnis
                </a>.
              </p>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Weiter
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      {/* Show submit button when on address tab and data is selected */}
      {activeTab === "address" && selectedFromSearch && (
        <div className="mt-6">
          <Button 
            onClick={async () => {
              const isValid = await trigger();
              if (isValid) {
                handleSubmit(onSubmit)();
              } else {
                setActiveTab("manual");
              }
            }} 
            className="w-full" 
            size="lg"
          >
            Weiter
          </Button>
        </div>
      )}
    </div>
  );
}
