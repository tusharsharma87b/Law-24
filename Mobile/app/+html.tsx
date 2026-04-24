import React from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

/**
 * HTML shell for web SPA mode.
 * Forces html/body/#root to fill 100% of the viewport so React Native Web
 * components with flex:1 actually take up the full screen (not 0px height).
 */
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html style={{ height: '100%' }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        {/* Reset ScrollView default styles for web */}
        <ScrollViewStyleReset />
        <style>{`
          html, body, #root { height: 100%; margin: 0; padding: 0; }
          body { background-color: #050A14; overflow: hidden; }
          * { box-sizing: border-box; }
        `}</style>
      </head>
      <body style={{ height: '100%' }}>
        {children}
      </body>
    </html>
  );
}
