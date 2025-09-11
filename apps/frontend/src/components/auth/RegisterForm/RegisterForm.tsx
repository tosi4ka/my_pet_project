'use client';

import api from '@/lib/api';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { AuthButton } from '../../ui/AuthButton';
import { FloatingInput } from '../../ui/FloatingInput';
import { PasswordInput } from '../../ui/PasswordInput';
import { SocialButton } from '../../ui/SocialButton';
import * as S from './RegisterForm.styles';
import { FormValues, RegisterFormProps } from './type';

export default function RegisterForm({ onOpenLogin }: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { name: '', email: '', password: '', passwordConfirm: '' },
  });

  const router = useRouter();
  const dispatch = useAppDispatch();

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      const { user, token } = res.data ?? {};
      if (token) localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        dispatch(setUser(user));
      }
      router.push('/');
    } catch (err: any) {
      console.error(err);
      const message =
        err?.response?.data?.message ??
        'Registration error. Check your details.';
      alert(message);
    }
  };

  return (
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
  );
}
