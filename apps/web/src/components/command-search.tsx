"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { searchService, type SearchResult } from "@/services/search.service"
import { Landmark, ArrowLeftRight, FileText, TrendingDown } from "lucide-react"

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
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Buscar contas, transações, dívidas..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        {Object.entries(results).map(([group, items]) => {
          const Icon = categoryIcons[group] || FileText
          return (
            <CommandGroup key={group} heading={group}>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.title}
                  onSelect={() => handleSelect(item.url)}
                  className="cursor-pointer"
                >
                  <Icon className="size-4 mr-2 text-muted-foreground shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm">{item.title}</span>
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
    </CommandDialog>
  )
}
