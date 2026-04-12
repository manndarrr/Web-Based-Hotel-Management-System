import { useNavigate } from 'react-router-dom';
import { useHotel } from '@/context/HotelContext';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import { CheckCircle, Receipt, CreditCard, Sparkles } from 'lucide-react';

export default function Checkout() {
  const { activeBookingId, checkout } = useHotel();
  const navigate = useNavigate();
  const [billData, setBillData] = useState<ReturnType<typeof checkout>>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (activeBookingId) {
      const data = checkout(activeBookingId);
      setBillData(data);
    }
  }, []);

  if (!billData) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar variant="light" />
        <div className="flex-1 flex items-center justify-center pt-24">
          <AnimatedSection>
            <div className="text-center glass rounded-2xl p-14 border border-border/50 shadow-xl">
              <h2 className="font-display text-2xl mb-4 text-foreground">No Active Stay</h2>
              <button onClick={() => navigate('/')} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium">Go Home</button>
            </div>
          </AnimatedSection>
        </div>
        <Footer />
      </div>
    );
  }

  const { stay, room, foodItems, roomTotal, foodTotal, grandTotal } = billData;

  const handlePay = () => {
    setShowSuccess(true);
    setTimeout(() => navigate('/'), 3000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar variant="light" />
        <div className="flex-1 flex items-center justify-center pt-24">
          <AnimatedSection>
            <div className="text-center glass rounded-2xl p-14 border border-border/50 shadow-2xl max-w-md">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6 animate-scale-in">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="font-display text-3xl text-foreground mb-3">Payment Successful!</h2>
              <p className="text-muted-foreground mb-2">Thank you for staying with us, {stay.name}.</p>
              <p className="text-muted-foreground text-sm">Redirecting you home...</p>
            </div>
          </AnimatedSection>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar variant="light" />
      <div className="max-w-2xl mx-auto px-6 pt-28 pb-20 flex-1 w-full">
        <AnimatedSection>
          <div className="bg-card rounded-2xl shadow-2xl overflow-hidden border border-border/50">
            {/* Header */}
            <div className="hotel-gradient p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 shimmer" />
              <div className="relative z-10">
                <Sparkles className="h-6 w-6 text-primary-foreground/60 mx-auto mb-3" />
                <h1 className="font-display text-3xl text-primary-foreground mb-1">Radison Hotels</h1>
                <p className="text-primary-foreground/60 text-sm flex items-center justify-center gap-2">
                  <Receipt className="h-4 w-4" /> Final Guest Invoice
                </p>
              </div>
            </div>

            <div className="p-8 md:p-10">
              {/* Guest info */}
              <div className="grid grid-cols-2 gap-4 text-sm mb-8 p-5 rounded-xl bg-accent/30 border border-border/30">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Guest</p>
                  <p className="font-medium text-foreground">{stay.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <p className="font-medium text-foreground">{stay.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Location</p>
                  <p className="font-medium text-foreground">Radison {room.location}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Room</p>
                  <p className="font-medium text-foreground">{room.type}</p>
                </div>
              </div>

              {/* Line items */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <div>
                    <p className="text-sm font-medium text-foreground">Accommodation</p>
                    <p className="text-xs text-muted-foreground">{stay.nights} nights × ₹{room.price.toLocaleString()}</p>
                  </div>
                  <span className="font-semibold text-foreground">₹{roomTotal.toLocaleString()}</span>
                </div>

                {foodItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-accent/20 border border-border/20">
                    <p className="text-sm text-foreground">{item.itemName}</p>
                    <span className="text-sm text-muted-foreground">₹{item.price.toLocaleString()}</span>
                  </div>
                ))}

                {foodItems.length > 0 && (
                  <div className="flex items-center justify-between px-4 pt-2">
                    <p className="text-sm text-muted-foreground">Food Subtotal</p>
                    <span className="text-sm font-medium text-foreground">₹{foodTotal.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Grand total */}
              <div className="border-t-2 border-foreground/10 pt-6 mb-8">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-foreground">Total Balance Due</p>
                  <p className="font-display text-3xl text-primary font-bold">₹{grandTotal.toLocaleString()}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handlePay}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <CreditCard className="h-5 w-5" /> Pay & Complete Checkout
                </button>
                <button onClick={() => navigate('/')} className="w-full text-muted-foreground text-sm hover:text-foreground transition-colors py-2">
                  Return to Home
                </button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
      <Footer />
    </div>
  );
}
