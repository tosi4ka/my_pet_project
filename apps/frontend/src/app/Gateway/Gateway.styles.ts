import styled from '@emotion/styled';

export const PageWrapper = styled('div')`
  min-height: 100vh;
  background:
    radial-gradient(
      1200px 600px at 10% 10%,
      rgba(255, 255, 255, 0.02),
      transparent 8%
    ),
    linear-gradient(180deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.85));
  color: #fff;
  font-family:
    Inter,
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial;
`;

export const TopNav = styled('header')`
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  top: 24px;
  width: min(1100px, 94%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  border-radius: 14px;
  background: rgba(10, 10, 12, 0.48);
  backdrop-filter: blur(8px) saturate(120%);
  -webkit-backdrop-filter: blur(8px) saturate(120%);
  box-shadow: 0 10px 30px rgba(2, 6, 12, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.04);
  z-index: 60;
`;

export const Brand = styled('div')`
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.2px;
  cursor: pointer;
  user-select: none;
  color: rgba(255, 255, 255, 0.95);
`;

export const NavItems = styled('nav')`
  display: flex;
  gap: 12px;
  align-items: center;
`;

export const NavButton = styled('button')<{ primary?: boolean }>`
  padding: 8px 14px;
  min-width: 88px;
  border-radius: 10px;
  border: ${(p) => (p.primary ? 'none' : '1px solid rgba(255,255,255,0.06)')};
  background: ${(p) =>
    p.primary ? 'linear-gradient(180deg,#ffffff10,#ffffff06)' : 'transparent'};
  color: ${(p) => (p.primary ? 'white' : 'rgba(255,255,255,0.9)')};
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition:
    transform 160ms ease,
    box-shadow 200ms ease,
    opacity 140ms ease;
  box-shadow: ${(p) => (p.primary ? '0 6px 18px rgba(0,0,0,0.5)' : 'none')};

  &:hover {
    transform: translateY(-3px);
    opacity: 0.98;
  }

  &:active {
    transform: translateY(-1px) scale(0.995);
  }
`;

export const MainContent = styled('main')`
  padding-top: 110px;
  min-height: calc(100vh - 110px);
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const HeroCard = styled('div')`
  width: min(880px, 92%);
  max-width: 920px;
  border-radius: 16px;
  padding: 28px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.02),
    rgba(255, 255, 255, 0.01)
  );
  border: 1px solid rgba(255, 255, 255, 0.03);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  color: rgba(255, 255, 255, 0.9);

  h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
  }

  p {
    margin: 0;
    opacity: 0.75;
  }
`;
