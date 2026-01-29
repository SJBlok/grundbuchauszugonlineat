import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { CombinedOrderStep } from "@/components/wizard/CombinedOrderStep";
import { ThankYouStep } from "@/components/wizard/ThankYouStep";

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

export default function Anfordern() {
  const [step, setStep] = useState(1);
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

  const handleOrderSubmit = (orderNumber: string) => {
    setOrderData({ orderNumber });
    setStep(2);
  };

  // Thank you step
  if (step === 2) {
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
      <section className="min-h-[calc(100vh-200px)] bg-gradient-to-b from-background via-muted/30 to-background py-10 md:py-14 lg:py-16">
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
