import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { PropertyDetailsStep } from "@/components/wizard/PropertyDetailsStep";
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

  const handlePropertySubmit = (data: PropertyData) => {
    setPropertyData(data);
    setStep(2);
  };

  const handleCheckoutSubmit = (data: ApplicantData, orderNumber: string) => {
    setApplicantData(data);
    setOrderData({ orderNumber });
    setStep(3);
  };

  return (
    <Layout>
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Progress indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        s === step
                          ? "bg-primary text-primary-foreground"
                          : s < step
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s}
                    </div>
                    {s < 3 && (
                      <div
                        className={`w-12 h-0.5 ml-4 ${
                          s < step ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {step === 1 && (
              <PropertyDetailsStep
                initialData={propertyData}
                onSubmit={handlePropertySubmit}
              />
            )}

            {step === 2 && (
              <CheckoutStep
                propertyData={propertyData}
                initialData={applicantData}
                onSubmit={handleCheckoutSubmit}
                onBack={() => setStep(1)}
              />
            )}

            {step === 3 && (
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
