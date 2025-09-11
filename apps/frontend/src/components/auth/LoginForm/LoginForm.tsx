'use client';

import { setAuthToken } from '@/lib/api';
import {
  fetchCurrentUser,
  loginRequest,
  type User as AuthUser,
} from '@/lib/auth';
import { useAppDispatch } from '@/store/hooks';
import { setToken, setUser } from '@/store/slices/authSlice';
import type { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { AuthButton } from '../../ui/AuthButton';
import { FloatingInput } from '../../ui/FloatingInput';
import { PasswordInput } from '../../ui/PasswordInput';
import { SocialButton } from '../../ui/SocialButton';
import * as S from './LoginForm.styles';

type FormValues = { email: string; password: string };

type SliceUser = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
};

export default function LoginForm({
  onForgotPassword,
}: {
  onForgotPassword?: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: { email: '', password: '' } });

  const router = useRouter();
  const dispatch = useAppDispatch();

  function decodeJwt(token: string): { sub?: string; email?: string } | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      const json = JSON.parse(
        atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
      );
      return json;
    } catch {
      return null;
    }
  }

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await loginRequest(data.email, data.password);
      const token = res?.accessToken ?? res?.token ?? null;

      if (!token) {
        alert('Login succeeded but server returned no access token');
        return;
      }

      try {
        localStorage.setItem('token', token);
        setAuthToken(token);
      } catch {}
      dispatch(setToken(token));

      let user: AuthUser | null = res?.user ?? null;

      if (!user) {
        try {
          user = await fetchCurrentUser();
        } catch {
          user = null;
        }
      }

      if (!user) {
        const info = decodeJwt(token);
        if (info) {
          user = {
            id: info.sub ?? 'unknown',
            name: null,
            email: info.email,
          };
        }
      }

      if (user) {
        const sliceUser: SliceUser = {
          id: user.id,
          name: user.name ?? undefined,
          email: user.email ?? undefined,
          // role: (user as any).role ?? undefined,
          role: undefined,
        };

        try {
          localStorage.setItem('user', JSON.stringify(sliceUser));
        } catch {}
        dispatch(setUser(sliceUser));
      }

      router.push('/');
    } catch (err: unknown) {
      console.error('Login error', err);
      let message = 'Login error. Check your details.';
      if (typeof err === 'object' && err !== null) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        const resp = axiosErr.response;
        if (
          resp &&
          resp.data &&
          typeof resp.data === 'object' &&
          'message' in resp.data
        ) {
          const maybeMsg = (resp.data as { message?: unknown }).message;
          if (typeof maybeMsg === 'string') {
            message = maybeMsg;
          }
        } else if (axiosErr.message && typeof axiosErr.message === 'string') {
          message = axiosErr.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      alert(message);
    }
  };

  return (
    <S.Form onSubmit={handleSubmit(onSubmit)}>
      <S.Title>Sign In</S.Title>
      <S.Subtitle>
        Sign up to get personalized practice and <br /> saved cards.
      </S.Subtitle>

      <FloatingInput
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        {...register('email', {
          required: 'Email is required',
          pattern: { value: /\S+@\S+\.\S+/, message: 'Incorrect email' },
        })}
        error={errors.email?.message}
      />

      <PasswordInput
        id="password"
        label="Password"
        autoComplete="current-password"
        {...register('password', {
          required: 'Password is required',
          minLength: { value: 6, message: 'Min 6 characters' },
        })}
        error={errors.password?.message}
      />

      <AuthButton disabled={isSubmitting}>
        {isSubmitting ? 'Signing...' : 'Log In'}
      </AuthButton>

      <S.ForgotPasswordLink type="button" onClick={() => onForgotPassword?.()}>
        Forgot password?
      </S.ForgotPasswordLink>

      <S.Separator>
        <S.SeparatorText>or</S.SeparatorText>
      </S.Separator>

      <S.WarperSocialBtn>
        <SocialButton>Google</SocialButton>
        <SocialButton>Facebook</SocialButton>
      </S.WarperSocialBtn>
    </S.Form>
  );
}
