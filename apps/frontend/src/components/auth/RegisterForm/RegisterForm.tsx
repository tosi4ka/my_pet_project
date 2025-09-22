'use client';

import { VerifyNotice } from '@/components/ui/VerifyNotice';
import api from '@/lib/api';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AuthButton } from '../../ui/AuthButton';
import { FloatingInput } from '../../ui/FloatingInput';
import { PasswordInput } from '../../ui/PasswordInput';
import { SocialButton } from '../../ui/SocialButton';
import * as S from './RegisterForm.styles';
import { FormValues, RegisterFormProps } from './type';

export default function RegisterForm({
  onOpenLogin,
  onJustRegistered,
}: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
      phone: '',
    },
  });

  const router = useRouter();

  const [showVerifyNotice, setShowVerifyNotice] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone ?? '',
      });

      const { user } = res.data ?? {};

      // Ставим флаг в sessionStorage (унифицированный ключ 'just_registered')
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('just_registered', '1');
          sessionStorage.setItem('registered_email', data.email ?? '');
          console.debug(
            '[RegisterForm] sessionStorage: set just_registered=1, registered_email=',
            data.email,
          );
        } catch (e) {
          console.warn('[RegisterForm] failed to set sessionStorage', e);
        }
      }

      // Сообщаем родителю, чтобы он мог закрыть модалку
      onJustRegistered?.();

      // Авто-логин (best-effort)
      try {
        await signIn('credentials', {
          redirect: false,
          email: data.email,
          password: data.password,
        } as any);
        console.debug('[RegisterForm] signIn called (redirect:false)');
      } catch (e) {
        console.warn('[RegisterForm] Auto signIn failed', e);
      }

      // Навигация на главную
      try {
        router.replace('/');
      } catch (e) {
        router.push('/');
      }
    } catch (err: any) {
      console.error('register error', err);
      const message =
        err?.response?.data?.message ??
        'Registration error. Check your details.';
      alert(message);
    }
  };

  return (
    <>
      <S.Form onSubmit={handleSubmit(onSubmit)}>
        <S.Title>Create account</S.Title>
        <S.Subtitle>
          Register to save progress and get personalized practice.
        </S.Subtitle>

        <FloatingInput
          id="name"
          label="Full name"
          {...register('name', { required: 'Name is required' })}
          error={errors.name?.message}
          autoComplete="name"
        />

        <FloatingInput
          id="phone"
          label="Phone (+380...)"
          type="tel"
          {...register('phone', {
            required: false,
            pattern: {
              value: /^\+\d{7,15}$/,
              message: 'Use + and digits, e.g. +380673733650',
            },
          })}
          error={errors.phone?.message}
          autoComplete="tel"
        />

        <FloatingInput
          id="email"
          label="Email"
          type="email"
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /\S+@\S+\.\S+/, message: 'Incorrect email' },
          })}
          error={errors.email?.message}
          autoComplete="email"
        />

        <PasswordInput
          id="password"
          label="Password"
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Min 6 characters' },
          })}
          error={errors.password?.message}
          autoComplete="new-password"
        />

        <PasswordInput
          id="passwordConfirm"
          label="Confirm password"
          {...register('passwordConfirm', {
            required: 'Confirm your password',
            validate: (v) =>
              v === getValues('password') || 'Passwords do not match',
          })}
          error={errors.passwordConfirm?.message}
          autoComplete="new-password"
        />

        <AuthButton disabled={isSubmitting}>Sign Up</AuthButton>

        <S.Already>
          Already have an account?{' '}
          <S.SwitchButton type="button" onClick={() => onOpenLogin?.()}>
            Sign in
          </S.SwitchButton>
        </S.Already>

        <S.Separator>
          <S.SeparatorText>or</S.SeparatorText>
        </S.Separator>

        <S.WarperSocialBtn>
          <SocialButton>Google</SocialButton>
          <SocialButton>Facebook</SocialButton>
        </S.WarperSocialBtn>
      </S.Form>

      {showVerifyNotice && (
        <VerifyNotice
          email={registeredEmail ?? undefined}
          onClose={() => {
            setShowVerifyNotice(false);
            sessionStorage.setItem('justRegistered', '1');
            router.push('/');
          }}
        />
      )}
    </>
  );
}

// function VerifyNotice({
//   email,
//   onClose,
// }: {
//   email?: string;
//   onClose: () => void;
// }) {
//   return (
//     <div
//       style={{
//         position: 'fixed',
//         inset: 0,
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         zIndex: 9999,
//         pointerEvents: 'auto',
//       }}
//     >
//       <div
//         style={{
//           maxWidth: 560,
//           width: '90%',
//           background: 'white',
//           color: '#111',
//           borderRadius: 12,
//           padding: 24,
//           boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
//         }}
//       >
//         <h3 style={{ marginTop: 0 }}>Confirm your email</h3>
//         <p>
//           We sent a confirmation email to <strong>{email}</strong>. Please
//           follow the link in that email to confirm your account. Some features
//           of your account will remain restricted until you confirm your email.
//         </p>
//         <div
//           style={{
//             marginTop: 16,
//             display: 'flex',
//             gap: 8,
//             justifyContent: 'flex-end',
//           }}
//         >
//           <button
//             onClick={onClose}
//             style={{ padding: '8px 14px', borderRadius: 8 }}
//           >
//             OK
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
