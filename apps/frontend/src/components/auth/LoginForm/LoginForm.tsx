'use client';

import { startPhoneLogin } from '@/lib/auth';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AuthButton } from '../../ui/AuthButton';
import { FloatingInput } from '../../ui/FloatingInput';
import { PasswordInput } from '../../ui/PasswordInput';
import { SocialButton } from '../../ui/SocialButton';
import * as S from './LoginForm.styles';

type FormValues = { email: string; password: string };
type PhoneForm = { phone: string };
type OtpForm = { otp: string };

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

  const {
    register: registerPhone,
    handleSubmit: handleSubmitPhone,
    formState: { errors: phoneErrors, isSubmitting: phoneSubmitting },
  } = useForm<PhoneForm>({ defaultValues: { phone: '' } });

  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: otpErrors, isSubmitting: otpSubmitting },
  } = useForm<OtpForm>({ defaultValues: { otp: '' } });

  const router = useRouter();

  const [mode, setMode] = useState<'credentials' | 'phone' | 'otp'>(
    'credentials',
  );
  const [sessionId, setSessionIdState] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      } as any);

      if (res && (res as any).error) {
        throw new Error((res as any).error || 'Sign in failed');
      }

      router.push('/');
    } catch (err: unknown) {
      console.error('Login error', err);
      const message =
        (err as any)?.message ?? 'Login error. Check your details.';
      alert(message);
    }
  };

  const startPhoneFlow = () => {
    setMode('phone');
    setInfoMsg(null);
    setSessionIdState(null);
    setDevOtp(null);
    setDeepLink(null);
  };

  const onSendPhone = async (payload: PhoneForm) => {
    try {
      setInfoMsg('Sending request...');
      const res = await startPhoneLogin(payload.phone);
      setSessionIdState(res.sessionId ?? null);
      setDeepLink(res.url ?? null);
      if (res.otp) setDevOtp(String(res.otp));
      setMode('otp');
      setInfoMsg(
        res.url
          ? 'If you don’t have an active chat with the bot — open the bot and follow instructions.'
          : 'If you have started a chat with the bot — you should get OTP in Telegram soon.',
      );
    } catch (err: any) {
      console.error('startPhoneLogin error', err);
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        'Failed to start phone login';
      setInfoMsg(String(msg));
    }
  };

  const onVerifyOtp = async (body: OtpForm) => {
    if (!sessionId) {
      setInfoMsg('Missing sessionId, please restart the flow.');
      return;
    }

    try {
      setInfoMsg('Verifying OTP...');
      const res = await signIn('telegram-otp', {
        redirect: false,
        sessionId,
        otp: body.otp,
      } as any);

      if (res && (res as any).error) {
        setInfoMsg(String((res as any).error));
        return;
      }

      router.push('/');
    } catch (err: any) {
      console.error('verifyOtp error', err);
      setInfoMsg(err?.message ?? 'OTP verification failed');
    }
  };

  const onPlaceholderClick = (name: string) => {
    alert(`${name} auth not implemented yet`);
  };

  return (
    <S.Form onSubmit={handleSubmit(onSubmit)}>
      <S.Title>Sign In</S.Title>
      <S.Subtitle>
        Sign up to get personalized practice and <br /> saved cards.
      </S.Subtitle>

      {mode === 'credentials' && (
        <>
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

          <S.ForgotPasswordLink
            type="button"
            onClick={() => onForgotPassword?.()}
          >
            Forgot password?
          </S.ForgotPasswordLink>

          <S.Separator>
            <S.SeparatorText>or</S.SeparatorText>
          </S.Separator>

          <S.WarperSocialBtn>
            <SocialButton>Google</SocialButton>
            <SocialButton>Facebook</SocialButton>
          </S.WarperSocialBtn>

          <div style={{ marginTop: 16 }}>
            <S.RoundRowWrap>
              <S.RoundBtn
                title="Telegram"
                onClick={() => startPhoneFlow()}
                data-testid="tg-btn"
              >
                <S.RoundIcon>✈️</S.RoundIcon>
              </S.RoundBtn>

              <S.RoundBtn onClick={() => onPlaceholderClick('WhatsApp')}>
                <S.RoundIcon>🟢</S.RoundIcon>
              </S.RoundBtn>

              <S.RoundBtn onClick={() => onPlaceholderClick('Viber')}>
                <S.RoundIcon>💜</S.RoundIcon>
              </S.RoundBtn>

              <S.RoundBtn onClick={() => onPlaceholderClick('SMS')}>
                <S.RoundIcon>📩</S.RoundIcon>
              </S.RoundBtn>
            </S.RoundRowWrap>
          </div>
        </>
      )}

      {mode === 'phone' && (
        <>
          <S.InfoText>
            Sign in via Telegram. Enter your phone number in international
            format (e.g. +380673733650).
          </S.InfoText>

          <div>
            <FloatingInput
              id="phone"
              label="Phone (+380...)"
              type="tel"
              autoComplete="tel"
              {...registerPhone('phone', {
                required: 'Phone is required',
                pattern: {
                  value: /^\+\d{7,15}$/,
                  message: 'Use + and digits, e.g. +380673733650',
                },
              })}
              error={(phoneErrors as any).phone?.message}
            />

            <S.RowBetween>
              <AuthButton
                type="button"
                onClick={() => handleSubmitPhone(onSendPhone)()}
                disabled={phoneSubmitting}
              >
                {phoneSubmitting ? 'Sending...' : 'Send code via Telegram'}
              </AuthButton>

              <S.SecondaryBtn
                type="button"
                onClick={() => {
                  setMode('credentials');
                }}
              >
                Back
              </S.SecondaryBtn>
            </S.RowBetween>
          </div>
        </>
      )}

      {mode === 'otp' && (
        <>
          <S.InfoText>{infoMsg}</S.InfoText>

          {deepLink ? (
            <S.OpenLink href={deepLink}>Open Telegram Bot</S.OpenLink>
          ) : null}
          {devOtp ? <S.DevOtp>DEV OTP (debug): {devOtp}</S.DevOtp> : null}

          <div>
            <FloatingInput
              id="otp"
              label="OTP (6 digits)"
              type="text"
              autoComplete="one-time-code"
              {...registerOtp('otp', {
                required: 'OTP required',
                pattern: { value: /^\d{4,8}$/, message: 'Enter digits' },
              })}
              error={(otpErrors as any).otp?.message}
            />

            <S.RowBetween>
              <AuthButton
                type="button"
                onClick={() => handleSubmitOtp(onVerifyOtp)()}
                disabled={otpSubmitting}
              >
                {otpSubmitting ? 'Verifying...' : 'Verify OTP'}
              </AuthButton>

              <S.SecondaryBtn
                type="button"
                onClick={() => {
                  setMode('phone');
                  setInfoMsg(null);
                }}
              >
                Resend / Back
              </S.SecondaryBtn>
            </S.RowBetween>
          </div>
        </>
      )}
    </S.Form>
  );
}
