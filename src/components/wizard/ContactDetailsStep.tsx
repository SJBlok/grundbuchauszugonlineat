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
import { ArrowLeft, User, Mail, Building2, MapPin, ChevronRight, Shield, FileText } from "lucide-react";
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
    <div className="max-w-3xl mx-auto">
      {/* Official Header Bar */}
      <div className="bg-primary text-primary-foreground px-6 py-3 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-primary-foreground/20 flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Grundbuchauszug Online</h1>
              <p className="text-primary-foreground/80 text-xs">Offizieller Grundbuchauszug – Österreich</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-card border-2 border-t-0 border-border rounded-b-lg shadow-xl">
        {/* Step Indicator */}
        <div className="bg-muted/50 px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
              2
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Kontaktdaten eingeben</h2>
              <p className="text-sm text-muted-foreground">Für die Zustellung des Grundbuchauszugs</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Property Summary */}
          <div className="bg-muted/30 border rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">Ausgewähltes Grundstück</p>
                <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                  <p>KG: {propertyData.katastralgemeinde}</p>
                  <p>EZ/GST: {propertyData.grundstuecksnummer}</p>
                  <p>{propertyData.bundesland}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onBack}
                className="shrink-0"
              >
                Ändern
              </Button>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vorname" className="text-sm font-medium">
                  Vorname <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="vorname" 
                  {...register("vorname")} 
                  placeholder="Max"
                  className="h-12 bg-background"
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
                  className="h-12 bg-background"
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
                  className="h-12 pl-10 bg-background"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Der Grundbuchauszug wird an diese Adresse versendet
              </p>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
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
                  <SelectTrigger className="h-12 bg-background">
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
                    className="h-12 pl-10 bg-background"
                  />
                </div>
                {errors.firma && (
                  <p className="text-sm text-destructive">{errors.firma.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all" 
              size="lg"
            >
              Weiter zur Zahlung
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-muted/30 px-6 py-4 border-t">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>Ihre Daten werden verschlüsselt übertragen</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
