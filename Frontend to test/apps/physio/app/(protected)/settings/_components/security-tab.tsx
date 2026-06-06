"use client";

import React, { useState } from "react";
import { InputLine } from "@/components/settings/input-line";
import { Field, FieldGroup, FieldLabel, Input, Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@physio-connect-frontend/shared-ui";
import { FormDialog } from "@/components/shared/form-dialog";

const languageList: string[] = [ "Français", "Anglais", "Espagnol" ];

export default function SecurityTab() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  return (
    <>
        <InputLine 
            title="Mot de passe" 
            action={{
                label: "Modifier",
                children: (
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="name">Mot de passe actuel*</FieldLabel>
                            <Input id="password1" type="password" autoComplete="off" placeholder="Entrer mot de passe" />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="name">Nouveau Mot de passe*</FieldLabel>
                            <Input id="password2" type="password" autoComplete="off" placeholder="Entrer mot de passe" />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="name">Confirmer Mot de passe*</FieldLabel>
                            <Input id="password3" type="password" autoComplete="off" placeholder="Entrer mot de passe" />
                        </Field>
                    </FieldGroup>
                )
            }} 
        >
            <span className="text-sm font-medium underline">*****************</span>
        </InputLine>

        <InputLine title="Authentication à 2-Facteurs">  
            <FormDialog
                trigger={
                    <span className="text-sm font-medium text-foreground-muted underline hover:cursor-pointer">Ajouter un numéro</span>
                }
                title="2-factor Authentication"
                onCancel={() => console.log("Cancelled Modal")}
                onConfirm={() => console.log("Saved Modal")}
            >
                <div>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="tel">Numéro de téléphone</FieldLabel>
                            <Input id="tel" autoComplete="off" placeholder="Entrer numéro de téléphone" />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="password">Mot de passe actuel*</FieldLabel>
                            <Input id="password" type="password" autoComplete="off" placeholder="Entrer mot de passe" />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="type">Recevoir code OTP par*</FieldLabel>
                            <Select defaultValue="email">
                                <SelectTrigger>
                                    <SelectValue defaultValue="email" />
                                </SelectTrigger>
                                <SelectContent position='popper' className="w-[var(--radix-select-trigger-width)]">
                                    <SelectGroup>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="sms">SMS</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>
                    </FieldGroup>
                </div>
            </FormDialog>
        </InputLine>

        <InputLine 
            title="Langue préférée" 
            action={{
                label: "Modifier",
                children: (
                    <div className="flex gap-6">
                        {languageList.map((lang, index) => {
                            const isSelected = selectedIndex === index;
                            return(
                                <button 
                                    key={index}
                                    onClick={() => setSelectedIndex(index)}
                                    className={`
                                        flex items-center px-4 py-2 rounded-xl border transition-all
                                        ${
                                            isSelected
                                            ? "bg-primary text-white border-primary"
                                            : "border-primary text-primary hover:bg-primary/10"
                                        }
                                    `}
                                >
                                    {lang}
                                </button>
                            )
                    })}
                        
                    </div>
                )
            }} 
        >
            <span className="text-sm font-medium underline">Français</span>
        </InputLine>
    </>
  );
}