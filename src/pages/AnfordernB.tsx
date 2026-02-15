import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { CombinedOrderStep } from "@/components/wizard/CombinedOrderStep";
import { GrundbuchIntroStep } from "@/components/wizard/GrundbuchIntroStep";

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
}

export interface OrderData {
  orderNumber: string;
  email: string;
  propertyInfo: string;
}

export default function AnfordernB() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // Start at 0 for intro step
  const [propertyData] = useState<PropertyData>({
    katastralgemeinde: "",
    grundstuecksnummer: "",
    grundbuchsgericht: "",
    bundesland: "",
    wohnungsHinweis: "",
    adresse: "",
    plz: "",
    ort: "",
  });
  const [applicantData] = useState<ApplicantData>({
    vorname: "",
    nachname: "",
    email: "",
  });

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleIntroComplete = () => {
    setStep(1);
  };

  const handleOrderSubmit = (orderNumber: string, email: string, propertyInfo: string, totalPrice?: string) => {
    // Navigate to confirmation page with order data
    const params = new URLSearchParams({
      order: orderNumber,
      email: email,
      property: propertyInfo,
      variant: "b",
      price: totalPrice || "28.90",
    });
    navigate(`/bestaetigung?${params.toString()}`);
  };

  // Intro step (step 0)
  if (step === 0) {
    return (
      <Layout compactHeader>
        <section className="min-h-[calc(100vh-200px)] bg-gradient-to-b from-background via-muted/30 to-background py-8 md:py-14 lg:py-16 pb-16 md:pb-24 lg:pb-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <GrundbuchIntroStep onContinue={handleIntroComplete} />
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  // Order form step (step 1)
  return (
    <Layout compactHeader>
      <section className="min-h-[calc(100vh-200px)] bg-gradient-to-b from-background via-muted/30 to-background py-8 md:py-14 lg:py-16 pb-16 md:pb-24 lg:pb-32">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <CombinedOrderStep
              initialPropertyData={propertyData}
              initialApplicantData={applicantData}
              onSubmit={handleOrderSubmit}
            />
          </div>
        </div>
      </section>
    </Layout>
  );
}
