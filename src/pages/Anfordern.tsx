import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { CombinedOrderStep } from "@/components/wizard/CombinedOrderStep";
import { OrderConfirmationStep } from "@/components/wizard/OrderConfirmationStep";
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
  email: string;
  propertyInfo: string;
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
    email: "",
    propertyInfo: "",
  });

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleOrderSubmit = (orderNumber: string, email: string, propertyInfo: string) => {
    setOrderData({ orderNumber, email, propertyInfo });
    setApplicantData(prev => ({ ...prev, email }));
    setStep(2);
  };

  const handleConfirmation = () => {
    setStep(3);
  };

  // Thank you step
  if (step === 3) {
    return (
      <Layout>
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <ThankYouStep
                orderNumber={orderData.orderNumber}
                email={orderData.email}
                propertyInfo={orderData.propertyInfo}
              />
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  // Order confirmation step
  if (step === 2) {
    return (
      <Layout>
        <section className="min-h-[calc(100vh-200px)] bg-gradient-to-b from-background via-muted/30 to-background py-8 md:py-14 lg:py-16 pb-16 md:pb-24 lg:pb-32">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto">
              <OrderConfirmationStep
                orderNumber={orderData.orderNumber}
                email={orderData.email}
                propertyInfo={orderData.propertyInfo}
                totalPrice="€23,88"
                onConfirm={handleConfirmation}
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

