import React from 'react';

// En nativo no envuelve nada. La version web vive en WebShell.web.tsx
export default function WebShell({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
