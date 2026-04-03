import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { getDb, saveDb } from '@/services/database';

export default function Signup() {
  const navigate = useNavigate();
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
      const db = await getDb();

      // Create customers table if not exists
      db.run(`
        CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          phone TEXT NOT NULL,
          password TEXT NOT NULL,
          created_at TEXT DEFAULT (datetime('now'))
        )
      `);

      // Check if email already exists
      const existing = db.exec('SELECT id FROM customers WHERE email = ?', [email]);
      if (existing.length > 0 && existing[0].values.length > 0) {
        setError('An account with this email already exists. Please login.');
        setLoading(false);
        return;
      }

      db.run(
        'INSERT INTO customers (name, email, phone, password) VALUES (?, ?, ?, ?)',
        [name, email, phone, password]
      );
      saveDb();

      setSuccess('Account created successfully! You can now login.');
      setTimeout(() => {
        setIsLogin(true);
        setSuccess('');
      }, 2000);
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
      const db = await getDb();

      // Ensure table exists
      db.run(`
        CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          phone TEXT NOT NULL,
          password TEXT NOT NULL,
          created_at TEXT DEFAULT (datetime('now'))
        )
      `);

      const result = db.exec('SELECT id, name, email FROM customers WHERE email = ? AND password = ?', [email, password]);
      if (!result.length || !result[0].values.length) {
        setError('Invalid email or password.');
        setLoading(false);
        return;
      }

      const user = result[0].values[0];
      localStorage.setItem('customer_logged_in', JSON.stringify({ id: user[0], name: user[1], email: user[2] }));
      navigate('/');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
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
                  placeholder={isLogin ? 'Enter your password' : 'Create a password'} required
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
