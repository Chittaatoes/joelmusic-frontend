import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import LandingPage from "@/pages/landing";
import BookingPage from "@/pages/booking";
import BookingFormPage from "@/pages/booking-form";
import SewaPage from "@/pages/sewa";

import AdminLoginPage from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminPayments from "@/pages/admin-payments";
import AdminLayout from "@/components/admin-layout";

import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* PUBLIC ROUTES */}
      <Route path="/" component={LandingPage} />
      <Route path="/booking" component={BookingPage} />
      <Route path="/booking/form" component={BookingFormPage} />
      <Route path="/sewa" component={SewaPage} />

      {/* ADMIN DASHBOARD (HARUS DI ATAS LOGIN) */}
      <Route path="/admin/dashboard">
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </Route>

      <Route path="/admin/payments">
        <AdminLayout>
          <AdminPayments />
        </AdminLayout>
      </Route>

      {/* ADMIN LOGIN (PALING BAWAH AGAR TIDAK MENANG MATCH DULUAN) */}
      <Route path="/admin" component={AdminLoginPage} />

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;