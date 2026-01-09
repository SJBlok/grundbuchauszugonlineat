import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { searchKatastralgemeinden, type Katastralgemeinde } from "@/data/katastralgemeinden";

interface KatastralgemeindeComboboxProps {
  value: string;
  onChange: (value: string, kg?: Katastralgemeinde) => void;
  bundesland?: string;
  placeholder?: string;
}

export function KatastralgemeindeCombobox({
  value,
  onChange,
  bundesland,
  placeholder = "Katastralgemeinde suchen...",
}: KatastralgemeindeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Katastralgemeinde[]>([]);

  useEffect(() => {
    const filtered = searchKatastralgemeinden(searchQuery, bundesland);
    setResults(filtered);
  }, [searchQuery, bundesland]);

  // Also search when component mounts
  useEffect(() => {
    setResults(searchKatastralgemeinden("", bundesland));
  }, [bundesland]);

  const selectedKg = results.find((kg) => kg.name === value) || 
    searchKatastralgemeinden(value, undefined).find((kg) => kg.name === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value ? (
            <span className="truncate">
              {selectedKg ? `${selectedKg.name} (${selectedKg.bezirk})` : value}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Suchen nach Name oder KG-Nr..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              <div className="py-4 text-center text-sm">
                <p className="text-muted-foreground">Keine Katastralgemeinde gefunden.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Sie können den Namen auch manuell eingeben.
                </p>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {results.map((kg) => (
                <CommandItem
                  key={kg.kg}
                  value={kg.name}
                  onSelect={() => {
                    onChange(kg.name, kg);
                    setOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === kg.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{kg.name}</span>
                    <span className="text-xs text-muted-foreground">
                      KG {kg.kg} · {kg.bezirk}, {kg.bundesland}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        <div className="border-t p-2">
          <p className="text-xs text-muted-foreground text-center">
            Tipp: Sie können auch direkt die KG-Nummer eingeben
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
