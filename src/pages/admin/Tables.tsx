import { useEffect, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Table2, Users, Download, Edit, Trash, Loader2 } from "lucide-react"

import { TableService } from "@/services/table.service"
import type { Table as TableType } from "@/types"
import { theme } from "@/lib/theme"
import { API_BASE_URL } from "@/lib/constants"

import { PageHeader, EmptyState, ConfirmDialog, StatusBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { FormField } from "@/components/forms"

const tableSchema = z.object({
  tableNumber: z.string().min(1, "Required").max(20),
  capacity: z.coerce.number().int().min(1, "Min 1").max(50, "Max 50"),
})

type TableFormValues = z.infer<typeof tableSchema>

export default function Tables() {
  const [tables, setTables] = useState<TableType[]>([])
  const [loading, setLoading] = useState(true)
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<TableType | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const methods = useForm<any>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      tableNumber: "",
      capacity: 4,
    },
  })

  const fetchTables = async () => {
    setLoading(true)
    try {
      const data = await TableService.getTables()
      setTables(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch tables")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTables()
  }, [])

  const handleOpenDialog = (table?: TableType) => {
    if (table) {
      setEditTarget(table)
      methods.reset({ tableNumber: table.tableNumber, capacity: table.capacity })
    } else {
      setEditTarget(null)
      methods.reset({ tableNumber: "", capacity: 4 })
    }
    setDialogOpen(true)
  }

  const onSubmit = async (data: TableFormValues) => {
    try {
      if (editTarget) {
        await TableService.updateTable(editTarget._id, data)
        toast.success("Table updated successfully")
      } else {
        await TableService.createTable(data)
        toast.success("Table created successfully")
      }
      setDialogOpen(false)
      fetchTables()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save table")
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await TableService.deleteTable(deleteTarget)
      toast.success("Table deleted")
      setDeleteTarget(null)
      fetchTables()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete table")
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Tables" 
        subtitle="Manage tables and QR codes"
        action={{
          label: "Add Table",
          onClick: () => handleOpenDialog()
        }}
      />

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand" size={32} /></div>
      ) : tables.length === 0 ? (
        <EmptyState 
          icon={<Table2 className="h-12 w-12 text-slate-300" />}
          title="No tables yet"
          description="Add your first table to generate a QR code."
          action={{
            label: "Add Table",
            onClick: () => handleOpenDialog()
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((table) => (
            <div key={table._id} className={`${theme.card} p-5 flex flex-col items-center text-center`}>
              <div className="w-full flex justify-between items-start mb-2">
                <span className="text-2xl font-bold text-slate-900 leading-none">{table.tableNumber}</span>
                <StatusBadge status={table.status} />
              </div>
              
              <div className="flex items-center text-slate-500 text-sm mb-4">
                <Users size={16} className="mr-1.5" />
                <span>Seats {table.capacity}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 w-full flex justify-center">
                <img 
                  src={`${API_BASE_URL}/tables/${table._id}/qr`} 
                  className="w-32 h-32" 
                  alt={`QR for Table ${table.tableNumber}`} 
                />
              </div>

              <div className="flex gap-2 w-full mt-auto pt-2 border-t border-slate-100">
                <Button variant="outline" className="flex-1 text-slate-600" asChild>
                  <a href={`${API_BASE_URL}/tables/${table._id}/qr`} download={`table-${table.tableNumber}-qr.png`} target="_blank" rel="noreferrer">
                    <Download className="h-4 w-4 mr-2" /> QR Code
                  </a>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="shrink-0 text-slate-600"
                  onClick={() => handleOpenDialog(table)}
                  disabled={table.status !== "available"}
                  title={table.status !== "available" ? "Cannot edit occupied table" : ""}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  onClick={() => setDeleteTarget(table._id)}
                  disabled={table.status !== "available"}
                  title={table.status !== "available" ? "Cannot delete occupied table" : ""}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Table" : "Add Table"}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <FormProvider {...methods}>
              <form id="table-form" onSubmit={methods.handleSubmit(onSubmit)} className={theme.formGap}>
                <FormField
                  name="tableNumber"
                  label="Table Number / Identifier"
                  control={methods.control}
                  placeholder="e.g. 10, A1, VIP"
                />
                <FormField
                  name="capacity"
                  label="Seating Capacity"
                  control={methods.control}
                  type="number"
                />
              </form>
            </FormProvider>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="table-form" className={theme.btn.brand} disabled={methods.formState.isSubmitting}>
              {methods.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editTarget ? "Save Changes" : "Create Table"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Table"
        description="Are you sure you want to delete this table? The QR code will no longer work."
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  )
}
