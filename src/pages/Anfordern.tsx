import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { PropertyDetailsStep } from "@/components/wizard/PropertyDetailsStep";
import { ContactDetailsStep } from "@/components/wizard/ContactDetailsStep";
import { CheckoutStep } from "@/components/wizard/CheckoutStep";
import { ThankYouStep } from "@/components/wizard/ThankYouStep";
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

      {/* Main Content */}
      <section className="py-6 md:py-10 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Progress Bar */}
            <div className="bg-card rounded-lg border shadow-sm p-4 md:p-6 mb-6">
              <div className="flex items-center justify-between">
                {steps.map((s, index) => (
                  <div key={s.num} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <button
                        onClick={() => {
                          if (s.num < step) setStep(s.num);
                        }}
                        disabled={s.num > step}
                        className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full text-sm font-semibold transition-all ${
                          s.num === step
                            ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                            : s.num < step
                            ? "bg-primary text-primary-foreground cursor-pointer hover:ring-2 hover:ring-primary/30"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {s.num < step ? "✓" : s.num}
                      </button>
                      <span
                        className={`mt-2 text-xs md:text-sm font-medium text-center ${
                          s.num === step
                            ? "text-primary"
                            : s.num < step
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-1 flex-1 mx-2 rounded-full transition-colors ${
                          s.num < step ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
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
      </section>
    </Layout>
  );
}
