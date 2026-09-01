"use client"

import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10 text-center">
      <div className="space-y-4 max-w-md">
        <h1 className="text-8xl font-black text-primary/20">404</h1>
        <h2 className="text-2xl font-bold tracking-tight">Página não encontrada</h2>
        <p className="text-muted-foreground text-balance pb-4">
          A página que você está procurando pode ter sido removida, teve seu nome alterado ou está temporariamente indisponível.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/login" className={buttonVariants({ variant: "outline" })}>
            Fazer Login
          </Link>
          <Link href="/home" className={buttonVariants({ variant: "default" })}>
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  )
}
