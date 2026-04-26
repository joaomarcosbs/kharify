"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date
  onChange?: (date?: Date) => void
  disabled?: boolean
  className?: string
}

export function DatePicker({ value, onChange, disabled, className }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger render={
        <Button
          variant={"outline"}
          data-slot="date-picker-button"
          className={cn(
            "w-full h-8 justify-start text-left font-normal px-2.5 py-2",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        />
      }>
        {value ? (
          format(value, "PP", { locale: ptBR })
        ) : (
          <span>Selecione uma data</span>
        )}
        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  )
}
