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
import { KatastralgemeindeCombobox } from "@/components/KatastralgemeindeCombobox";
import type { PropertyData } from "@/pages/Anfordern";

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

interface PropertyDetailsStepProps {
  initialData: PropertyData;
  onSubmit: (data: PropertyData) => void;
}

export function PropertyDetailsStep({ initialData, onSubmit }: PropertyDetailsStepProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PropertyData>({
    resolver: zodResolver(propertySchema),
    defaultValues: initialData,
  });

  const bundesland = watch("bundesland");
  const katastralgemeinde = watch("katastralgemeinde");

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
        Grundstücksdaten eingeben
      </h1>
      <p className="text-muted-foreground mb-8">
        Geben Sie die Daten des Grundstücks ein, für das Sie einen Grundbuchauszug anfordern möchten.
      </p>

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
    </div>
  );
}
