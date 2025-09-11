export type FormValues = {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
};

export type RegisterFormProps = {
  onOpenLogin?: () => void;
};
