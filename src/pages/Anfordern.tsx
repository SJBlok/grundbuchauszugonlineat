import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { PropertyDetailsStep } from "@/components/wizard/PropertyDetailsStep";
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
  adresse: string;
  plz: string;
  ort: string;
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
  { num: 2, label: "Bestellen" },
];

export default function Anfordern() {
  const [step, setStep] = useState(1);
  const [propertyData, setPropertyData] = useState<PropertyData>({
    katastralgemeinde: "",
    grundstuecksnummer: "",
    grundbuchsgericht: "",
    bundesland: "",
    wohnungsHinweis: "",
    adresse: "",
    plz: "",
    ort: "",
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

  const handlePaymentSubmit = (orderNumber: string) => {
    setOrderData({ orderNumber });
    setStep(3);
  };

  // Thank you step has its own full-width layout
  if (step === 3) {
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
      {/* Premium background */}
      <section className="min-h-[calc(100vh-200px)] bg-gradient-to-b from-background via-muted/30 to-background py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {step === 1 && (
              <PropertyDetailsStep
                initialData={propertyData}
                onSubmit={handlePropertySubmit}
              />
            )}

            {step === 2 && (
              <CheckoutStep
                propertyData={propertyData}
                initialApplicantData={applicantData}
                onSubmit={handlePaymentSubmit}
                onBack={() => setStep(1)}
              />
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
