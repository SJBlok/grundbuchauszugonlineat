import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { OrderConfirmationStep } from "@/components/wizard/OrderConfirmationStep";

export default function Bestaetigung() {
  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderNumber = searchParams.get("order") || "";
  const email = searchParams.get("email") || "";
  const propertyInfo = searchParams.get("property") || "";
  const fromVariant = searchParams.get("variant") || "a";

  // Check if we have demo mode (no params but user is directly viewing)
  const isDemoMode = !orderNumber && !email;
  
  // Use demo data for preview purposes
  const displayOrderNumber = orderNumber || "GB-DEMO-12345";
  const displayEmail = email || "demo@beispiel.at";
  const displayPropertyInfo = propertyInfo || "EZ 123, KG Innere Stadt";

  const handleConfirm = () => {
    // Navigate to thank you page with order data
    const params = new URLSearchParams({
      order: displayOrderNumber,
      email: displayEmail,
      property: displayPropertyInfo,
    });
    navigate(`/danke?${params.toString()}`);
  };

  const handleBack = () => {
    if (fromVariant === "b") {
      navigate("/anfordern-b");
    } else {
      navigate("/anfordern");
    }
  };

  return (
    <Layout>
      <section className="min-h-[calc(100vh-200px)] bg-gradient-to-b from-background via-muted/30 to-background py-8 md:py-14 lg:py-16 pb-16 md:pb-24 lg:pb-32">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            {isDemoMode && (
              <div className="mb-4 p-3 bg-warning/20 border border-warning rounded text-warning-foreground text-sm text-center">
                Demo-Vorschau – Diese Seite wird normalerweise nach dem Ausfüllen des Formulars angezeigt.
              </div>
            )}
            <OrderConfirmationStep
              orderNumber={displayOrderNumber}
              email={displayEmail}
              propertyInfo={displayPropertyInfo}
              totalPrice="€29,88"
              onConfirm={handleConfirm}
              onBack={handleBack}
            />
          </div>
        </div>
      </section>
    </Layout>
  );
}
