import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ThankYouStep } from "@/components/wizard/ThankYouStep";

export default function Bedankt() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderNumber = searchParams.get("order") || "";
  const email = searchParams.get("email") || "";
  const propertyInfo = searchParams.get("property") || "";

  // Redirect to home if no order data
  useEffect(() => {
    if (!orderNumber || !email) {
      navigate("/");
    }
  }, [orderNumber, email, navigate]);

  if (!orderNumber || !email) {
    return null;
  }

  return (
    <Layout>
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <ThankYouStep
              orderNumber={orderNumber}
              email={email}
              propertyInfo={propertyInfo}
            />
          </div>
        </div>
      </section>
    </Layout>
  );
}
