import { Suspense, useMemo, useState } from "react";
import useSWR from "swr";

import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator"



const XIVAPI_BASE_URL = "https://xivapi.com";

function Loading() {
  return (
    <div className="h-full flex items-center">
      <p className="text-sm text-muted-foreground">
        Loading...
      </p>
    </div>
  );
}


function Content() {
  return (
    <div className="flex-shrink-0 flex-grow bg-slate-200"></div>
  );
}

function SidebarRow({ content }: { content: string; url?: string; }) {
  return (
    <div className="w-full border rounded-sm px-2 py-1 mb-2 hover:cursor-pointer hover:shadow hover:bg-slate-50 transition-all">
      <span>{content}</span>
    </div>
  );
}

function Sidebar() {
  const { data: gameContent } = useSWR<string[]>(`${XIVAPI_BASE_URL}/content`, null, { suspense: true });

  const [search, setSearch] = useState('');

  const filteredContent = useMemo(() => {
    return gameContent?.filter((c) => c.toLowerCase().includes(search.toLowerCase()));
  }, [gameContent, search]);

  return (
    <div className="flex-shrink-0 border-r h-full px-4 pt-4 w-80">
      <Suspense fallback={<Loading />}>
        <Input 
          type="text" 
          placeholder="Search..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
        />
        <Separator className="my-4" />
        <ScrollArea className="h-full">
          {filteredContent?.map((c: string) => <SidebarRow content={c} />)}
        </ScrollArea>
      </Suspense>
    </div>
  );
}

function Main() {
  return (
    <div className="flex-shrink-0 flex-grow flex h-0">
      <Sidebar />
      <Content />
    </div>
  );
}

function Header() {
  return (
    <div className="w-full flex-shrink-0 p-4 border-b">
      <h1>xivapi explorer</h1>
    </div>
  );
}

function Layout() {
  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col">
      <Header />
      <Main />
    </div>
  );
}

function App() {
  return (
    <Layout />
  );
}

export default App;
