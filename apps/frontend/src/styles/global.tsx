/** @jsxImportSource @emotion/react */
import { Global, css } from '@emotion/react';

export const GlobalStyles = () => (
  <Global
    styles={css`
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        padding: 0;
        font-family: 'Geist', sans-serif;
        background-color: #fff;
        color: #333;
      }

      a {
        color: inherit;
        text-decoration: none;
      }

      ul,
      ol {
        padding-left: 1.5rem;
      }

      button {
        cursor: pointer;
      }
    `}
  />
);
