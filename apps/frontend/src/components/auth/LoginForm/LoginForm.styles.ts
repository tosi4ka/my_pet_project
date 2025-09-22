import styled from '@emotion/styled';

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const Title = styled.h3`
  font-family: 'Geist', system-ui, sans-serif;
  font-weight: 400;
  font-size: 34px;
  line-height: 1.2;
  color: #ffffff;
  margin: 0;
`;

export const Subtitle = styled.p`
  font-family: 'Geist', system-ui, sans-serif;
  font-weight: 300-400;
  font-size: 16px;
  line-height: 1.6;
  color: #7e7e7e;
  margin: 0;
`;

export const Separator = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #888;
    opacity: 0.25;
  }
`;

export const SeparatorText = styled.div`
  white-space: nowrap;
  color: #888;
  font-size: 13px;
`;

export const WarperSocialBtn = styled.div`
  display: flex;
  justify-content: space-around;
`;

export const ForgotPasswordLink = styled.button`
  align-self: flex-start;
  background: none;
  border: 0;
  color: #7fb0ff;
  font-size: 14px;
  padding: 0;
  margin-top: 4px;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover {
    text-decoration: underline;
  }
  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

/* Phone / OTP UI */

export const InfoText = styled.div`
  color: #cfcfd6;
  font-size: 13px;
`;

export const RowBetween = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

export const SecondaryBtn = styled.button`
  background: transparent;
  border: 1px solid #2a2a2a;
  color: #cfcfd6;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
`;

export const OpenLink = styled.a`
  display: inline-block;
  margin: 8px 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: #1e293b;
  color: #fff;
  text-decoration: none;
`;

export const DevOtp = styled.div`
  margin-top: 8px;
  color: #9ca3af;
  font-size: 12px;
`;

/* Round messenger buttons row */
export const RoundRowWrap = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 12px;
`;

export const RoundBtn = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 999px;
  border: 1px solid #2a2a2a;
  background: #0c0c0c;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform 0.12s ease;
  &:hover {
    transform: translateY(-3px);
  }
`;

export const RoundIcon = styled.div`
  font-size: 18px;
`;
