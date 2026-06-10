import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { SuperAdminService } from "@/services/superadmin.service"
import type { Restaurant } from "@/types"
import { PageHeader, StatusBadge, EmptyState } from "@/components/shared"
import { DataTable } from "@/components/shared/DataTable"
import type { Column } from "@/components/shared/DataTable"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Store } from "lucide-react"

export default function Registrations() {
  const [registrations, setRegistrations] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("All")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchRegistrations = async () => {
      setLoading(true)
      try {
        const response = await SuperAdminService.getRegistrations({
          status: statusFilter === "All" ? undefined : statusFilter.toLowerCase(),
          page,
          limit: 10
        })
        setRegistrations(response.data)
        setTotalPages(response.pagination.pages)
        setTotalItems(response.pagination.total)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchRegistrations()
  }, [statusFilter, page])

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setPage(1)
  }

  const columns: Column<Restaurant>[] = [
    { header: "Restaurant Name", accessor: "name" },
    { header: "Owner Email", accessor: "ownerEmail" },
    { header: "City", accessor: "city" },
    { header: "Type", accessor: "restaurantType" },
    { 
      header: "Status", 
      accessor: (row) => <StatusBadge status={row.status} /> 
    },
    { 
      header: "Applied", 
      accessor: (row) => new Date(row.createdAt).toLocaleDateString() 
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Registrations" 
        subtitle="Manage restaurant applications"
      />

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-700">Filter by status:</span>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-40 bg-white">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
            <SelectItem value="Suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable 
        columns={columns}
        data={registrations}
        isLoading={loading}
        onRowClick={(row) => navigate(`/superadmin/registrations/${row._id}`)}
        pagination={{
          page,
          pages: totalPages,
          total: totalItems,
          onPageChange: setPage
        }}
        emptyState={
          <EmptyState 
            icon={<Store className="h-12 w-12 text-slate-300" />}
            title="No registrations found"
            description={statusFilter !== "All" ? `No restaurants with status ${statusFilter.toLowerCase()}` : "There are currently no restaurant applications."}
          />
        }
      />
    </div>
  )
}
