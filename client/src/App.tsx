import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import CursorRing from "./components/CursorRing";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));

/** NOVA FORMA style: cinematic editorial architecture, graphite / milk / bronze, asymmetric layouts. */
function Router() {
  // make sure to consider if you need authentication for certain routes
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/projects/:slug"><Suspense fallback={<div className="route-loader" role="status">Загружаем проект…</div>}><ProjectDetail /></Suspense></Route>
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider><Toaster /><CursorRing /><Router /></TooltipProvider>
    </ThemeProvider>
  </ErrorBoundary>;
}
