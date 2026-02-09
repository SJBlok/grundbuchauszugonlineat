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
import { ArrowLeft, Mail, Building2, ChevronRight, MapPin } from "lucide-react";
import type { PropertyData, ApplicantData } from "@/pages/Anfordern";

const applicantSchema = z.object({
  vorname: z.string().min(1, "Vorname ist erforderlich").max(50),
  nachname: z.string().min(1, "Nachname ist erforderlich").max(50),
  email: z.string().email("Ungültige E-Mail-Adresse").max(100),
  wohnsitzland: z.string().min(1, "Wohnsitzland ist erforderlich"),
  firma: z.string().max(100).optional(),
});

const countries = [
  "Österreich",
  "Deutschland",
  "Schweiz",
  "Liechtenstein",
  "Italien",
  "Slowenien",
  "Ungarn",
  "Slowakei",
  "Tschechien",
  "Andere",
];

interface ContactDetailsStepProps {
  propertyData: PropertyData;
  initialData: ApplicantData;
  onSubmit: (data: ApplicantData) => void;
  onBack: () => void;
}

export function ContactDetailsStep({
  propertyData,
  initialData,
  onSubmit,
  onBack,
}: ContactDetailsStepProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ApplicantData>({
    resolver: zodResolver(applicantSchema),
    defaultValues: initialData,
  });

  const wohnsitzland = watch("wohnsitzland");

  return (
    <div className="space-y-6">
      {/* Selected Property Card */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="px-4 md:px-6 py-4 border-b bg-muted/30">
          <h2 className="text-lg md:text-xl font-semibold text-foreground">Ihr gewähltes Dokument</h2>
        </div>
        
        <div className="p-4 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground">Aktueller Grundbuchauszug</p>
                <p className="text-sm text-muted-foreground mt-1">
                  KG {propertyData.katastralgemeinde}, EZ/GST {propertyData.grundstuecksnummer}
                </p>
                <p className="text-sm text-muted-foreground">
                  {propertyData.bundesland} • {propertyData.grundbuchsgericht}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-foreground">€29,95</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Details Card */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="px-4 md:px-6 py-4 border-b bg-muted/30">
          <h2 className="text-lg md:text-xl font-semibold text-foreground">Kontaktdaten</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Geben Sie Ihre Daten für die Zustellung des Grundbuchauszugs ein.
          </p>
        </div>

        <div className="p-4 md:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vorname" className="text-sm font-medium">
                  Vorname <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="vorname" 
                  {...register("vorname")} 
                  placeholder="Max"
                  className="h-11 md:h-12 bg-background"
                />
                {errors.vorname && (
                  <p className="text-sm text-destructive">{errors.vorname.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nachname" className="text-sm font-medium">
                  Nachname <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="nachname" 
                  {...register("nachname")} 
                  placeholder="Mustermann"
                  className="h-11 md:h-12 bg-background"
                />
                {errors.nachname && (
                  <p className="text-sm text-destructive">{errors.nachname.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                E-Mail-Adresse <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  {...register("email")} 
                  placeholder="max.mustermann@email.at"
                  className="h-11 md:h-12 pl-10 bg-background"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Der Grundbuchauszug wird an diese Adresse versendet
              </p>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wohnsitzland" className="text-sm font-medium">
                  Wohnsitzland <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={wohnsitzland}
                  onValueChange={(value) =>
                    setValue("wohnsitzland", value, { shouldValidate: true })
                  }
                >
                  <SelectTrigger className="h-11 md:h-12 bg-background">
                    <SelectValue placeholder="Auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.wohnsitzland && (
                  <p className="text-sm text-destructive">{errors.wohnsitzland.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="firma" className="text-sm font-medium text-muted-foreground">
                  Firma <span className="text-xs font-normal">(optional)</span>
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="firma" 
                    {...register("firma")} 
                    placeholder="Firmenname"
                    className="h-11 md:h-12 pl-10 bg-background"
                  />
                </div>
                {errors.firma && (
                  <p className="text-sm text-destructive">{errors.firma.message}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <Button 
                type="button"
                variant="outline"
                onClick={onBack}
                className="h-11 md:h-12"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-12 md:h-14 text-base md:text-lg font-bold shadow-lg hover:shadow-xl transition-all" 
                size="lg"
              >
                Weiter zur Übersicht
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
