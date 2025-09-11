import styled from '@emotion/styled';

export const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1.2;
  min-width: 520px;
  padding: 28px;
  box-sizing: border-box;
`;

export const Grid = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 18px;
  pointer-events: none;
  opacity: 0;
`;

export const EmptyCell = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 14px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.02),
    rgba(255, 255, 255, 0.01)
  );
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.02);
  opacity: 0.9;
`;

export const TileText = styled.div<{ small?: boolean }>`
  font-family:
    Inter,
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    'Helvetica Neue';
  font-weight: 600;
  line-height: 1.12;
  font-size: ${(p) => (p.small ? '14px' : '20px')};
  color: inherit;
`;

export const Plus = styled.div`
  font-size: 34px;
  line-height: 1;
  user-select: none;
`;

export const LogoWrapper = styled.div`
  width: 50%;
  height: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 150%;
    height: 150%;
    display: block;
    object-fit: contain;
  }
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
  z-index: 0;
  pointer-events: none;
`;
