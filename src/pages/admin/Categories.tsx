import { useEffect, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Tag, MoreVertical, Edit, Trash, Loader2 } from "lucide-react"

import { CategoryService } from "@/services/category.service"
import type { Category } from "@/types"
import { theme } from "@/lib/theme"

import { PageHeader, EmptyState, ConfirmDialog } from "@/components/shared"
import { DataTable } from "@/components/shared/DataTable"
import type { Column } from "@/components/shared/DataTable"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FormField } from "@/components/forms"

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  displayOrder: z.coerce.number().int().min(0, "Must be 0 or greater"),
})

type CategoryFormValues = z.infer<typeof categorySchema>

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const methods = useForm<any>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      displayOrder: 0,
    },
  })

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const data = await CategoryService.getCategories()
      setCategories(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch categories")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleOpenSheet = (category?: Category) => {
    if (category) {
      setEditTarget(category)
      methods.reset({ name: category.name, displayOrder: category.displayOrder })
    } else {
      setEditTarget(null)
      methods.reset({ name: "", displayOrder: 0 })
    }
    setSheetOpen(true)
  }

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      if (editTarget) {
        await CategoryService.updateCategory(editTarget._id, data)
        toast.success("Category updated successfully")
      } else {
        await CategoryService.createCategory(data)
        toast.success("Category created successfully")
      }
      setSheetOpen(false)
      fetchCategories()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save category")
    }
  }

  const handleToggle = async (id: string) => {
    try {
      await CategoryService.toggleCategory(id)
      toast.success("Status updated")
      fetchCategories()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to toggle status")
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await CategoryService.deleteCategory(deleteTarget)
      toast.success("Category deleted")
      setDeleteTarget(null)
      fetchCategories()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete category")
    }
  }

  const columns: Column<Category>[] = [
    { header: "Name", accessor: "name", className: "font-medium" },
    { header: "Display Order", accessor: "displayOrder" },
    { 
      header: "Status", 
      accessor: (row) => (
        <Switch 
          checked={row.isActive} 
          onCheckedChange={() => handleToggle(row._id)}
        />
      )
    },
    { 
      header: "Actions", 
      accessor: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleOpenSheet(row)}>
              <Edit className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setDeleteTarget(row._id)}
              className="text-red-600 focus:bg-red-50 focus:text-red-700"
            >
              <Trash className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Categories" 
        subtitle="Manage menu categories"
        action={{
          label: "Add Category",
          onClick: () => handleOpenSheet()
        }}
      />

      <DataTable 
        columns={columns}
        data={categories}
        isLoading={loading}
        emptyState={
          <EmptyState 
            icon={<Tag className="h-12 w-12 text-slate-300" />}
            title="No categories yet"
            description="Create your first category to start organizing your menu."
            action={{
              label: "Add Category",
              onClick: () => handleOpenSheet()
            }}
          />
        }
      />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="bg-white">
          <SheetHeader>
            <SheetTitle>{editTarget ? "Edit Category" : "Add Category"}</SheetTitle>
          </SheetHeader>
          <div className="py-6">
            <FormProvider {...methods}>
              <form id="category-form" onSubmit={methods.handleSubmit(onSubmit)} className={theme.formGap}>
                <FormField
                  name="name"
                  label="Category Name"
                  control={methods.control}
                  placeholder="e.g. Starters, Main Course"
                />
                <FormField
                  name="displayOrder"
                  label="Display Order"
                  control={methods.control}
                  type="number"
                />
              </form>
            </FormProvider>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="category-form" className={theme.btn.brand} disabled={methods.formState.isSubmitting}>
              {methods.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editTarget ? "Save Changes" : "Create Category"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        description="This will permanently delete this category. Items in this category will be affected."
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  )
}
