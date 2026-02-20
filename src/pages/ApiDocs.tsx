import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";

const BASE_URL = "https://sclblrqylmzqvbjuegkq.supabase.co/functions/v1";

const ApiDocs = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Developer API Documentatie</h1>
          <p className="text-muted-foreground text-lg">
            Gebruik onze REST API om orderdata op te halen in jouw applicatie.
          </p>
        </div>

        {/* Authentication */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Authenticatie</h2>
          <p className="text-muted-foreground mb-4">
            Alle API requests vereisen een geldige API key in de request header:
          </p>
          <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
            <code>x-api-key: &lt;jouw_api_key&gt;</code>
          </pre>
        </section>

        {/* Base URL */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Base URL</h2>
          <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
            <code>{BASE_URL}</code>
          </pre>
        </section>

        {/* Endpoints */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-6">Endpoints</h2>

          {/* GET /get-orders */}
          <div className="border rounded-xl overflow-hidden mb-6">
            <div className="flex items-center gap-3 px-5 py-4 bg-muted/50 border-b">
              <Badge className="font-mono text-xs">GET</Badge>
              <code className="text-sm font-mono">/get-orders</code>
              <span className="text-muted-foreground text-sm ml-2">Haal alle orders op</span>
            </div>

            <div className="p-5 space-y-6">
              {/* Query parameters */}
              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Query parameters (optioneel)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 font-medium">Parameter</th>
                        <th className="text-left py-2 pr-4 font-medium">Type</th>
                        <th className="text-left py-2 font-medium">Beschrijving</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {[
                        { param: "status", type: "string", desc: "Filter op orderstatus (bv. pending, completed)" },
                        { param: "payment_status", type: "string", desc: "Filter op betaalstatus (bv. paid, pending)" },
                        { param: "from_date", type: "date", desc: "Orders vanaf datum (bv. 2025-01-01)" },
                        { param: "to_date", type: "date", desc: "Orders tot datum (bv. 2025-12-31)" },
                        { param: "limit", type: "integer", desc: "Max aantal resultaten (default: 100)" },
                        { param: "offset", type: "integer", desc: "Offset voor paginering (default: 0)" },
                      ].map((row) => (
                        <tr key={row.param}>
                          <td className="py-2 pr-4 font-mono text-primary">{row.param}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{row.type}</td>
                          <td className="py-2 text-muted-foreground">{row.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Example request */}
              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Voorbeeld request</h3>
                <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
                  <code>{`curl -X GET \\
  "${BASE_URL}/get-orders?limit=10&status=pending" \\
  -H "x-api-key: <jouw_api_key>"`}</code>
                </pre>
              </div>

              {/* Example response */}
              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Voorbeeld response</h3>
                <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
                  <code>{`{
  "orders": [
    {
      "id": "uuid",
      "order_number": "GB-100001",

      // Klantgegevens
      "vorname": "Jan",
      "nachname": "Janssen",
      "email": "jan@example.com",
      "firma": null,
      "wohnsitzland": "Österreich",

      // Adresgegevens
      "adresse": "Musterstraße 1",
      "plz": "1010",
      "ort": "Wien",

      // Eigendomsgegevens
      "katastralgemeinde": "Wien",
      "grundstuecksnummer": "123/4",
      "grundbuchsgericht": "Bezirksgericht Innere Stadt Wien",
      "bundesland": "Wien",
      "wohnungs_hinweis": null,

      // Ordergegevens
      "status": "pending",
      "payment_status": "paid",
      "product_name": "Aktueller Grundbuchauszug",
      "product_price": 28.90,
      "fast_delivery": false,
      "digital_storage_subscription": false,

      // Tijdstempels
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:05:00Z"
    }
  ],
  "total": 42,
  "limit": 10,
  "offset": 0
}`}</code>
                </pre>
              </div>

              {/* Error responses */}
              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Foutmeldingen</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 font-medium">Status</th>
                        <th className="text-left py-2 font-medium">Beschrijving</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="py-2 pr-4"><Badge variant="destructive">401</Badge></td>
                        <td className="py-2 text-muted-foreground">Ongeldige of ontbrekende API key</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4"><Badge variant="destructive">500</Badge></td>
                        <td className="py-2 text-muted-foreground">Interne serverfout</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* PATCH /update-order */}
          <div className="border rounded-xl overflow-hidden mb-6">
            <div className="flex items-center gap-3 px-5 py-4 bg-muted/50 border-b">
              <Badge className="font-mono text-xs" variant="secondary">PATCH</Badge>
              <code className="text-sm font-mono">/update-order</code>
              <span className="text-muted-foreground text-sm ml-2">Update een order (status, documenten, Moneybird, etc.)</span>
            </div>

            <div className="p-5 space-y-6">
              {/* Query parameters */}
              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Query parameters (één vereist)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 font-medium">Parameter</th>
                        <th className="text-left py-2 pr-4 font-medium">Type</th>
                        <th className="text-left py-2 font-medium">Beschrijving</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {[
                        { param: "id", type: "uuid", desc: "Unieke order ID (UUID)" },
                        { param: "order_number", type: "string", desc: "Ordernummer (bv. GB-100001)" },
                      ].map((row) => (
                        <tr key={row.param}>
                          <td className="py-2 pr-4 font-mono text-primary">{row.param}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{row.type}</td>
                          <td className="py-2 text-muted-foreground">{row.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Body fields */}
              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Request body (JSON, alle velden optioneel)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 font-medium">Veld</th>
                        <th className="text-left py-2 pr-4 font-medium">Type</th>
                        <th className="text-left py-2 font-medium">Beschrijving</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {[
                        { field: "status", type: "string", desc: "Orderstatus (bv. pending, completed, cancelled)" },
                        { field: "payment_status", type: "string", desc: "Betaalstatus (bv. paid, pending, failed)" },
                        { field: "processing_status", type: "string", desc: "Verwerkingsstatus (bv. unprocessed, processing, done)" },
                        { field: "processing_notes", type: "string", desc: "Interne verwerkingsnotities" },
                        { field: "moneybird_invoice_id", type: "string", desc: "Moneybird factuur ID" },
                        { field: "moneybird_invoice_status", type: "string", desc: "Moneybird factuurstatus (bv. draft, sent, paid)" },
                        { field: "documents", type: "array", desc: "Bijgevoegde documenten als array van objecten [{name, url, type}]" },
                      ].map((row) => (
                        <tr key={row.field}>
                          <td className="py-2 pr-4 font-mono text-primary">{row.field}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{row.type}</td>
                          <td className="py-2 text-muted-foreground">{row.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Example request */}
              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Voorbeeld request</h3>
                <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
                  <code>{`curl -X PATCH \\
  "${BASE_URL}/update-order?order_number=GB-100001" \\
  -H "x-api-key: <jouw_api_key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "processing_status": "processing",
    "status": "completed",
    "moneybird_invoice_id": "123456789",
    "moneybird_invoice_status": "sent",
    "documents": [
      {
        "name": "Grundbuchauszug_GB-100001.pdf",
        "url": "https://...",
        "type": "grundbuchauszug"
      }
    ]
  }'`}</code>
                </pre>
              </div>

              {/* Example response */}
              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Voorbeeld response</h3>
                <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
                  <code>{`{
  "order": {
    "id": "uuid",
    "order_number": "GB-100001",
    "status": "completed",
    "payment_status": "paid",
    "processing_status": "processing",
    "processing_notes": null,
    "moneybird_invoice_id": "123456789",
    "moneybird_invoice_status": "sent",
    "documents": [
      {
        "name": "Grundbuchauszug_GB-100001.pdf",
        "url": "https://...",
        "type": "grundbuchauszug"
      }
    ],
    "updated_at": "2025-01-15T11:00:00Z"
  }
}`}</code>
                </pre>
              </div>

              {/* Error responses */}
              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Foutmeldingen</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 font-medium">Status</th>
                        <th className="text-left py-2 font-medium">Beschrijving</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="py-2 pr-4"><Badge variant="destructive">400</Badge></td>
                        <td className="py-2 text-muted-foreground">Ontbrekende of ongeldige parameters</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4"><Badge variant="destructive">401</Badge></td>
                        <td className="py-2 text-muted-foreground">Ongeldige of ontbrekende API key</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4"><Badge variant="destructive">404</Badge></td>
                        <td className="py-2 text-muted-foreground">Order niet gevonden</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4"><Badge variant="destructive">500</Badge></td>
                        <td className="py-2 text-muted-foreground">Interne serverfout</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="border rounded-xl p-5 bg-muted/30">
          <h2 className="font-semibold mb-1">Vragen?</h2>
          <p className="text-muted-foreground text-sm">
            Neem contact op via{" "}
            <a href="mailto:info@grundbuchauszugonline.at" className="text-primary hover:underline">
              info@grundbuchauszugonline.at
            </a>
          </p>
        </section>
      </div>
    </Layout>
  );
};

export default ApiDocs;
