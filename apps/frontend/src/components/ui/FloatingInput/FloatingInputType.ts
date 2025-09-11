import { HTMLInputTypeAttribute, ReactNode } from 'react';

export type FloatingInputProps = {
  id: string;
  label: string;
  type?: HTMLInputTypeAttribute;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  autoComplete?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  textAlign?: 'left' | 'center';
  rightAdornment?: ReactNode;
};
