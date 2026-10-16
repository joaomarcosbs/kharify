"use client"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { CheckCircle2, CreditCard, Zap, Download, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const INVOICES = [
  { id: "INV-001", date: "15 Abr, 2026", amount: "R$ 49,90", status: "Pago" },
  { id: "INV-002", date: "15 Mar, 2026", amount: "R$ 49,90", status: "Pago" },
  { id: "INV-003", date: "15 Fev, 2026", amount: "R$ 49,90", status: "Pago" },
]

export default function BillingPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-6 pb-12">
      <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-fit group">
        <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" /> Voltar para Configurações
      </Link>
      
      <PageHeader
        title="Faturamento e Planos"
        description="Gerencie sua assinatura e pague suas faturas."
        breadcrumbs={[
          { label: "Configurações", href: "/settings" },
          { label: "Faturamento" }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Main Content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Current Plan Card */}
          <div className="rounded-[24px] border border-border/50 bg-background dark:bg-sidebar shadow-[0_20px_40px_-5px_rgba(0,0,0,0.06)] p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-primary mb-1">Seu Plano Atual</span>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  Kharify Gestor <CheckCircle2 className="size-5 text-emerald-500" />
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Sua próxima fatura de R$ 49,90 será em 15 de Mai, 2026.</p>
              </div>
              <Button
                variant="outline"
                className="rounded-xl border-border/50 shrink-0"
                onClick={() => toast.info('Cancelamento em breve 🚧')}
              >
                Cancelar Assinatura
              </Button>
            </div>
            
            <div className="bg-muted/40 p-4 rounded-xl flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center gap-2"><Users className="size-4" /> Uso de Membros</span>
                <span className="font-semibold">3 / 5 Membros</span>
              </div>
              <div className="w-full bg-border/50 rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>

          {/* Invoices */}
          <div className="rounded-[24px] flex flex-col border border-border/50 bg-background dark:bg-sidebar shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <h3 className="text-base font-semibold">Histórico de Faturas</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80"
                onClick={() => toast.info('Em breve 🚧')}
              >
                Ver todas
              </Button>
            </div>
            <div className="flex flex-col">
              {INVOICES.map((inv, index) => (
                <div key={inv.id} className={`flex items-center justify-between p-4 px-6 ${index !== INVOICES.length - 1 ? 'border-b border-border/50' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="size-10 bg-muted/40 rounded-lg flex items-center justify-center shrink-0">
                      <CreditCard className="size-5 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{inv.amount}</span>
                      <span className="text-xs text-muted-foreground">{inv.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="inline-flex py-1 px-2.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[11px] font-semibold uppercase tracking-wider">
                      {inv.status}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground"
                      onClick={() => toast.info('Download em breve 🚧')}
                    >
                      <Download className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upgrade Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="rounded-[24px] border-2 border-primary bg-primary/5 p-6 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4">
              <Zap className="size-5 text-primary fill-primary/20" />
            </div>
            <span className="inline-flex py-1 px-2.5 rounded-md bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider mb-4">
              Recomendado
            </span>
            <h3 className="text-lg font-bold mb-1">Kharify Enterprise</h3>
            <div className="flex items-end gap-1 mb-4">
              <span className="text-3xl font-black">R$ 199</span>
              <span className="text-sm text-muted-foreground font-medium mb-1.5">/mês</span>
            </div>
            <p className="text-[13px] text-muted-foreground mb-6">
              Ideal para negócios escalando com auditoria financeira completa e multi-entidades.
            </p>
            <ul className="flex flex-col gap-2 mb-6 text-[13px] font-medium">
              <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-emerald-500 shrink-0" /> Membros ilimitados</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-emerald-500 shrink-0" /> Open Finance (Itaú, Bradesco)</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-emerald-500 shrink-0" /> Log de Auditoria Completo</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="size-4 text-emerald-500 shrink-0" /> Suporte dedicado via WhatsApp</li>
            </ul>
            <Button
              className="w-full rounded-xl gap-2 font-bold hover:-translate-y-0.5 transition-all"
              onClick={() => toast.info('Upgrade em breve 🚧')}
            >
              <Zap className="size-4" /> Evoluir agora
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}
