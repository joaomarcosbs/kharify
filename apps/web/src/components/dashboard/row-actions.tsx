"use client"

import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"

interface RowActionsProps {
  onEdit?: () => void
  onDelete?: () => void
  deleteConfirmMessage?: string
}

export function RowActions({
  onEdit,
  onDelete,
  deleteConfirmMessage = "Tem certeza que deseja excluir este item?",
}: RowActionsProps) {
  const [open, setOpen] = useState(false)

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen(false)
    if (confirm(deleteConfirmMessage)) {
      onDelete?.()
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen(false)
    onEdit?.()
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            />
          }
        >
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Ações</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36 rounded-xl p-1 shadow-lg">
          {onEdit && (
            <DropdownMenuItem
              onClick={handleEdit}
              className="cursor-pointer gap-2 text-xs font-medium py-1.5 rounded-lg"
            >
              <Edit className="size-3.5 text-muted-foreground" />
              <span>Editar</span>
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem
              onClick={handleDelete}
              className="cursor-pointer gap-2 text-xs font-medium py-1.5 text-rose-500 focus:text-rose-500 rounded-lg"
            >
              <Trash2 className="size-3.5" />
              <span>Excluir</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
