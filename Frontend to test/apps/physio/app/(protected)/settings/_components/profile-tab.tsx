"use client";

import React from "react";
import Image from "next/image";
import { InputLine } from "@/components/settings/input-line";
import { CustomAlert, Field, FieldGroup, FieldLabel, Input } from "@physio-connect-frontend/shared-ui";


export default function ProfileTab() {
  return (
    <>
        <InputLine 
            title="Photo" 
            subtitle="Ceci sera affiché sur votre profil."
            action={{
                label: "Télécharger",
                children: (<div></div>)
            }}
        >
            <div className="flex items-center gap-7">
                <Image
                    src="/avatar6.png"
                    alt="avatar"
                    width={60}
                    height={60}
                    className="rounded-full border-2 border-primary"
                />

                <span className="text-sm font-medium text-foreground-muted underline hover:cursor-pointer">Supprimer</span>
            </div>
        </InputLine>

        <InputLine 
            title="Nom & prénom" 
            subtitle="Ceci sera affiché sur votre profil."
            action={{
                label: "Modifier",
                children: (
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="name">Nom & prénom*</FieldLabel>
                            <Input id="fullname" autoComplete="off" placeholder="Entrer Nom & prénom" />
                        </Field>
                    </FieldGroup>
                )
            }}
        >
            <span className="text-sm font-medium underline">DR. Albert Van Helsing</span>
        </InputLine>

        <InputLine 
            title="Contact email" 
            subtitle="Au moins 1 adresse email de contact"
            action={{
                label: "Modifier",
                children: (
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="name">Adresse email*</FieldLabel>
                            <Input id="email1" autoComplete="off" placeholder="Entrer adresse email" />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="name">2ème Adresse email*</FieldLabel>
                            <Input id="email2" autoComplete="off" placeholder="Entrer adresse email" />
                        </Field>
                    </FieldGroup>
                )
            }}
        >
            <div className="flex flex-col gap-5">
                <span className="text-sm font-medium underline">contact@albert.com</span>
                <span className="text-sm font-medium underline">albervanhelsing@outlook.fr</span>
            </div>
        </InputLine>

        <InputLine 
            title="Adresse de facturation" 
            subtitle="Au moins 1 adresse de facturation"
            action={{
                label: "Modifier",
                children: (
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="name">Adresse de facturation</FieldLabel>
                            <Input id="email1" autoComplete="off" placeholder="Entrer adresse de facturation" />
                        </Field>
                    </FieldGroup>
                )
            }}
        >
            <div className="max-w-60">
                <span className="text-sm font-medium">Pablo Alto, Paris,  92102, République française</span>
            </div>
        </InputLine>

        <InputLine 
            title="Numéro de RPPS" 
            subtitle="Ceci sera affiché sur votre profil."
            action={{
                label: "Modifier",
                children: (
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="name">Numéro de RPPS</FieldLabel>
                            <Input id="email1" autoComplete="off" placeholder="Entrer Numéro de RPPS" />
                        </Field>
                    </FieldGroup>
                )
            }}
        >
            <span className="text-sm font-medium underline">352735</span>
        </InputLine>

        <InputLine 
            title="Numéro de licence" 
            subtitle="Ceci sera affiché sur votre profil."
            action={{
                label: "Modifier",
                children: (
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="name">Numéro de licence</FieldLabel>
                            <Input id="email1" autoComplete="off" placeholder="Entrer Numéro de licence" />
                        </Field>
                    </FieldGroup>
                )
            }}
        >
            <span className="text-sm font-medium underline">35272839</span>
        </InputLine>

        <InputLine title="Compte" >
            <CustomAlert
                trigger={
                    <span className="text-sm text-destructive underline hover:opacity-80 hover:cursor-pointer">Supprimer mon compte</span>
                }
                icon={<i className="icon icon-worning" />}
                description="Voulez-vous vraiment supprimer votre compte?"
                color="red"
                cancelText="Annuler"
                confirmText="Supprimer"
                onConfirm={() => console.log("Deleted!")}
            />
        </InputLine>
    </>
  );
}