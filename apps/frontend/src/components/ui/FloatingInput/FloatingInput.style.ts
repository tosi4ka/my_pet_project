import styled from '@emotion/styled';

export const Field = styled.div`
  display: grid;
  gap: 6px;

  &[data-error='true'] input {
    border-color: #ef4444;
  }
`;

export const InputWrap = styled.div`
  position: relative;
`;

export const Input = styled.input`
  width: 100%;
  height: 56px;
  padding: 22px 16px 10px;
  border-radius: 14px;
  border: 1px solid #2a2a2a;
  background: #0c0c0c;
  color: #e5e7eb;
  outline: none;
  transition: border-color 0.2s ease;

  &[data-withadornment='true'] {
    padding-right: 44px;
  }

  &[data-align='center'] {
    text-align: center;
  }

  &:focus {
    border-color: #7c7cff;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus + div + label,
  &:not(:placeholder-shown) + div + label,
  &:focus + label,
  &:not(:placeholder-shown) + label {
    top: 0;
    transform: translateY(-50%) scale(0.85);
    color: #c7c7d1;
    padding: 0 6px;
    background: #0c0c0c;
  }
`;

export const Adornment = styled.div`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  height: 36px;
  display: grid;
  place-items: center;

  button {
    display: inline-grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: transparent;
    border: none;
    color: #c7c7d1;
    cursor: pointer;
  }
`;

export const Label = styled.label`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  line-height: 1;
  color: #9ca3af;
  pointer-events: none;
  transition: all 0.15s ease;
`;

export const Msg = styled.div`
  font-size: 12px;
  color: #9ca3af;

  [data-error='true'] & {
    color: #ef4444;
  }
`;
