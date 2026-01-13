import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { PropertyDetailsStep } from "@/components/wizard/PropertyDetailsStep";
import { ContactDetailsStep } from "@/components/wizard/ContactDetailsStep";
import { CheckoutStep } from "@/components/wizard/CheckoutStep";
import { ThankYouStep } from "@/components/wizard/ThankYouStep";

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

  return (
    <Layout>
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Progress indicator - only show for steps 1-3 */}
            {step < 4 && (
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-2 md:space-x-4">
                  {[
                    { num: 1, label: "Grundstück" },
                    { num: 2, label: "Kontakt" },
                    { num: 3, label: "Zahlung" },
                  ].map((s, index) => (
                    <div key={s.num} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                            s.num === step
                              ? "bg-primary text-primary-foreground"
                              : s.num < step
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {s.num < step ? "✓" : s.num}
                        </div>
                        <span className={`text-xs mt-1 hidden sm:block ${
                          s.num === step ? "text-primary font-medium" : "text-muted-foreground"
                        }`}>
                          {s.label}
                        </span>
                      </div>
                      {index < 2 && (
                        <div
                          className={`w-8 md:w-12 h-0.5 mx-1 md:mx-2 ${
                            s.num < step ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            {step === 4 && (
              <ThankYouStep
                orderNumber={orderData.orderNumber}
                email={applicantData.email}
              />
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
