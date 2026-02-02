import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { CombinedOrderStep } from "@/components/wizard/CombinedOrderStep";
import { OrderConfirmationStep } from "@/components/wizard/OrderConfirmationStep";

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
  const navigate = useNavigate();
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
    // Navigate to thank you page with order data
    const params = new URLSearchParams({
      order: orderData.orderNumber,
      email: orderData.email,
      property: orderData.propertyInfo,
    });
    navigate(`/bedankt?${params.toString()}`);
  };

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

