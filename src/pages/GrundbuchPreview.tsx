import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import grundbuchPage1 from '@/assets/grundbuch-example-fictitious.jpg';
import grundbuchPage2 from '@/assets/grundbuch-example-page2.jpg';

export default function GrundbuchPreview() {
  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to="/anfordern-b">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            Beispiel Grundbuchauszug
          </h1>
          <p className="text-muted-foreground mt-2">
            So sieht ein Grundbuchauszug aus. Die gezeigten Daten sind fiktiv.
          </p>
        </div>

        {/* Document Preview */}
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Page 1 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-primary/10 px-4 py-2 border-b">
              <span className="text-sm font-medium text-primary">Seite 1 von 2</span>
            </div>
            <div className="relative">
              <img 
                src={grundbuchPage1} 
                alt="Grundbuchauszug Seite 1" 
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Page 2 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-primary/10 px-4 py-2 border-b">
              <span className="text-sm font-medium text-primary">Seite 2 von 2</span>
            </div>
            <div className="relative">
              <img 
                src={grundbuchPage2} 
                alt="Grundbuchauszug Seite 2" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Erläuterung der Abschnitte</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <h3 className="font-bold text-emerald-800">A-Blatt</h3>
              <p className="text-sm text-emerald-700 mt-1">
                Grundstücksverzeichnis mit Flächenangaben und Nutzungsart
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-bold text-blue-800">B-Blatt</h3>
              <p className="text-sm text-blue-700 mt-1">
                Eigentümerverzeichnis mit Eigentumsanteilen
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h3 className="font-bold text-amber-800">C-Blatt</h3>
              <p className="text-sm text-amber-700 mt-1">
                Lastenblatt mit Hypotheken und Dienstbarkeiten
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-4xl mx-auto mt-8 text-center">
          <Link to="/anfordern-b">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Jetzt eigenen Grundbuchauszug anfordern
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
