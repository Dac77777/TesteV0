"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function Agendamentos() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos</CardTitle>
          <CardDescription>Gerencie seus agendamentos de forma eficiente.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
            <div>
              <Label htmlFor="search">Pesquisar Agendamento:</Label>
              <Input id="search" placeholder="Nome do cliente..." type="search" />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="date">Filtrar por Data:</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-[280px] justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd 'de' MMMM, yyyy", { locale: ptBR }) : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Separator />

          <Accordion type="single" collapsible>
            <AccordionItem value="agendamento-1">
              <AccordionTrigger>Agendamento #1 - Cliente A</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <strong>Cliente:</strong> Cliente A
                  </div>
                  <div>
                    <strong>Data/Hora:</strong> 15 de Novembro, 10:00
                  </div>
                  <div>
                    <strong>Serviço:</strong> Corte de Cabelo
                  </div>
                  <div>
                    <strong>Profissional:</strong> João
                  </div>
                  <div>
                    <strong>Status:</strong> Confirmado
                  </div>
                  <div>
                    <strong>Observações:</strong> Sem observações.
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <Button variant="secondary">Editar</Button>
                  <Button variant="destructive">Cancelar</Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="agendamento-2">
              <AccordionTrigger>Agendamento #2 - Cliente B</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <strong>Cliente:</strong> Cliente B
                  </div>
                  <div>
                    <strong>Data/Hora:</strong> 16 de Novembro, 14:00
                  </div>
                  <div>
                    <strong>Serviço:</strong> Manicure
                  </div>
                  <div>
                    <strong>Profissional:</strong> Maria
                  </div>
                  <div>
                    <strong>Status:</strong> Pendente
                  </div>
                  <div>
                    <strong>Observações:</strong> Cliente alérgico a esmalte comum.
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <Button variant="secondary">Editar</Button>
                  <Button variant="destructive">Cancelar</Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
