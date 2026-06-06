'use client';

import { createContext } from 'react';
import { createContextualCan } from '@casl/react';
import { AppAbility, buildUserAbility } from '../ability';

// Create the context with a default empty ability
export const AbilityContext = createContext<AppAbility>(buildUserAbility({ permissions: {} }));

// Create a custom <Can> component hooked into our context
export const Can = createContextualCan(AbilityContext.Consumer);

export function AbilityProvider({ 
  children, 
  userJsonPayload 
}: { 
  children: React.ReactNode;
  userJsonPayload: any; 
}) {

  // Build the ability once when the payload changes
  const ability = buildUserAbility(userJsonPayload);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}