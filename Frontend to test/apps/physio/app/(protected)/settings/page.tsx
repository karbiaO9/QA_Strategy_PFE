"use client";

import React from "react";
import { Settings } from "lucide-react";
import { HeaderLayout } from "@physio-connect-frontend/shared-theme"
import { ToggleGroupTabs, ToggleGroupTabsContent, ToggleGroupTabsList, ToggleGroupTabsTrigger } from "@physio-connect-frontend/shared-ui"
import ProfileTab from "./_components/profile-tab"
import SecurityTab from "./_components/security-tab"
import TagsTab from "./_components/tags-tab"
import BillingTab from "./_components/billing-tab"
import PaymentTab from "./_components/payment-tab";
import ConditionsTab from "./_components/conditions-tab";

export default function SettingsPage() {
  return (
    <>
      <HeaderLayout
        title="Paramètres"
        subtitle="Voir tous les Paramètres de votre application"
        icon={<Settings className="h-6 w-6" />}
        showNotification
      />
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <ToggleGroupTabs defaultValue="profile" className="flex flex-col flex-1">
            
            {/* Scrollable Tabs List */}
            <div className="overflow-x-auto no-scrollbar">
                <ToggleGroupTabsList className="m-6 !mb-0 flex-nowrap min-w-max">
                    <ToggleGroupTabsTrigger value="profile">Mon profil</ToggleGroupTabsTrigger>
                    <ToggleGroupTabsTrigger value="security">Paramètres</ToggleGroupTabsTrigger>
                    <ToggleGroupTabsTrigger value="tags">Tags</ToggleGroupTabsTrigger>
                    <ToggleGroupTabsTrigger value="billing">Abonnement & facturation</ToggleGroupTabsTrigger>
                    <ToggleGroupTabsTrigger value="payment">Historique de paiements</ToggleGroupTabsTrigger>
                    <ToggleGroupTabsTrigger value="conditions">Conditions d'utilisation</ToggleGroupTabsTrigger>
                </ToggleGroupTabsList>
            </div>

            {/* Fixed Content Area */}
            <div className="flex-1 overflow-hidden">
                <ToggleGroupTabsContent value="profile">
                    <ProfileTab />
                </ToggleGroupTabsContent>

                <ToggleGroupTabsContent value="security">
                    <SecurityTab />
                </ToggleGroupTabsContent>
                
                <ToggleGroupTabsContent value="tags" className="mx-6">
                    <TagsTab />
                </ToggleGroupTabsContent>
                
                <ToggleGroupTabsContent value="billing" className="mx-6 grid xl:grid-cols-2 lg:gap-6 gap-10">
                    <BillingTab />
                </ToggleGroupTabsContent>
                
                <ToggleGroupTabsContent value="payment" className="mx-6">
                    <PaymentTab />
                </ToggleGroupTabsContent>

                <ToggleGroupTabsContent value="conditions" className="mx-6 p-6 rounded-xl border border-border">
                    <ConditionsTab />
                </ToggleGroupTabsContent>
            </div>
        </ToggleGroupTabs>
      </div>
    </>
  );
}