import './App.css';
import { useAuth } from './AuthContext';
import HumanOnboardingForm from './components/HumanOnboardingForm';
import LoginForm from './components/LoginForm';
import ProfilePage from './components/ProfilePage';

export default function App() {
  const { user } = useAuth();

  if (!user) return <LoginForm />;

  if (!user.human) return <HumanOnboardingForm />;

  return <ProfilePage />;
}
