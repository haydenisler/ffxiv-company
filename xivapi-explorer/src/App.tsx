import { Fragment } from "react";
import { Link, Route, Switch, useLocation } from "wouter";

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { GameData } from "@/pages/GameData";
import { navigationData } from "@/config/navigation";

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
