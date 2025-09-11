import styled from '@emotion/styled';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(2, 3, 4, 0.6);
  display: grid;
  place-items: center;
  z-index: 9999;
  -webkit-tap-highlight-color: transparent;
`;

export const Dialog = styled.div`
  outline: none;
  max-width: calc(100% - 48px);
  width: 1120px;
  height: 720px;
  border-radius: 20px;
  position: relative;
  box-shadow: 0 20px 80px rgba(0, 0, 0, 0.7);
`;

export const ModalInner = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
  border-radius: 20px;
  background: rgba(10, 10, 10, 0.7);
`;

export const LeftPanel = styled.div`
  /* background: url('/image/bg_alphabet.png'); */
  background-repeat: no-repeat;
  background-size: calc(100% + 10px) calc(100% + 20px);
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
  overflow: hidden;
  position: relative;
  flex: 1.2;
  min-width: 520px;
  padding: 28px;
  display: flex;
  align-items: center;
`;

export const LeftBackdrop = styled.div`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      circle at 10% 20%,
      rgba(255, 255, 255, 0.03),
      transparent 5%
    ),
    radial-gradient(circle at 80% 80%, rgba(0, 0, 0, 0.25), transparent 20%);
  border-radius: 20px;
  z-index: 1;
`;

export const RightPanel = styled.div`
  flex: 0.9;
  min-width: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent);
`;

export const CloseBtn = styled.button`
  position: absolute;
  right: 14px;
  top: 12px;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.02);
  border: none;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  font-size: 16px;
  z-index: 6;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }
`;
