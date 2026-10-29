"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "cmdk"
import { searchService, type SearchResult } from "@/services/search.service"
import { Landmark, ArrowLeftRight, FileText, TrendingDown, SearchIcon } from "lucide-react"

const categoryIcons: Record<string, typeof Landmark> = {
  "Contas Bancárias": Landmark,
  "Transações": ArrowLeftRight,
  "Entradas / Saídas Fixas": FileText,
  "Dívidas": TrendingDown,
}

export function CommandSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Record<string, SearchResult[]>>({})
  const router = useRouter()

  // Listen for ⌘K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Search with debounce
  useEffect(() => {
    const timeout = setTimeout(async () => {
      const res = await searchService.search(query)
      setResults(res)
    }, 200)
    return () => clearTimeout(timeout)
  }, [query])

  const handleSelect = useCallback(
    (url: string) => {
      setOpen(false)
      setQuery("")
      router.push(url)
    },
    [router]
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="top-1/3 translate-y-0 overflow-hidden rounded-xl! p-0 sm:max-w-lg"
      >
        <Command className="flex size-full flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground" shouldFilter={false}>
          <div className="flex items-center gap-2 border-b border-border/50 px-3">
            <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
            <input
              className="flex h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Buscar contas, transações, dívidas..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <CommandList className="max-h-72 overflow-y-auto overflow-x-hidden p-2">
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
              {query.length < 2 ? "Digite ao menos 2 caracteres..." : "Nenhum resultado encontrado."}
            </CommandEmpty>
            {Object.entries(results).map(([group, items]) => {
              const Icon = categoryIcons[group] || FileText
              return (
                <CommandGroup key={group} heading={group} className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
                  {items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.title}
                      onSelect={() => handleSelect(item.url)}
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm cursor-pointer data-[selected=true]:bg-muted"
                    >
                      <Icon className="size-4 text-muted-foreground shrink-0" />
                      <div className="flex flex-col">
                        <span>{item.title}</span>
                        {item.subtitle && (
                          <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )
            })}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
