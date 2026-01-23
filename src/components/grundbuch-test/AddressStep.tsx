import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, MapPin, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { useGrundbuchTestStore } from '@/stores/grundbuch-test-store';
import { mockAddressLookup } from '@/lib/uvst-api';

const addressSchema = z.object({
  straat: z.string().min(1, 'Straat is verplicht'),
  huisnummer: z.string().min(1, 'Huisnummer is verplicht'),
  postcode: z.string().min(4, 'Postcode is verplicht'),
  plaats: z.string().min(1, 'Plaats is verplicht'),
});

type AddressFormData = z.infer<typeof addressSchema>;

export function AddressStep() {
  const {
    addressData,
    setAddressData,
    lookupResult,
    setLookupResult,
    isLoading,
    setIsLoading,
    error,
    setError,
    nextStep,
    prevStep,
  } = useGrundbuchTestStore();

  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: addressData,
  });

  const onSubmit = async (data: AddressFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setAddressData(data);

    try {
      const result = await mockAddressLookup(
        data.straat,
        data.huisnummer,
        data.postcode,
        data.plaats
      );
      setLookupResult(result);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Address lookup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-cyan-400 font-mono">Step 2: Adres Lookup</h2>
        <p className="text-slate-400 text-sm">
          Zoek het adres op om de Katastralgemeinde en Einlagezahl te vinden.
        </p>
      </div>

      <Alert className="bg-amber-900/20 border-amber-500/50">
        <Info className="h-4 w-4 text-amber-400" />
        <AlertTitle className="text-amber-400">Mock Lookup</AlertTitle>
        <AlertDescription className="text-amber-200/80">
          Dit is een mock lookup. In productie wordt hier de echte UVST Anschriftenverzeichnis API aangeroepen.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="straat" className="text-slate-300">Straat</Label>
            <Input
              id="straat"
              {...register('straat')}
              placeholder="Kärntner Straße"
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
            {errors.straat && (
              <p className="text-red-400 text-xs">{errors.straat.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="huisnummer" className="text-slate-300">Huisnummer</Label>
            <Input
              id="huisnummer"
              {...register('huisnummer')}
              placeholder="1"
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
            {errors.huisnummer && (
              <p className="text-red-400 text-xs">{errors.huisnummer.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="postcode" className="text-slate-300">Postcode</Label>
            <Input
              id="postcode"
              {...register('postcode')}
              placeholder="1010"
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
            {errors.postcode && (
              <p className="text-red-400 text-xs">{errors.postcode.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="plaats" className="text-slate-300">Plaats</Label>
            <Input
              id="plaats"
              {...register('plaats')}
              placeholder="Wien"
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
            {errors.plaats && (
              <p className="text-red-400 text-xs">{errors.plaats.message}</p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Zoeken...
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 mr-2" />
              Adres Opzoeken
            </>
          )}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && lookupResult && (
        <Alert className="bg-emerald-900/20 border-emerald-500/50">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <AlertTitle className="text-emerald-400">Adres gevonden!</AlertTitle>
          <AlertDescription>
            <div className="mt-2 p-3 bg-slate-800 rounded font-mono text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">KG-Nummer:</span>
                <span className="text-cyan-400">{lookupResult.kgNummer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">KG-Name:</span>
                <span className="text-slate-300">{lookupResult.kgName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Einlagezahl:</span>
                <span className="text-cyan-400">{lookupResult.einlagezahl}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gericht:</span>
                <span className="text-slate-300">{lookupResult.gericht}</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          className="border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug
        </Button>
        <Button
          type="button"
          onClick={nextStep}
          disabled={!lookupResult}
          className="bg-cyan-600 hover:bg-cyan-500 text-white"
        >
          Volgende
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
