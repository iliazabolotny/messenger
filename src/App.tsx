import ChatApp from './components/ChatApp';
import LoginScreen from './components/LoginScreen';
import { useAppSelector } from './helpers';

export default function App() {
  const session = useAppSelector((state) => state.session.data);

  return session ? <ChatApp session={session} /> : <LoginScreen />;
}
