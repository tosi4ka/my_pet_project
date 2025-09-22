export type FormValues = {
  name: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirm: string;
};

export type RegisterFormProps = {
  onOpenLogin?: () => void;
  onJustRegistered?: () => void;
};
