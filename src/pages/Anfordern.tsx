import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { PropertyDetailsStep } from "@/components/wizard/PropertyDetailsStep";
import { ContactDetailsStep } from "@/components/wizard/ContactDetailsStep";
import { CheckoutStep } from "@/components/wizard/CheckoutStep";
import { ThankYouStep } from "@/components/wizard/ThankYouStep";
import { ChevronRight } from "lucide-react";
import heroImage from "@/assets/hero-austria.jpg";

export interface PropertyData {
  katastralgemeinde: string;
  grundstuecksnummer: string;
  grundbuchsgericht: string;
  bundesland: string;
  wohnungsHinweis: string;
}

export interface ApplicantData {
  vorname: string;
  nachname: string;
  email: string;
  wohnsitzland: string;
  firma: string;
}

export interface OrderData {
  orderNumber: string;
}

const steps = [
  { num: 1, label: "Grundstück" },
  { num: 2, label: "Kontaktdaten" },
  { num: 3, label: "Übersicht" },
];

export default function Anfordern() {
  const [step, setStep] = useState(1);
  const [propertyData, setPropertyData] = useState<PropertyData>({
    katastralgemeinde: "",
    grundstuecksnummer: "",
    grundbuchsgericht: "",
    bundesland: "",
    wohnungsHinweis: "",
  });
  const [applicantData, setApplicantData] = useState<ApplicantData>({
    vorname: "",
    nachname: "",
    email: "",
    wohnsitzland: "Österreich",
    firma: "",
  });
  const [orderData, setOrderData] = useState<OrderData>({
    orderNumber: "",
  });

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handlePropertySubmit = (data: PropertyData) => {
    setPropertyData(data);
    setStep(2);
  };

  const handleContactSubmit = (data: ApplicantData) => {
    setApplicantData(data);
    setStep(3);
  };

  const handlePaymentSubmit = (orderNumber: string) => {
    setOrderData({ orderNumber });
    setStep(4);
  };

  // Thank you step has its own full-width layout
  if (step === 4) {
    return (
      <Layout>
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <ThankYouStep
                orderNumber={orderData.orderNumber}
                email={applicantData.email}
              />
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Banner */}
      <div className="relative h-48 md:h-56 overflow-hidden">
        <img
          src={heroImage}
          alt="Österreichische Landschaft"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-header/90 via-header/70 to-header/50" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-3">
                Offiziellen Grundbuchauszug anfordern
              </h1>
              <p className="text-white/90 text-sm md:text-base max-w-2xl">
                Erhalten Sie Ihren aktuellen Grundbuchauszug aus dem österreichischen Grundbuch 
                – digital, schnell und sicher per E-Mail.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar Layout */}
      <section className="py-6 md:py-10 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-6xl mx-auto">
            {/* Left Sidebar - Step Navigation */}
            <div className="lg:w-64 shrink-0">
              <div className="bg-card rounded-lg border shadow-sm overflow-hidden lg:sticky lg:top-24">
                {steps.map((s, index) => (
                  <button
                    key={s.num}
                    onClick={() => {
                      // Only allow going back to completed steps
                      if (s.num < step) {
                        setStep(s.num);
                      }
                    }}
                    disabled={s.num > step}
                    className={`w-full flex items-center justify-between px-4 py-4 text-left border-b last:border-b-0 transition-colors ${
                      s.num === step
                        ? "bg-primary/5 border-l-4 border-l-primary"
                        : s.num < step
                        ? "hover:bg-muted/50 cursor-pointer border-l-4 border-l-primary/30"
                        : "text-muted-foreground border-l-4 border-l-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold ${
                          s.num === step
                            ? "bg-primary text-primary-foreground"
                            : s.num < step
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {s.num < step ? "✓" : s.num}
                      </span>
                      <span
                        className={`font-medium ${
                          s.num === step
                            ? "text-foreground"
                            : s.num < step
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 ${
                        s.num === step
                          ? "text-primary"
                          : s.num < step
                          ? "text-muted-foreground"
                          : "text-muted-foreground/50"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 min-w-0">
              {step === 1 && (
                <PropertyDetailsStep
                  initialData={propertyData}
                  onSubmit={handlePropertySubmit}
                />
              )}

              {step === 2 && (
                <ContactDetailsStep
                  propertyData={propertyData}
                  initialData={applicantData}
                  onSubmit={handleContactSubmit}
                  onBack={() => setStep(1)}
                />
              )}

              {step === 3 && (
                <CheckoutStep
                  propertyData={propertyData}
                  applicantData={applicantData}
                  onSubmit={handlePaymentSubmit}
                  onBack={() => setStep(2)}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
