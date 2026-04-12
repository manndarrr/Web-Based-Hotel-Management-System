import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HotelProvider } from "@/context/HotelContext";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Location from "./pages/Location";
import Book from "./pages/Book";
import Dashboard from "./pages/Dashboard";
import Menu from "./pages/Menu";
import FoodMenu from "./pages/FoodMenu";
import Checkout from "./pages/Checkout";
import StaffLogin from "./pages/StaffLogin";
import StaffDashboard from "./pages/StaffDashboard";
import Destinations from "./pages/Destinations";
import Hotels from "./pages/Hotels";
import BookNow from "./pages/BookNow";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import BookingConfirmation from "./pages/BookingConfirmation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <HotelProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/book-now" element={<BookNow />} />
            <Route path="/location/:loc" element={<Location />} />
            <Route path="/book/:loc/:roomType" element={<Book />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/food-menu" element={<FoodMenu />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/staff/login" element={<StaffLogin />} />
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/booking-confirmation" element={<BookingConfirmation />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </HotelProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
