import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/profile';
  const [isLogin, setIsLogin] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Update profile with phone number
      if (data.user) {
        await supabase
          .from('profiles')
          .update({ name, phone })
          .eq('user_id', data.user.id);
      }

      setSuccess('Account created successfully! You are now logged in.');
      setTimeout(() => navigate(redirectTo), 1500);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      navigate(redirectTo);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });

      if (result.error) {
        setError('Google sign-in failed. Please try again.');
        setLoading(false);
        return;
      }

      if (result.redirected) {
        return;
      }

      navigate(redirectTo);
    } catch {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar variant="light" />
      <div className="flex-1 flex items-center justify-center px-6 pt-24 pb-12">
        <div className="bg-card rounded-2xl shadow-2xl p-8 md:p-10 max-w-md w-full border border-border">
          <div className="flex items-center justify-center mb-6">
            <div className="hotel-gradient p-4 rounded-full">
              <User className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>

          <h2 className="font-display text-2xl text-center mb-1">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-8">
            {isLogin ? 'Login to your Radison Hotels account' : 'Sign up to book your next luxury stay'}
          </p>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-600 text-sm rounded-lg p-3 mb-4">
              {success}
            </div>
          )}

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-input rounded-lg px-4 py-3 bg-background text-foreground hover:bg-accent/50 transition-colors mb-4 disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or</span></div>
          </div>

          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm font-medium mb-1 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Enter your full name" required
                    className="w-full border border-input rounded-lg px-4 py-3 pl-10 bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="Enter your email" required
                  className="w-full border border-input rounded-lg px-4 py-3 pl-10 bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="text-sm font-medium mb-1 block">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="Enter your phone number" required
                    className="w-full border border-input rounded-lg px-4 py-3 pl-10 bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-1 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder={isLogin ? 'Enter your password' : 'Create a password (min 6 chars)'} required minLength={6}
                  className="w-full border border-input rounded-lg px-4 py-3 pl-10 pr-10 bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLogin ? (
              <>Don't have an account?{' '}
                <button onClick={() => { setIsLogin(false); setError(''); }} className="text-primary font-medium hover:underline">
                  Sign Up
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => { setIsLogin(true); setError(''); }} className="text-primary font-medium hover:underline">
                  Login
                </button>
              </>
            )}
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
