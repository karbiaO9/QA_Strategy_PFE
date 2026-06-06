import React from 'react';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="mb-10 text-center">
      {/* Using an h1 or h2 appropriately is good for screen readers (A11y) */}
      <h2 className="font-bold text-2xl mb-2">
        {title}
      </h2>
      {subtitle && (
        <p className="font-medium md:text-base text-sm text-neutral-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}