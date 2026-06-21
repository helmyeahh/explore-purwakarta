"use client";

import { useGoogleLogin } from '@react-oauth/google';
import { useData, User } from '@/contexts/DataContext';
import { Button } from '@/components/ui/Button';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

export function GoogleLoginButton() {
  const { user, setUser } = useData();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const data = await res.json();
        
        const newUser: User = {
          id: data.sub,
          name: data.name,
          email: data.email,
          picture: data.picture,
          role: data.email === 'admin@explorepurwakarta.com' ? 'admin' : 'user'
        };
        
        setUser(newUser);
      } catch (err) {
        console.error('Failed to fetch user info', err);
      }
    },
  });

  const logout = () => {
    setUser(null);
  };

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/profile" className="flex items-center gap-2 hover:bg-gray-100 p-1 rounded-full pr-3 transition-colors">
          <img 
            src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
            alt={user.name}
            className="w-8 h-8 rounded-full border border-gray-200"
          />
          <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={logout} title="Logout">
          <LogOut className="w-5 h-5 text-gray-500" />
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={() => login()} className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50">
      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
      <span>Login</span>
    </Button>
  );
}
