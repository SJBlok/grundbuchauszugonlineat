import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";

const BASE_URL = "https://sclblrqylmzqvbjuegkq.supabase.co/functions/v1";

type MethodBadgeProps = { method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" };
const MethodBadge = ({ method }: MethodBadgeProps) => {
  const colors: Record<string, string> = {
    GET: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    POST: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    PATCH: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    PUT: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  return (
    <span className={`font-mono text-xs font-bold px-2 py-1 rounded ${colors[method]}`}>
      {method}
    </span>
  );
};

type ParamRow = { param: string; type: string; required?: boolean; desc: string };
const ParamTable = ({ rows }: { rows: ParamRow[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b">
          <th className="text-left py-2 pr-4 font-medium">Parameter</th>
          <th className="text-left py-2 pr-4 font-medium">Type</th>
          <th className="text-left py-2 pr-4 font-medium">Vereist</th>
          <th className="text-left py-2 font-medium">Beschrijving</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {rows.map((row) => (
          <tr key={row.param}>
            <td className="py-2 pr-4 font-mono text-primary">{row.param}</td>
            <td className="py-2 pr-4 text-muted-foreground">{row.type}</td>
            <td className="py-2 pr-4 text-muted-foreground">{row.required ? "Ja" : "Nee"}</td>
            <td className="py-2 text-muted-foreground">{row.desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

type EndpointProps = {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  description: string;
  children: React.ReactNode;
};
const Endpoint = ({ method, path, description, children }: EndpointProps) => (
  <div className="border rounded-xl overflow-hidden mb-6">
    <div className="flex items-center gap-3 px-5 py-4 bg-muted/50 border-b">
      <MethodBadge method={method} />
      <code className="text-sm font-mono">{path}</code>
      <span className="text-muted-foreground text-sm ml-2">{description}</span>
    </div>
    <div className="p-5 space-y-6">{children}</div>
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
    {children}
  </h3>
);

const CodeBlock = ({ code }: { code: string }) => (
  <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
    <code>{code}</code>
  </pre>
);

const ErrorTable = ({ rows }: { rows: { status: number; desc: string }[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b">
          <th className="text-left py-2 pr-4 font-medium">Status</th>
          <th className="text-left py-2 font-medium">Beschrijving</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {rows.map((r) => (
          <tr key={r.status}>
            <td className="py-2 pr-4">
              <Badge variant="destructive">{r.status}</Badge>
            </td>
            <td className="py-2 text-muted-foreground">{r.desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const DEFAULT_ERRORS = [
  { status: 401, desc: "Ongeldige of ontbrekende API key" },
  { status: 500, desc: "Interne serverfout" },
];

const ApiDocs = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Developer API Documentatie</h1>
          <p className="text-muted-foreground text-lg">
            Gebruik onze REST API om orderdata op te halen en orders te verwerken.
          </p>
        </div>

        {/* Authentication */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Authenticatie</h2>
          <p className="text-muted-foreground mb-4">
            Alle API requests vereisen een geldige API key in de request header:
          </p>
          <CodeBlock code="x-api-key: <jouw_api_key>" />
        </section>

        {/* Base URL */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Base URL</h2>
          <CodeBlock code={BASE_URL} />
        </section>

        {/* ===== ORDER STATUSSEN ===== */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-6">Order Statussen</h2>
          <p className="text-muted-foreground mb-6">
            Elke order heeft een <code className="text-sm bg-muted px-1 py-0.5 rounded">status</code> veld dat de lifecycle van de order bijhoudt.
            Gebruik de <code className="text-sm bg-muted px-1 py-0.5 rounded">status</code> filter in <code className="text-sm bg-muted px-1 py-0.5 rounded">/get-orders</code> of update via <code className="text-sm bg-muted px-1 py-0.5 rounded">/update-order</code>.
          </p>

          {/* Status tabel */}
          <div className="border rounded-xl overflow-hidden mb-6">
            <div className="px-5 py-4 bg-muted/50 border-b">
              <h3 className="font-semibold text-sm">Beschikbare statussen</h3>
            </div>
            <div className="divide-y">
              {[
                {
                  code: "open",
                  label: "Open",
                  color: "bg-blue-100 text-blue-800",
                  desc: "Order is nieuw ontvangen, nog niet in behandeling genomen. Wacht op admin actie.",
                  next: ["awaiting_customer", "processed", "cancelled"],
                  email: "order_confirmation",
                },
                {
                  code: "awaiting_customer",
                  label: "Wachten op klant",
                  color: "bg-yellow-100 text-yellow-800",
                  desc: "Admin heeft extra informatie nodig. Order staat on-hold, wacht op reactie van klant.",
                  next: ["open", "processed", "cancelled"],
                  email: "awaiting_customer_response",
                  auto: "Automatische reminder na 3 dagen",
                },
                {
                  code: "processed",
                  label: "Verwerkt",
                  color: "bg-green-100 text-green-800",
                  desc: "Order volledig afgehandeld. Documenten verstuurd, klant geïnformeerd, factuur aangemaakt.",
                  next: [],
                  email: "order_completed",
                  auto: "MoneyBird factuur betaald zetten, archivering na 30 dagen",
                },
                {
                  code: "cancelled",
                  label: "Geannuleerd",
                  color: "bg-gray-100 text-gray-800",
                  desc: "Order geannuleerd door klant of admin. Geen verdere verwerking.",
                  next: [],
                  email: "order_cancelled",
                  auto: "MoneyBird factuur annuleren, refund indien betaald",
                },
                {
                  code: "deleted",
                  label: "Verwijderd",
                  color: "bg-red-100 text-red-800",
                  desc: "Soft delete — data blijft in database. Alleen voor admins zichtbaar. Kan hersteld worden.",
                  next: [],
                  email: null,
                },
              ].map((s) => (
                <div key={s.code} className="px-5 py-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-6">
                  <div className="flex-shrink-0 w-40">
                    <span className={`inline-block font-mono text-xs font-bold px-2 py-1 rounded ${s.color}`}>
                      {s.code}
                    </span>
                  </div>
                  <div className="flex-1 text-sm space-y-1">
                    <p className="font-medium">{s.label}</p>
                    <p className="text-muted-foreground">{s.desc}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
                      {s.next.length > 0 && (
                        <span>→ <span className="font-medium">Volgende:</span> {s.next.map(n => <code key={n} className="bg-muted px-1 rounded mx-0.5">{n}</code>)}</span>
                      )}
                      {s.email && (
                        <span>✉ <span className="font-medium">Template:</span> <code className="bg-muted px-1 rounded">{s.email}</code></span>
                      )}
                      {!s.email && (
                        <span className="text-muted-foreground">✉ Geen email notificatie</span>
                      )}
                      {s.auto && (
                        <span>⚡ {s.auto}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status flow */}
          <div className="border rounded-xl p-5 bg-muted/30 mb-6">
            <SectionTitle>Status flow</SectionTitle>
            <div className="flex flex-wrap gap-2 items-center text-sm font-mono">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">open</span>
              <span className="text-muted-foreground">→</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-bold">awaiting_customer</span>
              <span className="text-muted-foreground">→</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">open</span>
              <span className="text-muted-foreground">or</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-bold">processed</span>
            </div>
            <div className="flex flex-wrap gap-2 items-center text-sm font-mono mt-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">open</span>
              <span className="text-muted-foreground">→</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-bold">processed</span>
            </div>
            <div className="flex flex-wrap gap-2 items-center text-sm font-mono mt-2">
              <span className="text-muted-foreground">any</span>
              <span className="text-muted-foreground">→</span>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded font-bold">cancelled</span>
              <span className="text-muted-foreground">or</span>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-bold">deleted</span>
            </div>
          </div>

          {/* Voorbeeld status update */}
          <div className="border rounded-xl overflow-hidden mb-6">
            <div className="flex items-center gap-3 px-5 py-4 bg-muted/50 border-b">
              <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-yellow-100 text-yellow-800">PATCH</span>
              <code className="text-sm font-mono">/update-order</code>
              <span className="text-muted-foreground text-sm ml-2">Status wijzigen van een order</span>
            </div>
            <div className="p-5 space-y-4">
              <SectionTitle>Voorbeeld: order naar "processed" zetten</SectionTitle>
              <CodeBlock code={`curl -X PATCH \\
  "${BASE_URL}/update-order?order_number=GB-100001" \\
  -H "x-api-key: <jouw_api_key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "processed",
    "processing_notes": "Alle documenten verstuurd per email"
  }'`} />
              <SectionTitle>Voorbeeld: order naar "awaiting_customer" zetten</SectionTitle>
              <CodeBlock code={`curl -X PATCH \\
  "${BASE_URL}/update-order?order_number=GB-100001" \\
  -H "x-api-key: <jouw_api_key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "awaiting_customer",
    "processing_notes": "Extra informatie nodig: perceel niet gevonden in kadaster"
  }'`} />
              <SectionTitle>Bulk status update (meerdere orders tegelijk)</SectionTitle>
              <CodeBlock code={`curl -X POST \\
  "${BASE_URL}/bulk-update-orders" \\
  -H "x-api-key: <jouw_api_key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "order_numbers": ["GB-100001", "GB-100002", "GB-100003"],
    "status": "processed",
    "processing_notes": "Batch verwerking week 8"
  }'`} />
            </div>
          </div>
        </section>

        {/* ===== ORDERS ===== */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-6">Orders</h2>

          {/* GET /get-orders */}
          <Endpoint method="GET" path="/get-orders" description="Haal alle orders op (met filters)">
            <div>
              <SectionTitle>Query parameters (optioneel)</SectionTitle>
              <ParamTable rows={[
                { param: "status", type: "string", desc: "Filter op orderstatus (bv. pending, completed)" },
                { param: "payment_status", type: "string", desc: "Filter op betaalstatus (bv. paid, pending)" },
                { param: "from_date", type: "date", desc: "Orders vanaf datum (bv. 2025-01-01)" },
                { param: "to_date", type: "date", desc: "Orders tot datum (bv. 2025-12-31)" },
                { param: "limit", type: "integer", desc: "Max aantal resultaten (default: 100)" },
                { param: "offset", type: "integer", desc: "Offset voor paginering (default: 0)" },
              ]} />
            </div>
            <div>
              <SectionTitle>Voorbeeld request</SectionTitle>
              <CodeBlock code={`curl -X GET \\
  "${BASE_URL}/get-orders?limit=10&status=pending" \\
  -H "x-api-key: <jouw_api_key>"`} />
            </div>
            <div>
              <SectionTitle>Voorbeeld response</SectionTitle>
              <CodeBlock code={`{
  "orders": [
    {
      "id": "uuid",
      "order_number": "GB-100001",
      "vorname": "Jan",
      "nachname": "Janssen",
      "email": "jan@example.com",
      "firma": null,
      "wohnsitzland": "Österreich",
      "adresse": "Musterstraße 1",
      "plz": "1010",
      "ort": "Wien",
      "katastralgemeinde": "Wien",
      "grundstuecksnummer": "123/4",
      "grundbuchsgericht": "Bezirksgericht Innere Stadt Wien",
      "bundesland": "Wien",
      "wohnungs_hinweis": null,
      "status": "pending",
      "payment_status": "paid",
      "processing_status": "unprocessed",
      "processing_notes": null,
      "product_name": "Aktueller Grundbuchauszug",
      "product_price": 28.90,
      "fast_delivery": false,
      "digital_storage_subscription": false,
      "moneybird_invoice_id": null,
      "moneybird_invoice_status": null,
      "documents": [],
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:05:00Z"
    }
  ],
  "total": 42,
  "limit": 10,
  "offset": 0
}`} />
            </div>
            <div>
              <SectionTitle>Foutmeldingen</SectionTitle>
              <ErrorTable rows={DEFAULT_ERRORS} />
            </div>
          </Endpoint>

          {/* GET /get-order */}
          <Endpoint method="GET" path="/get-order" description="Haal één specifieke order op">
            <div>
              <SectionTitle>Query parameters (één vereist)</SectionTitle>
              <ParamTable rows={[
                { param: "id", type: "uuid", required: false, desc: "Unieke order ID (UUID)" },
                { param: "order_number", type: "string", required: false, desc: "Ordernummer (bv. GB-100001)" },
              ]} />
            </div>
            <div>
              <SectionTitle>Voorbeeld request</SectionTitle>
              <CodeBlock code={`curl -X GET \\
  "${BASE_URL}/get-order?order_number=GB-100001" \\
  -H "x-api-key: <jouw_api_key>"`} />
            </div>
            <div>
              <SectionTitle>Voorbeeld response</SectionTitle>
              <CodeBlock code={`{
  "order": {
    "id": "uuid",
    "order_number": "GB-100001",
    "vorname": "Jan",
    "nachname": "Janssen",
    "email": "jan@example.com",
    "status": "pending",
    "payment_status": "paid",
    "processing_status": "unprocessed",
    "documents": [],
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:05:00Z"
  }
}`} />
            </div>
            <div>
              <SectionTitle>Foutmeldingen</SectionTitle>
              <ErrorTable rows={[
                { status: 400, desc: "Ontbrekende parameter: id of order_number" },
                { status: 401, desc: "Ongeldige of ontbrekende API key" },
                { status: 404, desc: "Order niet gevonden" },
                { status: 500, desc: "Interne serverfout" },
              ]} />
            </div>
          </Endpoint>

          {/* PATCH /update-order */}
          <Endpoint method="PATCH" path="/update-order" description="Update een order (status, documenten, Moneybird, etc.)">
            <div>
              <SectionTitle>Query parameters (één vereist)</SectionTitle>
              <ParamTable rows={[
                { param: "id", type: "uuid", required: false, desc: "Unieke order ID (UUID)" },
                { param: "order_number", type: "string", required: false, desc: "Ordernummer (bv. GB-100001)" },
              ]} />
            </div>
            <div>
              <SectionTitle>Request body (JSON, alle velden optioneel)</SectionTitle>
              <ParamTable rows={[
                { param: "status", type: "string", desc: "Orderstatus (bv. pending, completed, cancelled)" },
                { param: "payment_status", type: "string", desc: "Betaalstatus (bv. paid, pending, failed)" },
                { param: "processing_status", type: "string", desc: "Verwerkingsstatus (bv. unprocessed, processing, done)" },
                { param: "processing_notes", type: "string", desc: "Interne verwerkingsnotities" },
                { param: "moneybird_invoice_id", type: "string", desc: "Moneybird factuur ID" },
                { param: "moneybird_invoice_status", type: "string", desc: "Moneybird factuurstatus (bv. draft, sent, paid)" },
                { param: "documents", type: "array", desc: "Bijgevoegde documenten als array van objecten [{name, url, type}]" },
              ]} />
            </div>
            <div>
              <SectionTitle>Voorbeeld request</SectionTitle>
              <CodeBlock code={`curl -X PATCH \\
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
  }'`} />
            </div>
            <div>
              <SectionTitle>Voorbeeld response</SectionTitle>
              <CodeBlock code={`{
  "order": {
    "id": "uuid",
    "order_number": "GB-100001",
    "status": "completed",
    "payment_status": "paid",
    "processing_status": "processing",
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
}`} />
            </div>
            <div>
              <SectionTitle>Foutmeldingen</SectionTitle>
              <ErrorTable rows={[
                { status: 400, desc: "Ontbrekende of ongeldige parameters" },
                { status: 401, desc: "Ongeldige of ontbrekende API key" },
                { status: 404, desc: "Order niet gevonden" },
                { status: 500, desc: "Interne serverfout" },
              ]} />
            </div>
          </Endpoint>

          {/* POST /bulk-update-orders */}
          <Endpoint method="POST" path="/bulk-update-orders" description="Update meerdere orders tegelijk">
            <div>
              <SectionTitle>Request body (JSON)</SectionTitle>
              <ParamTable rows={[
                { param: "order_numbers", type: "string[]", required: false, desc: "Array van ordernummers (bv. [\"GB-100001\", \"GB-100002\"])" },
                { param: "order_ids", type: "uuid[]", required: false, desc: "Array van order UUIDs (alternatief voor order_numbers)" },
                { param: "status", type: "string", required: false, desc: "Orderstatus om in te stellen" },
                { param: "payment_status", type: "string", required: false, desc: "Betaalstatus om in te stellen" },
                { param: "processing_status", type: "string", required: false, desc: "Verwerkingsstatus om in te stellen" },
                { param: "processing_notes", type: "string", required: false, desc: "Interne verwerkingsnotities" },
                { param: "moneybird_invoice_id", type: "string", required: false, desc: "Moneybird factuur ID" },
                { param: "moneybird_invoice_status", type: "string", required: false, desc: "Moneybird factuurstatus" },
                { param: "documents", type: "array", required: false, desc: "Bijgevoegde documenten [{name, url, type}]" },
              ]} />
            </div>
            <div>
              <SectionTitle>Voorbeeld request</SectionTitle>
              <CodeBlock code={`curl -X POST \\
  "${BASE_URL}/bulk-update-orders" \\
  -H "x-api-key: <jouw_api_key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "order_numbers": ["GB-100001", "GB-100002", "GB-100003"],
    "processing_status": "processing",
    "status": "completed"
  }'`} />
            </div>
            <div>
              <SectionTitle>Voorbeeld response</SectionTitle>
              <CodeBlock code={`{
  "updated": 3,
  "failed": 0,
  "results": [
    { "identifier": "GB-100001", "success": true },
    { "identifier": "GB-100002", "success": true },
    { "identifier": "GB-100003", "success": true }
  ]
}`} />
            </div>
            <div>
              <SectionTitle>Foutmeldingen</SectionTitle>
              <ErrorTable rows={[
                { status: 400, desc: "Ontbrekende order_numbers of order_ids, of geen geldige velden" },
                { status: 401, desc: "Ongeldige of ontbrekende API key" },
                { status: 500, desc: "Interne serverfout" },
              ]} />
            </div>
          </Endpoint>
        </section>

        {/* ===== EMAIL ===== */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-6">Email</h2>

          <Endpoint method="POST" path="/send-order-email" description="Stuur een e-mail voor een order">
            <div>
              <SectionTitle>Request body (JSON)</SectionTitle>
              <ParamTable rows={[
                { param: "order_number", type: "string", required: false, desc: "Ordernummer (bv. GB-100001) — één van beide vereist" },
                { param: "order_id", type: "uuid", required: false, desc: "Order UUID — één van beide vereist" },
                { param: "to", type: "string", required: true, desc: "E-mailadres van de ontvanger" },
                { param: "subject", type: "string", required: true, desc: "Onderwerp van de e-mail" },
                { param: "html_body", type: "string", required: false, desc: "HTML inhoud van de e-mail (html_body of text_body vereist)" },
                { param: "text_body", type: "string", required: false, desc: "Platte tekst inhoud van de e-mail" },
                { param: "attachments", type: "array", required: false, desc: "Bijlagen als array van objecten [{Name, Content, ContentType}]" },
              ]} />
            </div>
            <div>
              <SectionTitle>Voorbeeld request</SectionTitle>
              <CodeBlock code={`curl -X POST \\
  "${BASE_URL}/send-order-email" \\
  -H "x-api-key: <jouw_api_key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "order_number": "GB-100001",
    "to": "klant@example.com",
    "subject": "Uw Grundbuchauszug is klaar",
    "html_body": "<p>Geachte heer/mevrouw,</p><p>Uw document is beschikbaar.</p>"
  }'`} />
            </div>
            <div>
              <SectionTitle>Voorbeeld response</SectionTitle>
              <CodeBlock code={`{
  "success": true,
  "message_id": "abc123",
  "order_number": "GB-100001",
  "to": "klant@example.com",
  "subject": "Uw Grundbuchauszug is klaar"
}`} />
            </div>
            <div>
              <SectionTitle>Foutmeldingen</SectionTitle>
              <ErrorTable rows={[
                { status: 400, desc: "Ontbrekende verplichte velden" },
                { status: 401, desc: "Ongeldige of ontbrekende API key" },
                { status: 404, desc: "Order niet gevonden" },
                { status: 500, desc: "Interne serverfout of Postmark-fout" },
              ]} />
            </div>
          </Endpoint>
        </section>

        {/* ===== WEBHOOKS ===== */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-6">Webhooks</h2>
          <p className="text-muted-foreground mb-4">
            Configureer webhooks om real-time notificaties te ontvangen bij order events. Alle webhook endpoints zitten op <code className="text-sm bg-muted px-1 py-0.5 rounded">/manage-webhooks</code>.
          </p>

          {/* Supported events */}
          <div className="border rounded-xl p-5 mb-6 bg-muted/30">
            <SectionTitle>Ondersteunde events</SectionTitle>
            <div className="grid grid-cols-2 gap-1 text-sm font-mono text-muted-foreground">
              {[
                "order.created", "order.updated", "order.status_changed", "order.cancelled",
                "payment.received", "payment.failed", "payment.refunded",
                "document.uploaded", "document.sent",
                "moneybird.invoice_created", "moneybird.invoice_paid",
              ].map((e) => (
                <span key={e} className="text-primary">{e}</span>
              ))}
            </div>
          </div>

          {/* GET /manage-webhooks */}
          <Endpoint method="GET" path="/manage-webhooks" description="Haal alle geconfigureerde webhooks op">
            <div>
              <SectionTitle>Voorbeeld request</SectionTitle>
              <CodeBlock code={`curl -X GET \\
  "${BASE_URL}/manage-webhooks" \\
  -H "x-api-key: <jouw_api_key>"`} />
            </div>
            <div>
              <SectionTitle>Voorbeeld response</SectionTitle>
              <CodeBlock code={`{
  "webhooks": [
    {
      "id": "uuid",
      "url": "https://jouw-portaal.nl/webhooks/orders",
      "events": ["order.created", "order.status_changed"],
      "active": true,
      "custom_headers": {},
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ]
}`} />
            </div>
          </Endpoint>

          {/* POST /manage-webhooks */}
          <Endpoint method="POST" path="/manage-webhooks" description="Registreer een nieuwe webhook">
            <div>
              <SectionTitle>Request body (JSON)</SectionTitle>
              <ParamTable rows={[
                { param: "url", type: "string", required: true, desc: "URL waar webhook payloads naartoe gestuurd worden" },
                { param: "events", type: "string[]", required: true, desc: "Array van events om op te abonneren" },
                { param: "secret", type: "string", required: true, desc: "Geheim voor HMAC-SHA256 signature verificatie" },
                { param: "active", type: "boolean", required: false, desc: "Of de webhook actief is (default: true)" },
                { param: "custom_headers", type: "object", required: false, desc: "Extra headers die meegestuurd worden bij elke webhook call" },
              ]} />
            </div>
            <div>
              <SectionTitle>Voorbeeld request</SectionTitle>
              <CodeBlock code={`curl -X POST \\
  "${BASE_URL}/manage-webhooks" \\
  -H "x-api-key: <jouw_api_key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://jouw-portaal.nl/webhooks/orders",
    "events": ["order.created", "order.status_changed", "payment.received"],
    "secret": "jouw-geheime-sleutel",
    "active": true
  }'`} />
            </div>
            <div>
              <SectionTitle>Voorbeeld response</SectionTitle>
              <CodeBlock code={`{
  "webhook": {
    "id": "uuid",
    "url": "https://jouw-portaal.nl/webhooks/orders",
    "events": ["order.created", "order.status_changed", "payment.received"],
    "active": true,
    "custom_headers": {},
    "created_at": "2025-01-15T10:00:00Z"
  }
}`} />
            </div>
          </Endpoint>

          {/* PATCH /manage-webhooks */}
          <Endpoint method="PATCH" path="/manage-webhooks?id={webhook_id}" description="Update een bestaande webhook">
            <div>
              <SectionTitle>Query parameters</SectionTitle>
              <ParamTable rows={[
                { param: "id", type: "uuid", required: true, desc: "Webhook ID om te updaten" },
              ]} />
            </div>
            <div>
              <SectionTitle>Voorbeeld request</SectionTitle>
              <CodeBlock code={`curl -X PATCH \\
  "${BASE_URL}/manage-webhooks?id=<webhook_id>" \\
  -H "x-api-key: <jouw_api_key>" \\
  -H "Content-Type: application/json" \\
  -d '{ "active": false }'`} />
            </div>
          </Endpoint>

          {/* DELETE /manage-webhooks */}
          <Endpoint method="DELETE" path="/manage-webhooks?id={webhook_id}" description="Verwijder een webhook">
            <div>
              <SectionTitle>Voorbeeld request</SectionTitle>
              <CodeBlock code={`curl -X DELETE \\
  "${BASE_URL}/manage-webhooks?id=<webhook_id>" \\
  -H "x-api-key: <jouw_api_key>"`} />
            </div>
          </Endpoint>

          {/* Webhook payload */}
          <div className="border rounded-xl p-5 bg-muted/30">
            <SectionTitle>Webhook payload formaat</SectionTitle>
            <p className="text-sm text-muted-foreground mb-3">
              Bij elk event sturen wij een POST request naar jouw URL met de volgende payload. Verifieer de handtekening met HMAC-SHA256.
            </p>
            <CodeBlock code={`// Header:
X-Webhook-Signature: sha256=<hmac_hex>

// Payload:
{
  "event": "order.status_changed",
  "timestamp": "2025-01-15T11:00:00Z",
  "data": {
    "order_number": "GB-100001",
    "previous_status": "pending",
    "current_status": "completed"
  }
}`} />
            <div className="mt-4">
              <SectionTitle>Verificatie (Node.js)</SectionTitle>
              <CodeBlock code={`const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return signature === \`sha256=\${expected}\`;
}`} />
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
