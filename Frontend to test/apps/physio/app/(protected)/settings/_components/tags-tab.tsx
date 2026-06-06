"use client";

import React from "react";
import { Input } from "@physio-connect-frontend/shared-ui";
import { Trash } from "lucide-react";

type TagListData = {
  name: string;
  min: number;
  max: number;
}

const tagListData: TagListData[] = [
  { name: "nom de Tag", min: 1, max: 100 },
  { name: "nom de Tag", min: 1, max: 100 },
  { name: "nom de Tag", min: 1, max: 100 },
];

export default function TagsTab() {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-medium">Liste de Tags</h3>
      
      <div className="border-b border-b-gray-100">
          {tagListData.map((data, index) => (
              <div
                  key={index}
                  className="py-4 w-full flex md:flex-row flex-col md:items-center items-start md:gap-10 gap-5 border-t-gray-100 border-t"
              >
                  <div className="lg:w-96 md:w-54 w-full flex items-center md:justify-normal justify-between gap-5">
                    <span className="lg:text-lg md:text-base text-lg font-medium">{data.name}</span>

                    <div className="block md:hidden ml-auto">
                        <Trash className="lg:h-12 lg:w-12 h-10 w-10 p-2.5 rounded-full text-destructive border border-destructive hover:cursor-pointer" />
                    </div>
                  </div>

                  <div className="lg:w-96 md:w-44 w-full flex items-center md:justify-normal justify-between gap-5">
                    <span className="lg:text-lg md:text-base text-lg font-medium whitespace-nowrap">Valeur minimal</span>
                    <Input defaultValue={data.min} className="w-16 h-9 ml-auto" />
                  </div>

                  <div className="lg:w-96 md:w-44 w-full flex items-center md:justify-normal justify-between gap-5">
                    <span className="lg:text-lg md:text-base text-lg font-medium whitespace-nowrap">Valeur Maximal</span>
                    <Input defaultValue={data.max} className="w-16 h-9 ml-auto" />
                  </div>

                  {/* 👉 Delete icon pushed to the far right */}
                  <div className="hidden md:block ml-auto">
                      <Trash className="lg:h-12 lg:w-12 h-10 w-10 p-2.5 rounded-full text-destructive border border-destructive hover:cursor-pointer" />
                  </div>
              </div>
          ))}
      </div>

      <button className="w-fit m-auto px-4 py-2 border bg-primary text-white rounded-xl">
          Ajouter un tag
      </button>
  </div>
  );
}