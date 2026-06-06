"use client";

import React from "react";
import { Download } from "lucide-react";
import { cn, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@physio-connect-frontend/shared-ui";

type Bill = {
  description: string;
  quantity: string;
  price: string;
  total: string;
};

type CustomTableColumn<T> = {
  key: string;
  header: string;
  accessor: keyof T;
};

const billColumns: CustomTableColumn<Bill>[] = [
  { key: "id", header: "Description", accessor: "description" },
  { key: "plan", header: "QTY", accessor: "quantity" },
  { key: "amount", header: "Prix", accessor: "price" },
  { key: "date", header: "TOTAL", accessor: "total" }
];

const billData: Bill[] = [
  {
    description: "Frais d’Abonnement",
    quantity: "1",
    price: "€ 128",
    total: "€ 128",
  },
  {
    description: "Frais sur les patients actifs",
    quantity: "23",
    price: "€ 2,30",
    total: "€ 2,300",
  },
  {
    description: "TVA(%)",
    quantity: "1",
    price: "€ 276",
    total: "€ 276",
  },
];

export default function BillingTab() {
  return (
    <>
      <div>
          <h3 className="text-lg font-medium mb-2">Mon abonnement</h3>
          <div className="py-3 w-full border-t border-t-border border-b border-b-border">
              <h4 className="text-lg font-medium">Plan actuel</h4>
              <span className="text-xs text-gray-500">Vous pouvez mettre à jour votre plan à tout moment pour l’adapter à vos besoins.</span>
              <br />
              <span className="text-sm text-[#8A38F5]">Changer de forfait</span>
              <div className="mt-2.5 p-4 bg-[#F6F4FF] rounded-xl">
                  <h3 className="text-xl font-medium mb-3.5">Forfait de base – <span className="text-[#8A38F5]">99 €/mois</span></h3>
                  <h5 className="text-sm font-medium text-gray-400 underline">comprend jusqu'à 20 utilisateurs, 10 Go de stockage cloud individuel et un accès aux fonctionnalités minimales.</h5>

              </div>
          </div>
      </div>
      <div>
          <div className="flex justify-between">
              <h3 className="text-lg font-medium mb-2">Prochaine facture</h3>
              <div className="flex items-center gap-1.5 hover:cursor-pointer">
                  <Download className="h-4 w-4 text-primary" />
                  <h4 className="text-lg font-medium underline">Télécharger</h4>
              </div>
          </div>
          <div className="py-3 w-full border-t border-t-border">
              <div className="relative p-4 rounded-xl border border-border">
                    <div className="absolute top-0 left-0 m-4 p-8 h-[120px] w-[calc(100%-2rem)] rounded-xl bg-[#F6F8FC] flex justify-center items-start z-0">
                        <span className="text-[10px] text-[#868DA6] text-center"><span className="font-semibold">XXX & Connect</span> /  12345 6789 FR0001</span>
                    </div>

                    <div className="relative mt-16 2xl:mx-10 xl:mx-4 sm:mx-10 mx-4 space-y-4 z-10">
                        <div className="p-7 rounded-xl bg-primary shadow-[0_3px_12px_0_rgba(35,136,255,0.33)] flex justify-between items-center">
                            <div className="text-white max-w-40">
                                <span className="text-[10px] uppercase">Facture pour :</span>
                                <h6 className="text-white text-sm">Albert Van Helsing</h6>
                                <span className="text-[10px]">(33) 856 - 0989</span><br />
                                <span className="text-[10px]">Pablo Alto, Paris,  92102, République française</span>
                            </div>

                            <div className="p-3 !pl-5 flex flex-col items-end rounded-xl bg-white">
                                <span className="text-neutral-500 text-[9px] uppercase">Montant à retroceder</span>
                                <h5 className="text-2xl font-semibold">€2,603</h5>
                                <span className="text-neutral-500 text-[9px]">Juillet 26, 2025</span>
                            </div>
                        </div>

                        <div>
                            <div className="2xl:px-6 2xl:py-4 xl:px-4 xl:py-3 px-6 py-4 rounded-xl bg-[#F6F8FC] flex justify-between 2xl:gap-5 xl:gap-4 gap-5">
                                <span>
                                    <span className="2xl:text-xs xl:text-[10px] text-xs text-[#5D6481] uppercase">ID DE FACTURE</span>
                                    <br />
                                    <span className="2xl:text-sm xl:text-xs text-sm">Nº: 000027</span>
                                </span>
                                <span>
                                    <span className="2xl:text-xs xl:text-[10px] text-xs text-[#5D6481] uppercase">DATE:</span>
                                    <br />
                                    <span className="2xl:text-sm xl:text-xs text-sm">Juin 26, 2025</span>
                                </span>
                                <span>
                                    <span className="2xl:text-xs xl:text-[10px] text-xs text-[#5D6481] uppercase">Due Date:</span>
                                    <br />
                                    <span className="2xl:text-sm xl:text-xs text-sm">Juillet 26, 2025</span>
                                </span>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {billColumns.map((column) => {
                                            const isRightColumn =
                                                column.accessor === "quantity" ||
                                                column.accessor === "price" ||
                                                column.accessor === "total";

                                            return (
                                                <TableHead
                                                key={column.key}
                                                className={cn(
                                                    "2xl:p-6 xl:p-4 p-6 text-[#868DA6] 2xl:text-sm xl:text-xs text-sm font-medium uppercase",
                                                    isRightColumn ? "text-right w-0 whitespace-nowrap" : "w-full"
                                                )}
                                                >
                                                    {column.header}
                                                </TableHead>
                                            );
                                        })}
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {billData.map((row, rowIndex) => (
                                        <TableRow
                                            key={`row-${rowIndex}-${JSON.stringify(row).substring(0, 20)}`}
                                            className={`transition-colors border-none ${
                                                rowIndex % 2 == 0 ? "bg-[#F6F8FC] hover:bg-[#F6F8FC]" : "hover:bg-white"
                                            }`}
                                        >
                                        
                                            {billColumns.map((column) => {
                                                const isFirstColumn =
                                                    column.accessor === "description";
                                                const isLastColumn =
                                                    column.accessor === "total";

                                                const isRightColumn =
                                                    column.accessor === "quantity" ||
                                                    column.accessor === "price" ||
                                                    column.accessor === "total";

                                                return (
                                                    <TableCell
                                                        key={`${rowIndex}-${column.key}`}
                                                        className={cn(
                                                            "2xl:px-6 2xl:py-4 xl:px-4 xl:py-3 px-6 py-4",
                                                            isFirstColumn ? "rounded-l-xl " : isLastColumn ? "rounded-r-xl" : "",
                                                            isRightColumn
                                                            ? "w-0 whitespace-nowrap text-right"
                                                            : "w-full"
                                                        )}
                                                    >
                                                        <span
                                                            className={cn(
                                                                "2xl:text-sm xl:text-xs text-sm font-medium",
                                                                column.accessor === "quantity" && "text-[#868DA6]",
                                                                column.accessor === "price" && "text-[#868DA6] font-semibold",
                                                                column.accessor === "total" && "font-semibold"
                                                            )}
                                                        >
                                                            {row[column.accessor]}
                                                        </span>
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <span className="block mt-3 text-right">
                                <span className="2xl:text-xs xl:text-[10px] text-xs text-[#868DA6] uppercase">Montant Total:</span>
                                <br />
                                <span className="2xl:text-2xl text-xl font-medium">€2,603</span>
                            </span>
                        </div>

                        <div className="w-full flex">
                            <button className="px-4 py-2 ml-auto h-12 bg-primary text-white rounded-xl">
                                Payer facture
                            </button>
                        </div>
                    </div>
              </div>
          </div>
      </div>
    </>
  );
}