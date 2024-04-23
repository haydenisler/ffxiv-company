import { useState, ReactNode, useMemo, ChangeEvent } from 'react';
import useSWR, { SWRConfig } from 'swr';


import './App.scss';

// --- Constants ---

const XIVAPI_BASE_ROUTE = 'https://xivapi.com';

// --- API Types ---

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

// --- Utility Components ---

interface RequestHandlerProps {
  isLoading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
  children?: ReactNode | undefined;
}

function RequestHandler ({ isLoading, error, children }: RequestHandlerProps): ReactNode {
  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <>
      {children}
    </>
  );
}

// --- ContentItem ---

interface ContentItemProps extends ContentResult {}

function ContentItem({ ID: id, Icon: icon, Name: name, Url: url }: ContentItemProps) {
  const [open, setOpen] = useState(false);

  const { data: content, isLoading, error } = useSWR<ContentResponse>(open ? `${XIVAPI_BASE_ROUTE}${url}` : null);

  const handleClick = () => setOpen((prev) => !prev);

  return (
    <div className="content-item" onClick={handleClick}>
      <div>{id}</div>
      {icon ? (<img src={`${XIVAPI_BASE_ROUTE}${icon}`} />) : (<span>-</span>) }
      {name ? (<div>{name}</div>) : (<span>-</span>)}
      <div>{url}</div>
      <div className="content-item__data">
        {open ? (
          <RequestHandler isLoading={isLoading} error={error}>
            <pre>{JSON.stringify(content, null, 2)}</pre>
          </RequestHandler>
        ) : null}
      </div>
    </div>
  );
}

// --- ContentArea ---

interface ContentAreaProps {
  data: string;
}

function ContentArea({ data }: ContentAreaProps) {
  const [open, setOpen] = useState(false);

  const { data: content, isLoading, error } = useSWR<ContentResponse>(open ? `${XIVAPI_BASE_ROUTE}/${data}` : null);

  const handleClick = () => setOpen((prev) => !prev);

  return (
    <div className="content-area">
      <div className="content-area__title" onClick={handleClick}>
        { data }
      </div>
      {open ? (
        <div className="content-area__results">
          <div className="content-area__header">
            <div>id</div>
            <div>icon</div>
            <div>name</div>
            <div>url</div>
          </div>
          <RequestHandler isLoading={isLoading} error={error} >
            {content?.Results.map((result) => <ContentItem key={result.ID} {...result} />)}
          </RequestHandler>
        </div>
      ) : null}
    </div>
  );
}

// --- Main ---

function Main() {
  const [search, setSearch] = useState('');

  const { data: content, isLoading, error } = useSWR(`${XIVAPI_BASE_ROUTE}/content`);

  const filteredContent = useMemo(() => {
    if (!content) return content;

    return content.filter((c: string) => c.toLowerCase().includes(search.toLowerCase()));
  }, [content, search]);
  
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  } 

  return (
    <>
      <input type="text" value={search} onChange={handleSearch}></input>
      <RequestHandler isLoading={isLoading} error={error}>
        {filteredContent?.map((area: string) => 
          <ContentArea key={area} data={area} />
        )}
      </RequestHandler>
    </>
  );
}

function App() {
  return (
    <SWRConfig value={{
      fetcher: (resource, init) => fetch(resource, init).then(res => res.json()),
    }}>
      <Main />
    </SWRConfig>
  );
}

export default App
