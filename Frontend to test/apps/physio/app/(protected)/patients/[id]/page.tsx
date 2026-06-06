"use client"

import React from "react"
import { HeaderLayout } from "@physio-connect-frontend/shared-theme"
import { CustomCard, CustomTable, CustomTableColumn, TableAction, TablePagination } from "@physio-connect-frontend/shared-ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../../libs/shared/ui/src/components/tabs"
import Image from "next/image";
import { Input } from "../../../../../../libs/shared/ui/src/components/input"
import { Textarea } from "../../../../../../libs/shared/ui/src/components/textarea"
import { Album, ArrowLeft, Cake, Calendar, CirclePlus, CreditCard, Download, Edit, FileDown, LocateFixed, Mail, Mic, Paperclip, Phone, Plus, Send, Trash } from "lucide-react"
import { SessionTabs, SessionTabsContent, SessionTabsList, SessionTabsTrigger } from "@/components/patients/session-tabs"

const ExamplePagination = () => {
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Simulation appel /api
    console.log(
      `Page changed: fetching /api/data?page=${newPage}&limit=${rowsPerPage}`,
    );
  };

  const handleRowsPerPageChange = (newLimit: number) => {
    setRowsPerPage(newLimit);
    setPage(1); // On repasse à la première page
    // Simulation appel /api
    console.log(`Rows changed: fetching /api/data?page=1&limit=${newLimit}`);
  };

  return (
    <TablePagination
      currentPage={page}
      totalPages={100}
      onPageChange={handlePageChange}
      lineView={[5, 10, 25, 50]}
      selectedLineView={rowsPerPage}
      onLineViewChange={handleRowsPerPageChange}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

const eyeAction: TableAction[] = [
  {
    key: "view",
    icon: "eye",
    label: "Voir",
    handleClick: (row) => console.log("View", row),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// COLUMNS
// ─────────────────────────────────────────────────────────────────────────────

const appointmentColumns: CustomTableColumn[] = [
  { key: "name", header: "Nom", accessor: "name", width: "260px" },
  { key: "status", header: "Statut", accessor: "status" },
  { key: "nextSession", header: "Prochaine séance", accessor: "nextSession" },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const appointmentsData = [
  {
    name: {
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jean",
      name: "Ali Bayoudh",
      description: "alibayoudh44@gmail.com",
    },
    status: "active",
    nextSession: "24 Mai - 1:30 PM"
  },
  {
    name: {
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alonso",
      name: "Aliça Fernandez",
      description: "alicafernandez@gmail.com",
    },
    status: "active",
    nextSession: "24 Mai - 1:30 PM"
  },
];

export default function PractitionersPage() {
  const [showEditor, setShowEditor] = React.useState(false);

  return (
    <>
      <HeaderLayout
        title="Profil du patient"
        icon={<ArrowLeft className="!text-gray-300 text-[24px]" />}
        action={
          <FileDown className="h-8 w-8 text-primary hover:cursor-pointer" />
        }
      />
      <div className="flex-1 overflow-y-auto !pl-0 !pt-2 p-6 sm:p-8 space-y-10">
        <div className="flex lg:flex-row flex-col h-full lg:gap-2 gap-2.5">
          <div className="p-3 mx-auto flex flex-col items-center gap-5 sm:max-w-sm">
            <div className="flex flex-col items-center gap-4">
              <Image
                src="/avatar3.jpg"
                alt="avatar"
                width={105}
                height={107}
                className="rounded-xl border-2 border-primary"
              />

              <h3 className="xl:text-2xl text-[22px] text-neutral-950 font-medium text-center">Jean Pierre</h3>
            </div>

            <span className="text-sm text-foreground-muted font-medium">Informations du patient</span>
            
            <ul className="space-y-6">
              <li className="flex items-center gap-5">
                <Cake className="!text-primary sm:text-lg text-base" />
                <span className="sm:text-base 2xl:text-sm text-xs font-medium">27 Juillet 1994</span>
              </li>
              <li className="flex items-center gap-5">
                <LocateFixed className="!text-primary sm:text-lg text-base" />
                <span className="sm:text-base 2xl:text-sm text-xs font-medium">Rue Paul-Belmondo, 75012 Paris, France</span>
              </li>
              <li className="flex items-center gap-5">
                <Phone className="!text-primary sm:text-lg text-base" />
                <span className="sm:text-base 2xl:text-sm text-xs font-medium">+33 6 74 57 66 29</span>
              </li>
              <li className="flex items-center gap-5">
                <Mail className="!text-primary sm:text-lg text-base" />
                <span className="sm:text-base 2xl:text-sm text-xs font-medium">Jeanpierre94@gmail.com</span>
              </li>
              <li className="flex items-center gap-5">
                <CreditCard className="!text-primary sm:text-lg text-base" />
                <span className="sm:text-base 2xl:text-sm text-xs font-medium">
                  <span className="text-primary">Abonnement Actif</span>
                  <br />
                  <span className="!text-sm text-foreground-muted">Prochain : 30 Oct 2025</span>
                </span>
              </li>
            </ul>

            <div className="h-0.5 w-32 bg-primary-300"></div>
          </div>

          <div className="h-full w-0.5 min-w-0.5 bg-primary-100"></div>

          {/* Appointments */}
          <section className="w-full pl-5">
            <Tabs defaultValue="program" className="w-full">
              <TabsList className="border-b border-b-gray-200 rounded-none [&>button]:grow-0">
                <TabsTrigger value="program">Programme</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="conversation">Conversation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="program" className="grid gap-5">
                <div className="w-full flex justify-between items-center gap-2 py-2.5 border-l-4 border-primary">
                  <div className="flex items-center gap-4">
                    <h4 className="pl-2.5 2xl:text-2xl sm:text-lg text-base font-medium">Rééducation kinésithérapique pour une lombalgie chronique</h4>
                    <Download className="h-11 w-11 p-2.5 rounded-full text-primary border border-primary hover:cursor-pointer" />
                  </div>
                  
                  <div className="hidden sm:flex items-center gap-4">
                    <Edit className="!text-primary h-7 w-7 hover:cursor-pointer" />
                    <Trash className="!text-destructive h-7 w-7 hover:cursor-pointer" />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-medium text-[#786DDB]">Objectifs globaux</h3>
                  <div className="flex 2xl:gap-2.5 gap-1 flex-wrap">
                    <span className="px-2.5 py-1 2xl:text-sm sm:text-xs text-[10px] font-medium rounded-full border border-primary">Restaurer la mobilité lombaire</span>
                    <span className="px-2.5 py-1 2xl:text-sm sm:text-xs text-[10px] font-medium rounded-full border border-primary">Soulager la douleur</span>
                    <span className="px-2.5 py-1 2xl:text-sm sm:text-xs text-[10px] font-medium rounded-full border border-primary">Prévenir les récidives</span>
                    <span className="px-2.5 py-1 2xl:text-sm sm:text-xs text-[10px] font-medium rounded-full border border-primary">Renforcer la sangle abdominale</span>
                    <span className="px-2.5 py-1 2xl:text-sm sm:text-xs text-[10px] font-medium rounded-full border border-primary">Renforcer les muscles posturaux</span>
                  </div>
                  <div className="m-auto h-0.5 w-[130px] rounded-full bg-[#B9EBEA]"></div>
                </div>

                <div className="w-full min-w-0 overflow-hidden">
                  <h3 className="text-xl text-[#414246] font-medium mb-4">Semaine 2/3</h3>

                  <SessionTabs defaultValue="s1" className="w-full">
                    <SessionTabsList className="flex flex-nowrap overflow-x-auto scrollbar-hide no-scrollbar w-full border-b border-gray-200 gap-2 pb-2 [&>button]:shrink-0">
                      <SessionTabsTrigger value="s1" variant="primary">9 Jun <br /> Lun</SessionTabsTrigger>
                      <SessionTabsTrigger value="s2" variant="neutral">10 Jun <br /> Mar</SessionTabsTrigger>
                      <SessionTabsTrigger value="s3" variant="secondary">11 Jun <br /> Mer</SessionTabsTrigger>
                    </SessionTabsList>

                    <SessionTabsContent value="s1" className="p-4 w-full rounded-xl bg-[#F7F7F7]">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="sm:text-xl text-base font-medium">Séance 1</h3>
                        <Edit className="!text-primary h-7 w-7 hover:cursor-pointer" />
                      </div>

                      <div className="flex flex-col gap-4">
                        <h3 className="text-lg font-medium text-[#786DDB]">Objectifs de la séance</h3>
                        <div className="flex flex-wrap gap-2.5">
                          <span className="px-2.5 py-1  2xl:text-sm sm:text-xs text-[10px] font-medium rounded-full bg-white border border-primary">Restaurer la mobilité lombaire</span>
                          <span className="px-2.5 py-1  2xl:text-sm sm:text-xs text-[10px] font-medium rounded-full bg-white border border-primary">Soulager la douleur</span>
                          <span className="px-2.5 py-1  2xl:text-sm sm:text-xs text-[10px] font-medium rounded-full bg-white border border-primary">Prévenir les récidives</span>
                        </div>
                      </div>

                      <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 sm:grid-cols-2 gap-5 mt-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <CustomCard
                            key={`tags-${i}`}
                            title="Reprise Progressive de l’Activité Physique"
                            image="https://previews.123rf.com/images/dolgachov/dolgachov2111/dolgachov211100965/177818187-man-doing-sports-and-stretching-leg-outdoors.avif"
                            showActions={true}
                            handleShow={() => console.log("Show clicked")}
                            handleDownload={() => console.log("Download clicked")}
                            tags={["Mobilité", "Tag 2"]}
                          />
                        ))}
                      </div>
                    </SessionTabsContent>

                    <SessionTabsContent value="s2" className="p-4 w-full rounded-xl bg-[#F7F7F7]">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="sm:text-xl text-base font-medium">Séance 2</h3>
                        <Edit className="!text-primary h-7 w-7 hover:cursor-pointer" />
                      </div>

                      <div className="flex flex-col gap-4">
                        <h3 className="text-lg font-medium text-[#786DDB]">Objectifs de la séance</h3>
                        <div className="flex flex-wrap gap-2.5">
                          <span className="px-2.5 py-1  2xl:text-sm sm:text-xs text-[10px] font-medium rounded-full bg-white border border-primary">Restaurer la mobilité lombaire</span>
                          <span className="px-2.5 py-1  2xl:text-sm sm:text-xs text-[10px] font-medium rounded-full bg-white border border-primary">Renforcer la sangle abdominale</span>
                          <span className="px-2.5 py-1  2xl:text-sm sm:text-xs text-[10px] font-medium rounded-full bg-white border border-primary">Renforcer les muscles posturaux</span>
                        </div>
                      </div>

                      <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 sm:grid-cols-2 gap-5 mt-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <CustomCard
                            key={`tags-${i}`}
                            title="Reprise Progressive de l’Activité Physique"
                            image="https://cdn3.institut-kinesitherapie.paris/wp-content/uploads/2023/03/sport-cinq-exercices-pour-ameliorer-l-equilibre-listing-kinesitherapie-paris.jpg"
                            showActions={true}
                            handleShow={() => console.log("Show clicked")}
                            handleDownload={() => console.log("Download clicked")}
                            tags={["Mobilité", "Tag 2"]}
                          />
                        ))}
                      </div>
                    </SessionTabsContent>
                    
                    <SessionTabsContent value="s3" className="p-4 w-full rounded-xl bg-[#F7F7F7]">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="sm:text-xl text-base font-medium">Séance 3</h3>
                        <Edit className="!text-primary h-7 w-7 hover:cursor-pointer" />
                      </div>

                      <div className="flex flex-col gap-4">
                        <h3 className="text-lg font-medium text-[#786DDB]">Objectifs de la séance</h3>
                        <div className="flex flex-wrap gap-2.5">
                          <span className="px-2.5 py-1  2xl:text-sm sm:text-xs text-[10px] font-medium rounded-full bg-white border border-primary">Restaurer la mobilité lombaire</span>
                          <span className="px-2.5 py-1  2xl:text-sm sm:text-xs text-[10px] font-medium rounded-full bg-white border border-primary">Soulager la douleur</span>
                          <span className="px-2.5 py-1  2xl:text-sm sm:text-xs text-[10px] font-medium rounded-full bg-white border border-primary">Renforcer la sangle abdominale</span>
                          <span className="px-2.5 py-1  2xl:text-sm sm:text-xs text-[10px] font-medium rounded-full bg-white border border-primary">Renforcer les muscles posturaux</span>
                        </div>
                      </div>

                      <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 sm:grid-cols-2 gap-5 mt-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <CustomCard
                            key={`tags-${i}`}
                            title="Reprise Progressive de l’Activité Physique"
                            image="https://fr.egym-wellpass.com/sites/default/files/egym-brand/Wellpass/Blog%20FR/Sport%20duo.jpg"
                            showActions={true}
                            handleShow={() => console.log("Show clicked")}
                            handleDownload={() => console.log("Download clicked")}
                            tags={["Mobilité", "Tag 2"]}
                          />
                        ))}
                      </div>
                    </SessionTabsContent>
                  </SessionTabs>
                </div>
              </TabsContent>

              <TabsContent value="notes">
                <Tabs defaultValue="myNotes" className="w-full">
                  <TabsList className="border-b border-b-gray-200 rounded-none">
                      <TabsTrigger value="myNotes">Mes Notes</TabsTrigger>
                      <TabsTrigger value="patientNotes">Notes de Patient</TabsTrigger>
                  </TabsList>

                  <TabsContent value="myNotes" className="flex 2xl:flex-row flex-col gap-2.5">
                    <div className="md:w-[414px] md:min-w-[414px] w-full rounded-xl border border-border">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3.5 py-2.5 px-2.5 border-l-4 border-primary border-b border-b-border">
                          <div className="flex justify-between items-center">
                            <span className="md:text-xl text-lg text-primary">Lorem Ipsum dolar...</span>
                            <span className="md:text-base text-sm">18 Juin</span>
                          </div>
                          <span className="md:text-sm text-xs">Lorem ipsum dolor sit amet, consectetur adipiscing elit</span>
                        </div>
                        <div 
                          className="m-auto pb-10 flex items-center gap-1 hover:cursor-pointer"
                          onClick={() => setShowEditor(true)}
                        >
                          <CirclePlus className="!text-primary h-4 w-4" />
                          <span className="text-sm underline">Ajouter une note</span>
                        </div>
                      </div>
                    </div>

                    {showEditor && (
                      <div className="v36_15578 flex flex-col gap-5 p-4 rounded-xl w-full border border-border">
                        <div className="flex sm:flex-row flex-col sm:items-center items-end gap-2.5">
                          <Input id="name" autoComplete="off" placeholder="Chercher par nom ou ID" className="w-full" />
                          <div className="flex items-center gap-2.5">
                            <button className="p-3 border border-input text-input-foreground rounded-xl">
                              <Paperclip className="text-[18px]" />
                            </button>
                            <button className="p-3 border border-input text-primary rounded-xl">
                              <Mic className="text-[18px]" />
                            </button>
                            <button className="px-4 py-3 bg-primary text-white rounded-xl">Enregistrer</button>
                          </div>
                        </div>
                        
                        <div className="m-auto h-0.5 w-[238px] rounded-full bg-[#DEDAF7]"></div>

                        <Textarea placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam" className="w-full h-[540px]" />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="patientNotes" className="!mt-0 flex 2xl:flex-row flex-col gap-4">
                    <div className="md:w-[414px] md:min-w-[414px] w-full rounded-xl border border-border">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3.5 py-2.5 px-2.5 border-l-4 border-primary border-b border-b-border">
                          <div className="flex justify-between items-center">
                            <span className="md:text-xl text-lg text-primary">Lorem Ipsum dolar...</span>
                            <span className="md:text-base text-sm">18 Juin</span>
                          </div>
                          <span className="md:text-sm text-xs">Lorem ipsum dolor sit amet, consectetur adipiscing elit</span>
                        </div>
                      </div>
                    </div>

                    <div className="v36_15578 flex flex-col gap-5 p-4 rounded-xl w-full border border-border">
                      <div className="m-auto h-0.5 w-[238px] rounded-full bg-[#DEDAF7]"></div>

                      <div className="p-2.5 w-full h-[540px] bg-white rounded-xl">
                        <div className="flex items-start gap-3">
                          <Image
                            src="/avatar3.jpg"
                            alt="avatar"
                            width={40}
                            height={40}
                            className="rounded-xl border-2 border-primary"
                          />
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <span className="md:text-xl text-base font-medium">Jean Pierre</span>
                              <div className="w-[1px] h-7 bg-[#B3B3B3]"></div>
                              <span className="text-base font-medium text-gray-400">2:45 PM</span>
                            </div>

                            <span className="w-fit px-4 py-3  2xl:text-sm sm:text-xs text-[10px] font-medium rounded-xl text-[#414246] bg-[#EFF7FF]">Les exercices étaient vraiment difficiles aujourd’hui, surtout le gainage. J’ai eu du mal à tenir à cause de mes douleurs au bas du dos qui se réveillent </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-row flex-col sm:items-center items-end gap-2.5">
                        <Input id="name" autoComplete="off" placeholder="Écrire un commentaire" className="w-full" />
                        <div className="flex items-center gap-2.5">
                          <button className="p-3 border border-input text-input-foreground rounded-xl">
                            <Paperclip className="text-[18px]" />
                          </button>
                          <button className="p-3 border border-input text-primary rounded-xl">
                            <Mic className="text-[18px]" />
                          </button>
                          <button className="px-4 py-3 bg-primary text-white rounded-xl">Répondre</button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>
              
              <TabsContent value="conversation">
                <div className="flex flex-col gap-5 py-4 sm:px-4 w-full">
                  <div className="flex items-center gap-5">
                    <div className="h-0.5 w-full rounded-full bg-[#DEDAF7]"></div>
                    <span className=" 2xl:text-sm text-xs font-medium whitespace-nowrap">Aujourd’hui 2:45 PM</span>
                    <div className="h-0.5 w-full rounded-full bg-[#DEDAF7]"></div>
                  </div>

                  <div className="p-2.5 w-full h-[345px] bg-white rounded-xl">
                    <div className="flex items-start gap-3">
                      <Image
                        src="/avatar3.jpg"
                        alt="avatar"
                        width={40}
                        height={40}
                        className="rounded-xl border-2 border-primary"
                      />
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <span className="md:text-xl text-base font-medium">Jean Pierre</span>
                          <div className="w-[1px] h-7 bg-[#B3B3B3]"></div>
                          <span className="md:text-base text-sm font-medium text-gray-400">2:45 PM</span>
                        </div>

                        <span className="w-fit px-4 py-3  2xl:text-sm text-xs font-medium rounded-xl text-[#414246] bg-[#EFF7FF]">Alooo Docteur !</span>
                      </div>
                    </div>
                      
                    <div className="mt-8 ml-auto w-fit flex flex-col gap-2">
                      <div className="ml-auto flex gap-2">
                        <span className="text-base font-medium text-gray-400">2:45 PM</span>
                        <div className="w-[1px] h-7 bg-[#B3B3B3]"></div>
                        <span className="md:text-xl text-base font-medium text-primary">Vous</span>
                      </div>

                      <span className="w-fit px-4 py-3  2xl:text-sm text-xs font-medium rounded-xl text-white bg-primary">Je vais t’appeler dans 2 min</span>
                    </div>
                  </div>

                  <div className="sm:p-6 p-4 !pb-4 flex flex-col gap-3 rounded-xl bg-[#F9FBFA] border border-border">
                    <Textarea placeholder="" className="w-full h-[200px]" />

                    <div className="flex sm:flex-row flex-col justify-between sm:items-center items-end gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <button className="p-3 border border-primary text-input-foreground rounded-xl">
                          <Paperclip className="text-[18px]" />
                        </button>
                        <button className="p-3 border border-primary text-input-foreground rounded-xl">
                          <Mic className="text-[18px] " />
                        </button>
                        <button className="p-3 border border-primary text-input-foreground rounded-xl">
                          <Mic className="text-[18px]" />
                        </button>
                      </div>

                      <button className="px-4 py-3 flex items-center gap-2 bg-primary text-white rounded-xl">
                        <Send className="h-5 w-5" />
                        Envoyer
                      </button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </div>
    </>
  );
}