import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Catalog from "@/pages/Catalog";
import ProductDetail from "@/pages/ProductDetail";
import StoreCreate from "@/pages/StoreCreate";
import StoreDetail from "@/pages/StoreDetail";
import Sell from "@/pages/Sell";
import Messages from "@/pages/Messages";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login">
        {() => <Auth mode="login" />}
      </Route>
      <Route path="/signup">
        {() => <Auth mode="signup" />}
      </Route>
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/store/create" component={StoreCreate} />
      <Route path="/store/:id" component={StoreDetail} />
      <Route path="/sell" component={Sell} />
      <Route path="/messages/:id" component={Messages} />
      <Route path="/messages" component={Messages} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
