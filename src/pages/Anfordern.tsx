import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { CombinedOrderStep } from "@/components/wizard/CombinedOrderStep";

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

export default function Anfordern() {
  const navigate = useNavigate();
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

  const handleOrderSubmit = (orderNumber: string, email: string, propertyInfo: string, totalPrice?: string) => {
    // Navigate to confirmation page with order data
    const params = new URLSearchParams({
      order: orderNumber,
      email: email,
      property: propertyInfo,
      variant: "a",
      price: totalPrice || "28.90",
    });
    navigate(`/bestaetigung?${params.toString()}`);
  };

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

