import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { GoogleLogin } from '@react-oauth/google';
import { Music2 } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { LOGIN_MUTATION, REGISTER_MUTATION, GOOGLE_AUTH_MUTATION } from '../gql';

interface AuthPayload {
  token: string;
  user: { id: string; email: string };
}

export default function LoginForm() {
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [loginMutation,      { loading: loggingIn }]    = useMutation<{ login: AuthPayload }>(LOGIN_MUTATION);
  const [registerMutation,   { loading: registering }]  = useMutation<{ register: AuthPayload }>(REGISTER_MUTATION);
  const [googleAuthMutation, { loading: googleLoading }] = useMutation<{ googleLogin: AuthPayload }>(GOOGLE_AUTH_MUTATION);
  const loading = loggingIn || registering;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'login') {
        const res = await loginMutation({ variables: { email, password } });
        const payload = res.data?.login;
        if (payload) login(payload.token, payload.user);
      } else {
        const res = await registerMutation({ variables: { email, password } });
        const payload = res.data?.register;
        if (payload) login(payload.token, payload.user);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <div className="login-page">
      <div className={`login-card${googleLoading ? ' login-card--loading' : ''}`}>
        {googleLoading && (
          <div className="login-spinner-overlay" aria-label="Signing in with Google…">
            <div className="spinner" />
            <p className="spinner-label">Signing in…</p>
          </div>
        )}

        <div className="header-title" style={{ justifyContent: 'center', marginBottom: 4 }}>
          <Music2 size={22} />
          <h1 style={{ fontSize: 22, fontWeight: 500 }}>Sarah Alex Jam</h1>
        </div>
        <p className="header-sub" style={{ textAlign: 'center', marginBottom: '1.75rem', paddingLeft: 0 }}>
          {mode === 'login' ? 'Sign in to your account' : 'Create an account'}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr', marginBottom: 12 }}>
            <label className="form-field">
              <span>Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </label>
            <label className="form-field">
              <span>Password</span>
              <input
                type="password"
                placeholder={mode === 'register' ? 'At least 8 characters' : ''}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={mode === 'register' ? 8 : undefined}
              />
            </label>
          </div>

          {error && (
            <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</p>
          )}

          <button
            className="btn btn--primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '9px 13px' }}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '1.25rem 0 0.75rem' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-strong)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>or continue with</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-strong)' }} />
        </div>

        <div className="google-btn-wrap">
          <GoogleLogin
            onSuccess={async ({ credential }) => {
              if (!credential) return;
              setError(null);
              try {
                const res = await googleAuthMutation({ variables: { idToken: credential } });
                const payload = res.data?.googleLogin;
                if (payload) login(payload.token, payload.user);
              } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Google sign-in failed');
              }
            }}
            onError={() => setError('Google sign-in failed')}
            shape="rectangular"
            size="large"
            width="300"
          />
        </div>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: 13, color: 'var(--text-2)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            className="btn btn--ghost"
            style={{ padding: '2px 8px', fontSize: 13 }}
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
          >
            {mode === 'login' ? 'Register' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
