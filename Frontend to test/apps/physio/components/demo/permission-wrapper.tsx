'use client';

import { useState, useMemo } from 'react';
import { AbilityProvider, Actions } from '@physio-connect-frontend/shared-casl';
import { Card, CardContent, CardHeader, Button, Input } from "@physio-connect-frontend/shared-ui";

export function PermissionsDemoWrapper({ children }: { children: React.ReactNode }) {
  const [allowedActions, setAllowedActions] = useState<Actions[]>(['READ']);
  
  // 1. Fixed state structure for specific conditions
  const [conditionValues, setConditionValues] = useState({
    cabinetId: 'cab-123',
    ownerId: ''
  });

  const toggleAction = (action: Actions) => {
    setAllowedActions(prev => 
      prev.includes(action) ? prev.filter(a => a !== action) : [...prev, action]
    );
  };

  // 2. Build the dynamic JSON
  const dynamicPayload = useMemo(() => {
    // Only include keys that have a value
    const conditionObject: Record<string, string> = {};
    if (conditionValues.cabinetId) conditionObject.cabinetId = conditionValues.cabinetId;
    if (conditionValues.ownerId) conditionObject.ownerId = conditionValues.ownerId;

    return {
      permissions: {
        PATIENT: allowedActions.reduce((acc, action) => {
          // If no conditions are set, it grants general access for that action
          const hasConditions = Object.keys(conditionObject).length > 0;
          
          acc[action] = (action === 'DELETE' || action === 'UPDATE') && hasConditions
            ? { conditions: conditionObject } 
            : {};
          return acc;
        }, {} as any)
      }
    };
  }, [allowedActions, conditionValues]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT COLUMN: The Controller */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <Card className="bg-slate-50 border-2">
          <CardHeader className="font-bold py-3 text-sm">1. Toggle Actions</CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {['READ', 'CREATE', 'UPDATE', 'DELETE'].map((action) => (
              <Button
                key={action}
                size="sm"
                variant={allowedActions.includes(action as Actions) ? "default" : "outline"}
                onClick={() => toggleAction(action as Actions)}
              >
                {action}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-slate-50 border-2">
          <CardHeader className="font-bold py-3 text-sm">2. Set Values (Conditions)</CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500">Cabinet ID</label>
              <Input 
                placeholder="Leave empty to ignore..." 
                value={conditionValues.cabinetId} 
                onChange={(e) => setConditionValues(prev => ({ ...prev, cabinetId: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500">Owner ID</label>
              <Input 
                placeholder="Leave empty to ignore..." 
                value={conditionValues.ownerId} 
                onChange={(e) => setConditionValues(prev => ({ ...prev, ownerId: e.target.value }))}
              />
            </div>
            <p className="text-[10px] text-slate-400 italic">
              *Any condition field left empty is automatically omitted from the permission logic, granting access regardless of that specific attribute.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black text-green-400">
          <CardHeader className="text-[10px] border-b border-green-900 py-2">Generated Permission JSON</CardHeader>
          <CardContent className="p-2 text-[10px] font-mono leading-tight">
            <pre>{JSON.stringify(dynamicPayload, null, 2)}</pre>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN: The Live Preview */}
      <div className="lg:col-span-2">
        <AbilityProvider userJsonPayload={dynamicPayload}>
          {children}
        </AbilityProvider>
      </div>
    </div>
  );
}