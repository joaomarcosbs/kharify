"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PreferencesPage() {
  const [currency, setCurrency] = useState("BRL")
  const [cycleStart, setCycleStart] = useState("1")
  const [alertLowBalance, setAlertLowBalance] = useState(true)
  const [alertDebt, setAlertDebt] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-12">
      <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-fit group">
        <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" /> Voltar para Configurações
      </Link>
      
      <PageHeader
        title="Preferências"
        description="Ajuste a moeda, ciclo contábil e como quer ser notificado."
        breadcrumbs={[
          { label: "Configurações", href: "/settings" },
          { label: "Preferências" }
        ]}
      />

      <div className="flex flex-col gap-6">
        
        {/* Regionais */}
        <div className="rounded-2xl border border-border/50 bg-background dark:bg-sidebar shadow-sm p-6 flex flex-col gap-5">
          <div className="mb-2">
            <h3 className="text-base font-semibold">Regionais e Contabilidade</h3>
            <p className="text-[13px] text-muted-foreground mt-1">Configurações que afetam como seus números são calculados e exibidos.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Moeda Base</label>
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-xl border border-border/50 bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="BRL">R$ Real Brasileiro (BRL)</option>
                <option value="USD">$ Dólar Americano (USD)</option>
                <option value="EUR">€ Euro (EUR)</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Início do Ciclo Contábil</label>
              <select 
                value={cycleStart} 
                onChange={(e) => setCycleStart(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-xl border border-border/50 bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="1">Dia 1</option>
                <option value="5">Dia 5</option>
                <option value="10">Dia 10</option>
                <option value="15">Dia 15</option>
                <option value="20">Dia 20</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notificações */}
        <div className="rounded-2xl border border-border/50 bg-background dark:bg-sidebar shadow-sm p-6 flex flex-col gap-6">
          <div className="mb-2">
            <h3 className="text-base font-semibold">Notificações e Alertas</h3>
            <p className="text-[13px] text-muted-foreground mt-1">Escolha sobre o que o Kharify deve te avisar por e-mail ou push.</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col mr-4">
              <span className="text-sm font-medium">Alerta de Saldo Baixo</span>
              <span className="text-[13px] text-muted-foreground mt-0.5">Aviso quando as saídas superarem as entradas consolidadas.</span>
            </div>
            <Switch checked={alertLowBalance} onCheckedChange={setAlertLowBalance} />
          </div>
          
          <hr className="border-border/50" />

          <div className="flex items-center justify-between">
            <div className="flex flex-col mr-4">
              <span className="text-sm font-medium">Lembrete de Dívidas</span>
              <span className="text-[13px] text-muted-foreground mt-0.5">Aviso de vencimento de parcelamento 3 dias antes.</span>
            </div>
            <Switch checked={alertDebt} onCheckedChange={setAlertDebt} />
          </div>

          <hr className="border-border/50" />

          <div className="flex items-center justify-between">
            <div className="flex flex-col mr-4">
              <span className="text-sm font-medium">Flash Semanal (Weekly Digest)</span>
              <span className="text-[13px] text-muted-foreground mt-0.5">Receba um resumo financeiro toda sexta-feira às 18h no seu email.</span>
            </div>
            <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button className="gap-2 rounded-xl">
            <Save className="size-4" />
            Salvar Preferências
          </Button>
        </div>
      </div>
    </div>
  )
}
