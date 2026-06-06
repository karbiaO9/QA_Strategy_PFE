"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@physio-connect-frontend/shared-ui";

type PaymentStatus = "paid" | "pending" | "cancelled";

type Payment = {
  id: string;
  plan: string;
  amount: string;
  date: string;
  status: PaymentStatus;
  download?: boolean;
};

type CustomTableColumn<T> = {
  key: string;
  header: string;
  accessor: keyof T;
};

const statusConfig = {
  paid: {
    label: "Payé",
    className: "rounded-full bg-[#00BEBB]",
  },
  pending: {
    label: "En attente",
    className: "rounded-full bg-[#ECC91A]",
  },
  cancelled: {
    label: "Annulé",
    className: "rounded-full bg-[#AA273A]",
  },
} as const;

const paymentColumns: CustomTableColumn<Payment>[] = [
  { key: "id", header: "ID Facture", accessor: "id" },
  { key: "plan", header: "Abonnement", accessor: "plan" },
  { key: "amount", header: "Montant", accessor: "amount" },
  { key: "date", header: "Date de la facture", accessor: "date" },
  { key: "status", header: "Statut", accessor: "status" },
  { key: "download", header: "Télécharger", accessor: "download" }
];

const paymentData: Payment[] = [
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

export default function PaymentTab() {
  return (
    <>
        <div className="flex flex-col gap-4">
            <h3 className="text-lg font-medium">Historique de paiment</h3>
            
            <div className="hidden md:block w-full border border-border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {paymentColumns.map((column) => (
                                <TableHead
                                    key={column.key}
                                    className={`font-semibold text-gray-600 text-sm border-b border-gray-100 ${
                                        column.accessor === "download" ? "text-right" : ""
                                    }`}
                                >
                                    {column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {paymentData.map((row, rowIndex) => (
                            <TableRow
                                key={`row-${rowIndex}-${JSON.stringify(row).substring(0, 20)}`}
                                className={`border-gray-100 transition-colors hover:bg-gray-50 ${
                                    rowIndex % 2 != 0 ? "bg-[#F5FAFF]" : ""
                                }`}
                            >
                            
                                {paymentColumns.map((column) => {
                                    if (column.accessor === "download") {
                                        return (
                                            <TableCell key={`${rowIndex}-download`} className="py-4">
                                                <div className="w-full flex justify-end pr-8">
                                                    <span className="icon-download text-[20px] hover:cursor-pointer text-gray-400 hover:text-gray-600"></span>
                                                </div>
                                            </TableCell>
                                        );
                                    }

                                    if (column.accessor === "status") {
                                        const status = row.status;
                                        const config = statusConfig[status];

                                        return (
                                        <TableCell key={`${rowIndex}-status`} className="py-4 flex items-center gap-2">
                                            <div className={`h-2 w-2 ${config.className}`}></div>
                                            <span className="text-sm font-medium">{config.label}</span>
                                        </TableCell>
                                        );
                                    }

                                    return (
                                        <TableCell key={`${rowIndex}-${column.key}`} className="py-4">
                                            <span className="text-sm font-medium">{row[column.accessor]}</span>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col md:hidden gap-5">
                {paymentData.map((row, rowIndex) => (
                    <div
                        key={`mobile-row-${rowIndex}-${JSON.stringify(row).substring(0, 20)}`}
                        className={`pb-4 border border-border rounded-lg ${
                            rowIndex % 2 != 0 ? "bg-[#F5FAFF]" : ""
                        }`}
                    >
                    {paymentColumns.map((column) => (
                        <div
                            key={column.key}
                            className="pt-4 px-5 flex items-center justify-between"
                        >
                        <span className="font-semibold text-sm">
                            {column.header}
                        </span>

                        {(() => {
                            if (column.accessor === "download") {
                            return (
                                <div className="flex justify-end">
                                <span className="icon-download text-[20px] cursor-pointer text-gray-400 hover:text-gray-600"></span>
                                </div>
                            );
                            }

                            if (column.accessor === "status") {
                            const status = row.status;
                            const config = statusConfig[status];

                            return (
                                <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 ${config.className}`}></div>
                                <span className="text-sm font-medium">
                                    {config.label}
                                </span>
                                </div>
                            );
                            }

                            return (
                            <span className="text-sm font-medium">
                                {row[column.accessor]}
                            </span>
                            );
                        })()}
                        </div>
                    ))}
                    </div>
                ))}
            </div>
        </div>
    </>
  );
}