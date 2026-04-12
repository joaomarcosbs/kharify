export function CashflowChart() {
  return (
    <div className="rounded-[32px] border-none bg-background dark:bg-sidebar p-8 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] md:col-span-2 relative overflow-hidden flex flex-col gap-6 transition-all duration-200">
      <h3 className="font-semibold text-xl">Fluxo de Caixa Analítico</h3>
      <div className="min-h-[400px] rounded-[1.5rem] bg-muted/30 w-full flex items-center justify-center border border-white/10 shadow-inner transition-colors duration-200">
        <span className="text-muted-foreground font-medium">Área reservada para o Gráfico de Linhas</span>
      </div>
    </div>
  )
}
