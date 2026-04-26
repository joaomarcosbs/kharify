"use client"

import type { ReactNode } from "react"
import { useState, useEffect } from "react"
import { usePrivacyStore } from "@/stores/privacy-store"

interface StatCardProps {
  title: string
  value: string
  trend?: string
  trendDirection?: "up" | "down" | "neutral"
  icon?: ReactNode
  className?: string
}

const obfuscateMoney = (text: string) => {
  return text.replace(/R\$\s?[\d.,]+/g, 'R$ ****')
}

export function StatCard({ title, value, trend, trendDirection = "up", icon, className }: StatCardProps) {
  const hideBalances = usePrivacyStore(state => state.hideBalances)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const shouldHide = mounted && hideBalances

  const trendColor = {
    up: "text-emerald-500",
    down: "text-red-400",
    neutral: "text-muted-foreground",
  }[trendDirection]

  const displayValue = shouldHide && value.includes("R$") ? obfuscateMoney(value) : (shouldHide && !isNaN(Number(value.replace(/\D/g, ''))) && value.length > 0 ? "****" : value)
  const displayTrend = shouldHide && trend ? obfuscateMoney(trend) : trend

  return (
    <div className={`rounded-[24px] border-none bg-background dark:bg-sidebar p-6 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] transition-all duration-200 hover:-translate-y-1 group relative overflow-hidden ${className || ""}`}>
      <div className="flex items-center justify-between pb-4">
        <h3 className="font-semibold text-muted-foreground text-sm">{title}</h3>
        {icon && (
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary/5 text-primary/70">
            {icon}
          </div>
        )}
      </div>
      <div className="text-3xl font-semibold tracking-tighter mb-3">{displayValue}</div>
      {displayTrend && (
        <p className={`text-[13px] font-medium ${trendColor}`}>{displayTrend}</p>
      )}
    </div>
  )
}
