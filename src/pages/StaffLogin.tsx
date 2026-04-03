import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotel } from '@/context/HotelContext';
// Navbar removed from staff pages
import Footer from '@/components/Footer';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function StaffLogin() {
  const { staffLogin } = useHotel();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (staffLogin(password)) {
      navigate('/staff/dashboard');
    } else {
      setError('Invalid credentials. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* No navbar on staff pages */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="bg-card rounded-lg shadow-lg p-8 md:p-10 max-w-md w-full border border-border">
          <div className="flex items-center justify-center mb-6">
            <div className="hotel-gradient p-4 rounded-full">
              <Lock className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h2 className="font-display text-2xl text-center mb-1">Employee Portal</h2>
          <p className="text-center text-muted-foreground text-sm mb-8">Enter your staff credentials to continue.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-1 block">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter staff password" required
                  className="w-full border border-input rounded-md px-4 py-3 pr-10 bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {error && <p className="text-destructive text-xs mt-2">{error}</p>}
            </div>
            <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors">
              Sign In
            </button>
            <p className="text-center text-xs text-muted-foreground">Demo password: <code className="bg-muted px-1 py-0.5 rounded text-foreground">admin123</code></p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
