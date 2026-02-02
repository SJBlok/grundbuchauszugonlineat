import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ThankYouStep } from "@/components/wizard/ThankYouStep";

export default function Danke() {
  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderNumber = searchParams.get("order") || "";
  const email = searchParams.get("email") || "";
  const propertyInfo = searchParams.get("property") || "";

  // Check if we have demo mode (no params but user is directly viewing)
  const isDemoMode = !orderNumber && !email;
  
  // Use demo data for preview purposes
  const displayOrderNumber = orderNumber || "GB-DEMO-12345";
  const displayEmail = email || "demo@beispiel.at";
  const displayPropertyInfo = propertyInfo || "EZ 123, KG Innere Stadt";

  return (
    <Layout>
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {isDemoMode && (
              <div className="mb-4 p-3 bg-warning/20 border border-warning rounded text-warning-foreground text-sm text-center">
                Demo-Vorschau – Diese Seite wird normalerweise nach einer Bestellung angezeigt.
              </div>
            )}
            <ThankYouStep
              orderNumber={displayOrderNumber}
              email={displayEmail}
              propertyInfo={displayPropertyInfo}
            />
          </div>
        </div>
      </section>
    </Layout>
  );
}
