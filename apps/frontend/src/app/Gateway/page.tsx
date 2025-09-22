'use client';

import { LogoutButton } from '@/components/auth/LogoutButton';
import { ForgotPasswordModal } from '@/components/Modal/ForgotPasswordModal';
import { LoginModal } from '@/components/Modal/LoginModal';
import { RegisterModal } from '@/components/Modal/RegisterModal';
import { useAppSelector } from '@/store/hooks';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as S from './Gateway.styles';

export default function GatewayPage() {
  const router = useRouter();

  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showVerifyNotice, setShowVerifyNotice] = useState(false);

  useEffect(() => setMounted(true), []);

  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = Boolean(mounted && user && (user as any).id);

  useEffect(() => {
    if (!mounted) return;
    if (isAuthenticated) {
      setLoginOpen(false);
      setForgotOpen(false);
      if (!justRegistered) {
        setRegisterOpen(false);
      }
    }
  }, [isAuthenticated, mounted, justRegistered]);

  useEffect(() => {
    if (!registerOpen && justRegistered) {
      setJustRegistered(false);
    }
  }, [registerOpen, justRegistered]);

  const handleJustRegistered = () => {
    setRegisterOpen(false);
    setShowVerifyNotice(true);
  };

  const openLogin = () => setLoginOpen(true);
  const openRegister = () => setRegisterOpen(true);
  const openGuest = () => router.push('/guest');

  return (
    <S.PageWrapper>
      <S.TopNav role="navigation" aria-label="Gateway navigation">
        <S.Brand onClick={() => router.push('/')}>MyApp</S.Brand>

        <S.NavItems>
          {!isAuthenticated ? (
            <>
              <S.NavButton onClick={openGuest} aria-label="Guest">
                Guest
              </S.NavButton>
              <S.NavButton onClick={openLogin} aria-label="Login" primary>
                Login
              </S.NavButton>
              <S.NavButton onClick={openRegister} aria-label="Register">
                Register
              </S.NavButton>
            </>
          ) : (
            <>
              <S.NavButton aria-label="User" title={user?.email ?? undefined}>
                {user?.name ?? user?.email ?? 'User'}
              </S.NavButton>

              <S.NavButton as={LogoutButton} />
            </>
          )}
        </S.NavItems>
      </S.TopNav>

      <S.MainContent>
        <S.HeroCard>
          <h3>Gateway hub</h3>
          <p>
            Here you will gather gateway widgets — left intentionally empty.
          </p>
        </S.HeroCard>
      </S.MainContent>

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onOpenForgot={() => {
          setLoginOpen(false);
          setForgotOpen(true);
        }}
      />
      <RegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onJustRegistered={handleJustRegistered}
      />
      <ForgotPasswordModal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
      />
    </S.PageWrapper>
  );
}
