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

export const Already = styled.div`
  font-size: 13px;
  color: #bfc7d0;
  margin-top: 6px;
`;

export const SwitchButton = styled.button`
  background: none;
  border: 0;
  color: #7fb0ff;
  cursor: pointer;
  padding: 0;
  margin-left: 8px;
  font-weight: 600;
  &:hover {
    text-decoration: underline;
  }
`;
