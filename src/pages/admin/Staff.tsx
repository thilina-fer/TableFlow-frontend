import { useEffect, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Users, MoreVertical, Edit, Trash, KeyRound, Loader2 } from "lucide-react"

import { StaffService } from "@/services/staff.service"
import type { User } from "@/types"
import { theme } from "@/lib/theme"

import { PageHeader, EmptyState, ConfirmDialog, StatusBadge } from "@/components/shared"
import { DataTable } from "@/components/shared/DataTable"
import type { Column } from "@/components/shared/DataTable"
import { RoleBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FormField, FormSelect } from "@/components/forms"

const createStaffSchema = z.object({
  name: z.string().min(2, "Min 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["kitchen", "waiter", "cashier"]),
})

const editStaffSchema = z.object({
  name: z.string().min(2, "Min 2 characters"),
  isActive: z.boolean(),
})

type CreateStaffFormValues = z.infer<typeof createStaffSchema>
type EditStaffFormValues = z.infer<typeof editStaffSchema>

export default function Staff() {
  const [staff, setStaff] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create")
  const [editTarget, setEditTarget] = useState<User | null>(null)
  
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [resetTarget, setResetTarget] = useState<string | null>(null)

  const createMethods = useForm<any>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: { name: "", email: "", role: "waiter" },
  })

  const editMethods = useForm<any>({
    resolver: zodResolver(editStaffSchema),
    defaultValues: { name: "", isActive: true },
  })

  const fetchStaff = async () => {
    setLoading(true)
    try {
      const data = await StaffService.getStaff()
      setStaff(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch staff")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  const handleOpenSheet = (user?: User) => {
    if (user) {
      setSheetMode("edit")
      setEditTarget(user)
      editMethods.reset({ name: user.name, isActive: user.isActive })
    } else {
      setSheetMode("create")
      setEditTarget(null)
      createMethods.reset({ name: "", email: "", role: "waiter" })
    }
    setSheetOpen(true)
  }

  const onCreateSubmit = async (data: CreateStaffFormValues) => {
    try {
      await StaffService.createStaff(data)
      toast.success("Staff member created", { description: "An email has been sent with their temporary password." })
      setSheetOpen(false)
      fetchStaff()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create staff member")
    }
  }

  const onEditSubmit = async (data: EditStaffFormValues) => {
    if (!editTarget) return
    try {
      await StaffService.updateStaff(editTarget._id, data)
      toast.success("Staff member updated")
      setSheetOpen(false)
      fetchStaff()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update staff member")
    }
  }

  const handleDeactivate = async () => {
    if (!deleteTarget) return
    try {
      await StaffService.deactivateStaff(deleteTarget)
      toast.success("Staff member deactivated")
      setDeleteTarget(null)
      fetchStaff()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to deactivate staff member")
    }
  }

  const handleResetPassword = async () => {
    if (!resetTarget) return
    try {
      await StaffService.resetStaffPassword(resetTarget)
      toast.success("Password reset email sent")
      setResetTarget(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reset password")
    }
  }

  const columns: Column<User>[] = [
    { header: "Name", accessor: "name", className: "font-medium" },
    { header: "Email", accessor: "email" },
    { 
      header: "Role", 
      accessor: (row) => <RoleBadge role={row.role} /> 
    },
    { 
      header: "Status", 
      accessor: (row) => <StatusBadge status={row.isActive ? "active" : "inactive"} /> 
    },
    { 
      header: "Joined", 
      accessor: (row) => new Date(row.createdAt).toLocaleDateString() 
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
            <DropdownMenuItem onClick={() => setResetTarget(row._id)}>
              <KeyRound className="h-4 w-4 mr-2" /> Reset Password
            </DropdownMenuItem>
            {row.isActive && row.role !== "admin" && (
              <DropdownMenuItem 
                onClick={() => setDeleteTarget(row._id)}
                className="text-red-600 focus:bg-red-50 focus:text-red-700"
              >
                <Trash className="h-4 w-4 mr-2" /> Deactivate
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Staff" 
        subtitle="Manage your team"
        action={{
          label: "Add Staff Member",
          onClick: () => handleOpenSheet()
        }}
      />

      <DataTable 
        columns={columns}
        data={staff}
        isLoading={loading}
        emptyState={
          <EmptyState 
            icon={<Users className="h-12 w-12 text-slate-300" />}
            title="No staff members yet"
            description="Add your first staff member to get started."
            action={{
              label: "Add Staff Member",
              onClick: () => handleOpenSheet()
            }}
          />
        }
      />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="bg-white">
          <SheetHeader>
            <SheetTitle>{sheetMode === "edit" ? "Edit Staff Member" : "Add Staff Member"}</SheetTitle>
          </SheetHeader>
          <div className="py-6">
            {sheetMode === "create" ? (
              <FormProvider {...createMethods}>
                <form id="create-staff-form" onSubmit={createMethods.handleSubmit(onCreateSubmit)} className={theme.formGap}>
                  <FormField
                    name="name"
                    label="Full Name"
                    control={createMethods.control}
                    placeholder="e.g. John Doe"
                  />
                  <FormField
                    name="email"
                    label="Email Address"
                    control={createMethods.control}
                    placeholder="john@example.com"
                  />
                  <FormSelect
                    name="role"
                    label="Role"
                    control={createMethods.control}
                    options={[
                      { value: "kitchen", label: "Kitchen" },
                      { value: "waiter", label: "Waiter" },
                      { value: "cashier", label: "Cashier" },
                    ]}
                    placeholder="Select a role"
                  />
                  <p className="text-xs text-slate-500 mt-2">A temporary password will be emailed to the staff member.</p>
                </form>
              </FormProvider>
            ) : (
              <FormProvider {...editMethods}>
                <form id="edit-staff-form" onSubmit={editMethods.handleSubmit(onEditSubmit)} className={theme.formGap}>
                  <FormField
                    name="name"
                    label="Full Name"
                    control={editMethods.control}
                  />
                  <div className="flex items-center justify-between pt-4 pb-2 border-t mt-4">
                    <div className="space-y-0.5">
                      <span className="text-sm font-medium">Active Account</span>
                      <p className="text-xs text-slate-500">Allow this staff member to log in</p>
                    </div>
                    <Switch 
                      checked={editMethods.watch("isActive")}
                      onCheckedChange={(val) => editMethods.setValue("isActive", val)}
                    />
                  </div>
                </form>
              </FormProvider>
            )}
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              form={sheetMode === "create" ? "create-staff-form" : "edit-staff-form"} 
              className={theme.btn.brand} 
              disabled={sheetMode === "create" ? createMethods.formState.isSubmitting : editMethods.formState.isSubmitting}
            >
              {(sheetMode === "create" ? createMethods.formState.isSubmitting : editMethods.formState.isSubmitting) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {sheetMode === "create" ? "Create Staff" : "Save Changes"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDeactivate}
        title="Deactivate Staff Member"
        description="This staff member will no longer be able to log in."
        confirmLabel="Deactivate"
        variant="destructive"
      />

      <ConfirmDialog
        open={!!resetTarget}
        onOpenChange={(open) => !open && setResetTarget(null)}
        onConfirm={handleResetPassword}
        title="Reset Password"
        description="A new temporary password will be emailed to this staff member. They will be required to change it on next login."
        confirmLabel="Send Email"
        variant="default"
      />
    </div>
  )
}
