import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { toast } from 'sonner'
import {
  PageHeader,
  LoadingSpinner,
  ErrorAlert,
  EmptyState,
  ConfirmDialog,
  StatusBadge,
  DataTable,
} from '@/components/shared'
import type { Column } from '@/components/shared/DataTable'
import { FormField, FormTextarea } from '@/components/forms'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HelpCircle, Plus } from 'lucide-react'

// Mock data for DataTable preview
interface TableRowData {
  id: string
  name: string
  role: string
  status: string
  amount: number
}

const mockTableData: TableRowData[] = [
  { id: '1', name: 'John Doe', role: 'Super Admin', status: 'approved', amount: 120.50 },
  { id: '2', name: 'Jane Smith', role: 'Waiter', status: 'preparing', amount: 45.00 },
  { id: '3', name: 'Bob Johnson', role: 'Customer', status: 'awaiting_payment', amount: 89.90 },
  { id: '4', name: 'Alice Williams', role: 'Cashier', status: 'completed', amount: 210.00 },
  { id: '5', name: 'Charlie Brown', role: 'Kitchen Staff', status: 'failed', amount: 0.00 },
]

export default function Showcase() {
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogVariant, setDialogVariant] = useState<'default' | 'destructive'>('default')
  const [dialogLoading, setDialogLoading] = useState(false)

  // Table columns definition
  const columns: Column<TableRowData>[] = [
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Role',
      accessor: 'role',
      className: 'font-mono text-xs text-slate-600',
    },
    {
      header: 'Status',
      accessor: (row: TableRowData) => <StatusBadge status={row.status as any} />,
    },
    {
      header: 'Amount',
      accessor: (row: TableRowData) => <span className="font-semibold">${row.amount.toFixed(2)}</span>,
      className: 'text-right',
    },
  ]

  // Form setup
  const methods = useForm({
    defaultValues: {
      fullName: '',
      notes: '',
    },
  })

  const onSubmit = (data: any) => {
    if (!data.fullName) {
      methods.setError('fullName', { type: 'manual', message: 'Full Name is required' })
      toast.error('Validation failed!')
      return
    }
    toast.success(`Form submitted successfully! Name: ${data.fullName}`)
    console.log('Form Data:', data)
  }

  // Dialog actions
  const triggerDialog = (variant: 'default' | 'destructive') => {
    setDialogVariant(variant)
    setDialogOpen(true)
  }

  const handleConfirm = () => {
    setDialogLoading(true)
    setTimeout(() => {
      setDialogLoading(false)
      setDialogOpen(false)
      toast.success(dialogVariant === 'destructive' ? 'Action deleted successfully!' : 'Action confirmed successfully!')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Page Header preview */}
        <PageHeader
          title="TableFlow Component Showcase"
          subtitle="Explore, interact, and preview all shared and custom form components we have built."
          action={{
            label: "Add Component",
            onClick: () => toast.info('Action Slot Clicked'),
            icon: <Plus className="mr-2 h-4 w-4" />
          }}
        />

        <Separator className="bg-slate-200" />

        <Tabs defaultValue="shared" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6">
            <TabsTrigger value="shared">Shared Components</TabsTrigger>
            <TabsTrigger value="forms">Form & Dialogs</TabsTrigger>
          </TabsList>

          {/* SHARED COMPONENTS SHOWCASE */}
          <TabsContent value="shared" className="space-y-8">
            
            {/* StatusBadge Preview Card */}
            <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">StatusBadges</CardTitle>
                <CardDescription>Visual state indicators mapped to domain statuses.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2.5">
                <StatusBadge status="pending" />
                <StatusBadge status="approved" />
                <StatusBadge status="rejected" />
                <StatusBadge status="suspended" />
                <StatusBadge status="placed" />
                <StatusBadge status="preparing" />
                <StatusBadge status="completed" />
                <StatusBadge status="delivered" />
                <StatusBadge status="paid" />
                <StatusBadge status="failed" />
                <StatusBadge status="available" />
                <StatusBadge status="occupied" />
                <StatusBadge status="awaiting_payment" />
              </CardContent>
            </Card>

            {/* DataTable Preview Card */}
            <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">Generic DataTable</CardTitle>
                <CardDescription>Fully typed columns accepting keys or custom render cell functions.</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={columns}
                  data={mockTableData}
                  onRowClick={(row: TableRowData) => toast.info(`Clicked row: ${row.name}`)}
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Spinner & Errors */}
              <Card className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">Spinners & Alerts</CardTitle>
                  <CardDescription>Indicators for loading status and error display.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-2 font-medium">Small (sm)</p>
                      <LoadingSpinner size="sm" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-2 font-medium">Medium (md)</p>
                      <LoadingSpinner size="md" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-2 font-medium">Large (lg)</p>
                      <LoadingSpinner size="lg" />
                    </div>
                  </div>
                  <Separator />
                  <ErrorAlert
                    message="Unable to fetch restaurant list. Please check your network connection and try again."
                  />
                </CardContent>
              </Card>

              {/* EmptyState Preview Card */}
              <EmptyState
                icon={<HelpCircle className="h-6 w-6 text-slate-500" />}
                title="No Orders Placed Yet"
                description="Your restaurant hasn't received any active table orders today."
                action={{ label: 'Create Mock Order', onClick: () => toast.success('Mock order successfully generated!') }}
              />
            </div>
          </TabsContent>

          {/* FORM & DIALOG SHOWCASE */}
          <TabsContent value="forms" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Form wrappers preview */}
              <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">React Hook Form Wrappers</CardTitle>
                  <CardDescription>Input fields linked to validation schema showing inline errors.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        name="fullName"
                        label="Full Name"
                        control={methods.control}
                        placeholder="e.g. John Doe"
                      />
                      <FormTextarea
                        name="notes"
                        label="Special Notes"
                        control={methods.control}
                        placeholder="Any additional kitchen requests..."
                      />
                      <div className="flex gap-2 justify-end pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            methods.reset()
                            toast.info('Form reset')
                          }}
                        >
                          Clear
                        </Button>
                        <Button
                          type="submit"
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          Submit Form
                        </Button>
                      </div>
                    </form>
                  </FormProvider>
                </CardContent>
              </Card>

              {/* Confirmation Dialogs Preview */}
              <Card className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900">ConfirmDialog Wrappers</CardTitle>
                  <CardDescription>Wraps AlertDialog with orange/red button variations.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 py-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => triggerDialog('default')}
                    >
                      Default Confirm
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 bg-red-500 hover:bg-red-600"
                      onClick={() => triggerDialog('destructive')}
                    >
                      Destructive Confirm
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ConfirmDialog Component */}
      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogVariant === 'destructive' ? 'Delete Order?' : 'Approve Order?'}
        description={
          dialogVariant === 'destructive'
            ? 'Are you sure you want to delete this order? This action is permanent and cannot be undone.'
            : 'Would you like to approve this order and notify the kitchen to start preparing?'
        }
        onConfirm={handleConfirm}
        confirmLabel={dialogVariant === 'destructive' ? 'Delete' : 'Approve'}
        variant={dialogVariant}
        isLoading={dialogLoading}
      />
    </div>
  )
}
