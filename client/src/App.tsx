import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import NotFound from "./pages/NotFound";

/** NOVA FORMA style: cinematic editorial architecture, graphite / milk / bronze, asymmetric layouts. */
function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/projects/:slug" component={ProjectDetail} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider><Toaster /><Router /></TooltipProvider>
    </ThemeProvider>
  </ErrorBoundary>;
}
