import { Loading } from "@/components/Loading";
import { XIVAPI_BASE_URL } from "@/config/dataUrls";
import { Suspense, useEffect } from "react";
import useSWR from "swr";
import { useState, useMemo } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "react-error-boundary";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";


interface ServerPickerProps {
  servers: { value: string, label: string }[],
  onServerChange: (server: string) => void,
}

export function ServerPicker({ servers, onServerChange }: ServerPickerProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    onServerChange(value);
  }, [onServerChange, value]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? servers.find((server) => server.value === value)?.label
            : "Search server..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search server..." />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandGroup>
            <ScrollArea className={'[&>[data-radix-scroll-area-viewport]]:max-h-[200px]'}>
              {servers.map((server) => (
                <CommandItem
                  key={server.value}
                  value={server.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === server.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {server.label}
                </CommandItem>
              ))}
            </ScrollArea>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}


function FreeCompanySearch() {
  const { data } = useSWR<string[]>(`${XIVAPI_BASE_URL}/servers`, null, { suspense: true });

  const servers = useMemo(() => {
    return data?.map((d) => ({ value: d.toLowerCase(), label: d })) ?? [];
  }, [data]);

  const [selectedServer, setSelectedServer] = useState<string | null>(null);

  const handleServerChange = (server: string) => { setSelectedServer(server) };

  console.log(selectedServer);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center overflow-auto">
      <ErrorBoundary fallback={<h1>Oop!</h1>}>
        <Suspense fallback={<Loading />}>
          <ServerPicker servers={servers} onServerChange={handleServerChange} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export function FreeCompany() {
  return (
    <div className="flex-shrink-0 flex-grow flex h-0 bg-slate-50">
      <FreeCompanySearch />
    </div>
  );
}