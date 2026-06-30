import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";
import { AnimalAvatar } from "@/components/AnimalAvatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { searchAnimals } from "@/api/searchAnimals";

/**
 * Global, cross-farm animal search. Opens a command palette (button or ⌘K / Ctrl+K),
 * searches the user's animals by tag number, name or breed, and jumps straight to
 * the animal detail page. Server-side filtered — cmdk's own filtering is disabled.
 */
export function GlobalSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  // ⌘K / Ctrl+K to open from anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Debounce the typed query so we don't hit the API on every keystroke
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

  // Reset state when the dialog closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebounced("");
    }
  }, [open]);

  const {
    data: results = [],
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["global-animal-search", debounced],
    queryFn: () => searchAnimals(debounced),
    enabled: open && debounced.length >= 2,
    staleTime: 30_000,
  });

  const handleSelect = (farmId: string, animalId: string) => {
    setOpen(false);
    navigate(`/farms/${farmId}/animals/${animalId}`);
  };

  const showHint = debounced.length < 2;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-9 gap-2 px-3 text-muted-foreground sm:w-56 sm:justify-start"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">Search animals…</span>
        <kbd className="ml-auto hidden items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
          ⌘K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 shadow-lg">
          <Command shouldFilter={false} className="[&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5">
            <CommandInput
              placeholder="Search by tag number, name or breed…"
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {isFetching && (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching…
                </div>
              )}

              {!isFetching && showHint && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Type at least 2 characters to search across all your farms.
                </div>
              )}

              {!isFetching && isError && !showHint && (
                <div className="py-6 text-center text-sm text-destructive">
                  Search failed. Please try again.
                </div>
              )}

              {!isFetching && !isError && !showHint && results.length === 0 && (
                <CommandEmpty>No animals found for “{debounced}”.</CommandEmpty>
              )}

              {!isFetching && results.length > 0 && (
                <CommandGroup heading="Animals">
                  {results.map((a) => (
                    <CommandItem
                      key={a.id}
                      value={a.id}
                      onSelect={() => handleSelect(a.farmId, a.id)}
                      className="flex items-center gap-3"
                    >
                      <AnimalAvatar
                        photoUrl={a.photoUrl}
                        name={a.name}
                        animalType={a.animalType}
                        className="h-9 w-9"
                        iconClassName="h-4 w-4"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium">{a.name || "Unnamed"}</span>
                          <span className="shrink-0 font-mono text-xs text-muted-foreground">
                            #{a.tagNumber}
                          </span>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {a.animalType}
                          {a.breed ? ` · ${a.breed}` : ""}
                          {a.farm?.name ? ` · ${a.farm.name}` : ""}
                        </p>
                      </div>
                      <Badge
                        variant={
                          a.status === "Deceased"
                            ? "destructive"
                            : a.status === "Sold"
                            ? "outline"
                            : "secondary"
                        }
                        className="shrink-0 text-xs"
                      >
                        {a.status}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
