import React from 'react';
import { FormDialog } from '../shared/form-dialog';

export interface LineAction {
  label?: string;
  children: React.ReactNode;
}

interface InputLineProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  action?: LineAction;
}

export function InputLine({ title, subtitle, children, action }: InputLineProps) {
  return (
    <div className="p-6 w-full flex md:flex-row flex-col xl:items-center items-start md:gap-5 gap-4 border-t-gray-100 border-t">
        <div className="w-96 flex flex-col gap-1">
          <span className="lg:text-lg text-base font-medium">{title}</span>
          {subtitle && <span className="lg:text-sm text-xs text-[#4C4C4C]">{subtitle}</span>}
        </div>
        
        <div className="flex gap-5 items-center md:justify-normal justify-between w-full">
          <div className="lg:w-96 w-72">{children}</div>
          
          {action && 
            <FormDialog
              trigger={
                <span className="lg:text-sm text-xs font-medium underline hover:opacity-80 hover:cursor-pointer">{action.label}</span>
              }
              title={`Modifier ${title}`}
              onCancel={() => console.log("Cancelled Modal")}
              onConfirm={() => console.log("Saved Modal")}
            >
              <div>
                {action.children}
              </div>
            </FormDialog>
          }
        </div>
    </div>
  );
}