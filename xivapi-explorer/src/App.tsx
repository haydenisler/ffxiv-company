import { Suspense, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { create } from 'zustand';

import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const XIVAPI_BASE_URL = "https://xivapi.com";

const navigationData = [
  { name: 'Game Data', url: '/gamedata' },
  { name: 'Character', url: '/character' },
  { name: 'Free Company', url: '/freecompany' },
  { name: 'Linkshell', url: '/linkshell' },
  { name: 'PvP Team', url: '/pvpteam' },
];

interface Pagination {
  Page: number;
  PageNext: number | null;
  PagePrev: number | null;
  PageTotal: number;
  Results: number;
  ResultsPerPage: number;
  ResultsTotal: number;
}

interface ContentResult {
  ID: number;
  Icon: string | null;
  Name: string | null;
  Url: string;
}

interface ContentResponse {
  Pagination: Pagination;
  Results: ContentResult[];
}

interface GameContentState {
  contentName: string;
  setContentName: (name: string) => void;
}

const useGameContentStore = create<GameContentState>()(
  (set) => ({
    contentName: '',
    setContentName: (name) => set(() => ({ contentName: name })),
  })
);

function Loading() {
  return (
    <div className="h-full justify-center flex items-center">
      <p className="text-sm text-muted-foreground">
        Loading...
      </p>
    </div>
  );
}

function GameDataContent() {
  const contentName = useGameContentStore((state) => state.contentName);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useSWR<ContentResponse>(contentName ? `${XIVAPI_BASE_URL}/${contentName}?page=${currentPage}`: null);

  const handlePrev = () => setCurrentPage((prev) => prev - 1);
  const handleNext = () => setCurrentPage((prev) => prev + 1);


  // Reset the page number when navagating away from the current game content
  useEffect(() => {
    setCurrentPage(1);
  }, [contentName]);

  return (
    <div className="flex-shrink-0 flex-grow bg-slate-50">
      {contentName ? (
        <div className="h-full p-4 flex flex-col">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4">
            { contentName }
          </h3>
          { isLoading ? (
              <Loading />
            ) : (
              <>
                <ScrollArea className="border bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Id</TableHead>
                        <TableHead>Icon</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Url</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.Results.map((d) => (
                        <TableRow className="hover:cursor-pointer">
                          <TableCell className="font-medium">{d.ID}</TableCell>
                          <TableCell>
                            {d.Icon ? (
                              <img src={`${XIVAPI_BASE_URL}${d.Icon}`} />
                            ) : '-'}
                          </TableCell>
                          <TableCell>{d.Name ?? '-'}</TableCell>
                          <TableCell>{d.Url}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
                {(data?.Pagination?.PageTotal ?? 0) > 1 ? (
                  <div className="w-full flex items-center align-middle justify-end mt-4 gap-x-4">
                    <Button onClick={handlePrev} disabled={currentPage === 1} variant="outline">Prev</Button>
                    <p className="text-sm text-muted-foreground">
                      {`Page ${currentPage} of ${data?.Pagination?.PageTotal}`}
                    </p>
                    <Button onClick={handleNext} disabled={currentPage === data?.Pagination?.PageTotal} variant="outline">Next</Button>
                  </div>
                ) : null}
              </>
            )}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-sm text-muted-foreground">
            {"<- select some game data."}
          </span>
        </div>
      )}
    </div>
  );
}

function GameDataSidebarRow({ content }: { content: string; url?: string; }) {
  const contentName = useGameContentStore((state) => state.contentName);
  const setContentName = useGameContentStore((state) => state.setContentName);

  return (
    <div 
      className={cn(
        contentName === content && "bg-blue-50 shadow",
        "w-full border rounded-sm px-2 py-1 mb-2 hover:cursor-pointer hover:shadow hover:bg-slate-50 transition-all"
      )}
      onClick={() => setContentName(content)}
    >
      <span>{content}</span>
    </div>
  );
}

function GameDataSidebar() {
  const { data: gameContent } = useSWR<string[]>(`${XIVAPI_BASE_URL}/content`, null, { suspense: true });

  const [search, setSearch] = useState('');

  const filteredContent = useMemo(() => {
    return gameContent?.filter((c) => c.toLowerCase().includes(search.toLowerCase()));
  }, [gameContent, search]);

  return (
    <div className="flex-shrink-0 border-r h-full p-4 pt-4 w-80">
      <Suspense fallback={<Loading />}>
        <Input 
          type="text" 
          placeholder="Search..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
        />
        <Separator className="my-4" />
        <ScrollArea className="h-full">
          {filteredContent?.map((c: string) => <GameDataSidebarRow content={c} />)}
        </ScrollArea>
      </Suspense>
    </div>
  );
}

function GameData() {
  return (
    <div className="flex-shrink-0 flex-grow flex h-0">
      <GameDataSidebar />
      <GameDataContent />
    </div>
  );
}

function Header() {
  return (
    <div className="w-full flex-shrink-0 p-4 border-b flex items-center">
      <h1 className="flex-shrink-0">xivapi explorer - :)</h1>
      <Input className="w-52 ml-auto" type="text" placeholder="Search API" disabled />
    </div>
  );
}

function Navigation() {
  return (
    <div className="px-4 py-2 border-b flex gap-x-4">
      {navigationData.map((nav, i) => {
        return (
          <>
            <a key={i}>{nav.name}</a>
            <Separator key={`${i}-s`} orientation="vertical" />
          </>
        );
      })}
    </div>
  );
}

function Layout() {
  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col">
      <Header />
      <Navigation />
      <GameData />
    </div>
  );
}

function App() {
  return (
    <Layout />
  );
}

export default App;
