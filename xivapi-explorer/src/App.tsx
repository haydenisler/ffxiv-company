import { Fragment, Suspense, useMemo, useState } from "react";
import useSWR from "swr";
import { create } from 'zustand';
import { Link, Route, Switch, useLocation } from "wouter";

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
  { name: 'Game Data', url: '/', disabled: false, },
  { name: 'Character', url: '/character', disabled: true  },
  { name: 'Free Company', url: '/freecompany', disabled: false },
  { name: 'Linkshell', url: '/linkshell', disabled: true },
  { name: 'PvP Team', url: '/pvpteam', disabled: true },
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

interface ContentRowData { 
  name: string | null; 
  url: string;
} 

interface GameContentState {
  contentId: string;
  setContentId: (name: string) => void;
  contentPage: number;
  setContentPage: (page: number) => void;
  contentRowData: ContentRowData | null;
  setContentRowData: (data: ContentRowData | null) => void;
}

const useGameContentStore = create<GameContentState>()(
  (set) => ({
    contentId: '',
    setContentId: (name) => set(() => ({ contentId: name })),
    contentPage: 1,
    setContentPage: (page) => set(() => ({ contentPage: page })),
    contentRowData: null,
    setContentRowData: (data) => set(() => ({ contentRowData: data })),
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

function GameDataContentDrilled () {
  const contentName = useGameContentStore((state) => state.contentId);
  const contentRowData = useGameContentStore((state) => state.contentRowData);
  const setContentRowData = useGameContentStore((state) => state.setContentRowData);

  const { data, isLoading } = useSWR<Record<string, unknown>>(contentRowData ? `${XIVAPI_BASE_URL}${contentRowData?.url}`: null);

  const handleBack = () => setContentRowData(null);

  return (
    <div className="flex-shrink-0 flex-grow bg-slate-50 p-4 h-full flex flex-col gap-y-4">
      <div className="flex gap-x-4 items-center">
        <Button variant="outline" onClick={handleBack}>{"<- Back"}</Button>
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          { `${contentName} -> ${ contentRowData?.name ?? contentRowData?.url ?? ''}`}
        </h3>
      </div>
      <ScrollArea  className="border rounded bg-white p-2 flex-grow ">
        {isLoading ? <Loading /> : (
          <pre className="text-sm font-medium leading-none">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </ScrollArea>
    </div>
  );
}

function GameDataContent() {
  const contentName = useGameContentStore((state) => state.contentId);
  const setContentRowData = useGameContentStore((state) => state.setContentRowData);
  const contentPage = useGameContentStore((state) => state.contentPage);
  const setContentPage = useGameContentStore((state) => state.setContentPage);

  const { data, isLoading } = useSWR<ContentResponse>(contentName ? `${XIVAPI_BASE_URL}/${contentName}?page=${contentPage}`: null);

  const handlePrev = () => setContentPage(contentPage - 1);
  const handleNext = () => setContentPage(contentPage + 1);

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
                        <TableRow className="hover:cursor-pointer" onClick={() => setContentRowData({ name: d.Name, url: d.Url })}>
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
                    <Button onClick={handlePrev} disabled={contentPage === 1} variant="outline">Prev</Button>
                    <p className="text-sm text-muted-foreground">
                      {`Page ${contentPage} of ${data?.Pagination?.PageTotal}`}
                    </p>
                    <Button onClick={handleNext} disabled={contentPage === data?.Pagination?.PageTotal} variant="outline">Next</Button>
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
  const contentName = useGameContentStore((state) => state.contentId);
  const setContentName = useGameContentStore((state) => state.setContentId);
  const setContentRowData = useGameContentStore((state) => state.setContentRowData);
  const setContentPage = useGameContentStore((state) => state.setContentPage);


  return (
    <div 
      className={cn(
        contentName === content && "bg-blue-50 shadow",
        "w-full border rounded-sm px-2 py-1 mb-2 hover:cursor-pointer hover:shadow hover:bg-slate-50 transition-all"
      )}
      onClick={() => { 
        setContentName(content);
        setContentRowData(null);
        setContentPage(1);
      }}
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
          {filteredContent?.map((c: string, i) => <GameDataSidebarRow key={i} content={c} />)}
        </ScrollArea>
      </Suspense>
    </div>
  );
}

function GameData() {
  const contentRowData = useGameContentStore((state) => state.contentRowData);

  return (
    <div className="flex-shrink-0 flex-grow flex h-0">
      <GameDataSidebar />
      { contentRowData ? <GameDataContentDrilled /> : <GameDataContent /> }
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
  const [location] = useLocation();

  return (
    <div className="px-4 py-2 border-b flex gap-x-4">
      {navigationData.map((nav, i) => {
        return (
          <Fragment key={i}>
            <Link 
              href={nav.url} 
              className={cn(
                nav.disabled && 'text-slate-300 pointer-events-none',
                location === nav.url && 'underline'
              )}
            >
                {nav.name}
            </Link>
            <Separator orientation="vertical" />
          </Fragment>
        );
      })}
    </div>
  );
}

function App() {
  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col">
      <Header />
      <Navigation />
      <Switch>
        <Route path="/" component={GameData}/>
        <Route>{'404 :('}</Route>
      </Switch>
    </div>
  );
}

export default App;
