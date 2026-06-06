'use client'

import { ToggleGroupTabs, ToggleGroupTabsContent, ToggleGroupTabsList, ToggleGroupTabsTrigger } from "@physio-connect-frontend/shared-ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@physio-connect-frontend/shared-ui"
import { Card, CardContent, CardHeader } from "@physio-connect-frontend/shared-ui"
import { Skeleton } from "@physio-connect-frontend/shared-ui"
import { Slider } from "@physio-connect-frontend/shared-ui"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@physio-connect-frontend/shared-ui"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@physio-connect-frontend/shared-ui"
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle } from "@physio-connect-frontend/shared-ui"
import { Input } from "@physio-connect-frontend/shared-ui"
import { Textarea } from "@physio-connect-frontend/shared-ui"
import { Button } from "@physio-connect-frontend/shared-ui"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@physio-connect-frontend/shared-ui"
import { DatePicker, DatePickerTime } from "@physio-connect-frontend/shared-ui"
import { CustomCollapsible } from "@physio-connect-frontend/shared-ui"
import { DialogModal } from "@physio-connect-frontend/shared-ui"
import { CustomTable } from "@physio-connect-frontend/shared-ui"
import { Can } from "@physio-connect-frontend/shared-casl";
import { subject } from "@casl/ability";
import { PermissionsDemoWrapper } from "@/components/demo/permission-wrapper"
import { useState } from "react"
import type { ComponentType } from "react"
import { isValid, format } from "date-fns"

const DatePickerWithProps = DatePicker as unknown as ComponentType<{ date?: Date; setDate: (newDate: Date | undefined) => void }>
const DatePickerTimeWithProps = DatePickerTime as unknown as ComponentType<{ date?: Date; setDate: (newDate: Date | undefined) => void }>

const frameworks = [
  "Next.js",
  "SvelteKit",
  "Nuxt.js",
  "Remix",
  "Astro",
] as const

const patients = [
  {
    __type: "PATIENT",
    id: "pat-999",
    name: "John Doe (Target)",
    cabinetId: "cab-123",
    ownerId: "user-456"
  },
  {
    __type: "PATIENT",
    id: "pat-888",
    name: "Jane Smith (Other)",
    cabinetId: "cab-999",
    ownerId: "user-789"
  }
];

const paymentColumns = [
  { key: "id", header: "ID Facture", accessor: "id" },
  { key: "plan", header: "Abonnement", accessor: "plan" },
  { key: "amount", header: "Montant", accessor: "amount" },
  { key: "date", header: "Date de la facture", accessor: "date" },
  { key: "status", header: "Statut", accessor: "status" },
  { 
    key: "download", 
    header: "Télécharger", 
    accessor: "download",
    render: () => <span className="icon-download text-[20px] text-gray-400 hover:text-gray-600 cursor-pointer"></span>
  }
];

const paymentData = [
  {
    id: "000027",
    plan: "Plan Basic",
    amount: "€ 300",
    date: "Mars 23,2025",
    status: "paid",
  },
  {
    id: "000028",
    plan: "Plan Standard",
    amount: "€ 600",
    date: "Juin 15,2025",
    status: "pending",
  },
  {
    id: "000029",
    plan: "Plan Premium",
    amount: "€ 900",
    date: "Septembre 30,2025",
    status: "cancelled",
  },
];

const paymentStatusConfig = {
  paid: { color: "primary", textFr: "Payé", textEn: "Paid" },
  pending: { color: "yellow", textFr: "En attente", textEn: "Pending" },
  cancelled: { color: "red", textFr: "Annulé", textEn: "Cancelled" },
};

export default function DashboardPage() {
    // Use Date type for internal logic, string for final output
  const [date, setDate] = useState<Date | undefined>(new Date())

  // This ensures that 'nothing else' but a valid string is processed
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate && isValid(newDate)) {
      setDate(newDate)
      const dateString = format(newDate, "yyyy-MM-dd")
      console.log("Valid Date String:", dateString)
    } else {
      setDate(undefined)
    }
  }

  return (
    <div className="p-10 flex flex-col gap-12 overflow-auto">
        <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold underline">Tabs:</h3>
            <div className="flex lg:flex-row flex-col gap-5">
                <Card className="w-full max-w-lg py-6">
                    <CardContent>
                        <ToggleGroupTabs defaultValue="account" className="w-[300px]">
                            <ToggleGroupTabsList>
                                <ToggleGroupTabsTrigger value="account">Account</ToggleGroupTabsTrigger>
                                <ToggleGroupTabsTrigger value="password">Password</ToggleGroupTabsTrigger>
                                <ToggleGroupTabsTrigger value="test">Test</ToggleGroupTabsTrigger>
                            </ToggleGroupTabsList>
                            <ToggleGroupTabsContent value="account">Make changes to your account here.</ToggleGroupTabsContent>
                            <ToggleGroupTabsContent value="password">Change your password here.</ToggleGroupTabsContent>
                            <ToggleGroupTabsContent value="test">This is simply a test content page here.</ToggleGroupTabsContent>
                        </ToggleGroupTabs>
                    </CardContent>
                </Card>

                <Card className="w-full max-w-lg py-6">
                    <CardContent>
                        <Tabs defaultValue="account" className="w-full">
                            <TabsList>
                                <TabsTrigger value="account">Account</TabsTrigger>
                                <TabsTrigger value="password">Password</TabsTrigger>
                            </TabsList>
                            <TabsContent value="account">Make changes to your account here.</TabsContent>
                            <TabsContent value="password">Change your password here.</TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
        
        <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold underline">Skeleton:</h3>
            <Card className="w-full max-w-xl">
                <CardHeader>
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="aspect-video w-full" />
                </CardContent>
            </Card>
        </div>

        <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold underline">Slider:</h3>
            <div className="flex gap-5">
                <Slider
                    defaultValue={[50]}
                    max={100}
                    step={1}
                    className="w-full max-w-xs"
                />

                <Slider
                    defaultValue={[50]}
                    max={100}
                    step={1}
                    trackColor="#FDE7E7"
                    rangeColor="red"
                    className="w-full max-w-xs"
                />

                <Slider
                    defaultValue={[80]}
                    max={100}
                    step={1}
                    showThumb={false}
                    disabled
                    className="w-full max-w-xs"
                />
            </div>
        </div>    

        <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold underline">Combobox:</h3>
            <div className="w-[300px]">
                <Combobox items={frameworks}>
                    <ComboboxInput placeholder="Select a framework" />
                    <ComboboxContent>
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList className="w-[300px]">
                        {(item) => (
                            <ComboboxItem key={item} value={item}>
                            {item}
                            </ComboboxItem>
                        )}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </div>
        </div>

        <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold underline">Select:</h3>
            <Select>
                <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent position='popper' className="w-[var(--radix-select-trigger-width)]">
                    <SelectGroup>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>

        <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold underline">Dropdown Menu:</h3>
            <div className="w-[300px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Open</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Billing</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>GitHub</DropdownMenuItem>
                        <DropdownMenuItem>Support</DropdownMenuItem>
                        <DropdownMenuItem disabled>API</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>

        <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold underline">Field:</h3>
            <FieldSet>
                <FieldLegend>Profile</FieldLegend>
                <FieldDescription>This appears on invoices and emails.</FieldDescription>
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="name">Full name</FieldLabel>
                        <Input id="name" autoComplete="off" placeholder="Evil Rabbit" />
                        <FieldDescription>This appears on invoices and emails.</FieldDescription>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="message">Message</FieldLabel>
                        <Textarea id="message" placeholder="Type your message here." />
                        <FieldError>Choose another username.</FieldError>
                    </Field>
                </FieldGroup>
            </FieldSet>
        </div>

        <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold underline">Date Picker:</h3>
            <div className="flex gap-5">
                <Field className="max-w-xs">
                    <FieldLabel htmlFor="date-picker">Schedule Date</FieldLabel>
                    <DatePickerWithProps 
                        date={date} 
                        setDate={handleDateChange} 
                    />
                </Field>

                <Field className="max-w-xs">
                    <FieldLabel htmlFor="time-picker">Schedule Time</FieldLabel>
                    {/* Ensure your TimePicker also updates the same Date object if needed */}
                    <DatePickerTimeWithProps 
                        date={date} 
                        setDate={handleDateChange} 
                    />
                </Field>
            </div>
        </div>

        <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold underline">Custom Collapsible:</h3>
            <CustomCollapsible title="User Info">
                <div className="flex flex-col gap-2">
                    <span>Name: John Doe</span>
                    <span>Email: john@email.com</span>
                </div>
            </CustomCollapsible>
        </div>

        <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold underline">Dialog Modal:</h3>
            <div className="w-[300px]">
                <DialogModal 
                    title="Nouvelle Demande" 
                    color="white"
                    confirmText="Enregistrer"
                    cancelText="Annuler"
                    trigger={<Button>Open Example Modal</Button>}
                >
                    <div className="space-y-4">
                        <Field>
                            <FieldLabel htmlFor="request-title">Titre de la demande *</FieldLabel>
                            <Input id="request-title" placeholder="Lorem ipsum" />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="request-desc">Description de la demande *</FieldLabel>
                            <Textarea id="request-desc" placeholder="Lorem ipsum dolor sit amet" className="min-h-[120px]" />
                        </Field>
                    </div>
                </DialogModal>
            </div>
        </div>

        <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold underline">Payment History (Custom Table):</h3>
            <div className="w-full max-w-4xl">
                <CustomTable
                    variant="bordered"
                    columns={paymentColumns as any}
                    data={paymentData}
                    statusConfig={paymentStatusConfig}
                    language="fr"
                />
            </div>
        </div>

        <div className="flex flex-col gap-6">
            <h3>
                <span className="text-lg font-bold underline">CASL:</span>
                <span className="text-sm font-medium text-gray-500"> (Configure patient-level permissions by toggling available actions and defining specific access conditions.)</span>
            </h3>
            <PermissionsDemoWrapper>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patients.map((patient) => (
                    <Card key={patient.id}>
                    <CardHeader className="pb-2">
                        <span className="text-sm font-mono text-slate-500">{patient.id}</span>
                        <div className="font-bold">{patient.name}</div>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-slate-100 p-2 rounded text-xs font-mono mb-4">
                        cabinetId: "{patient.cabinetId}"<br/>
                        ownerId: "{patient.ownerId}"
                        </div>

                        <div className="flex gap-2">
                        <Can I="READ" this={subject("PATIENT", patient)}>
                            <Button size="sm" variant="outline">View</Button>
                        </Can>

                        <Can I="UPDATE" this={subject("PATIENT", patient)}>
                            <Button size="sm" className="bg-blue-600">Edit</Button>
                        </Can>

                        <Can I="DELETE" this={subject("PATIENT", patient)}>
                            <Button size="sm" variant="destructive">Delete</Button>
                        </Can>
                        </div>
                    </CardContent>
                    </Card>
                ))}
                </div>
            </PermissionsDemoWrapper>
        </div>
    </div>
  )
}