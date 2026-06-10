import { useEffect, useState, useRef } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { UtensilsCrossed, MoreVertical, Edit, Trash, Loader2, Upload, X } from "lucide-react"

import { MenuItemService } from "@/services/menuItem.service"
import { CategoryService } from "@/services/category.service"
import { RestaurantService } from "@/services/restaurant.service"
import type { MenuItem, Category } from "@/types"
import { theme } from "@/lib/theme"

import { PageHeader, EmptyState, ConfirmDialog } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FormField, FormTextarea, FormSelect } from "@/components/forms"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const menuItemSchema = z.object({
  name: z.string().min(2, "Min 2 characters").max(100),
  description: z.string().max(500).optional(),
  price: z.coerce.number().positive("Must be positive"),
  categoryId: z.string().min(1, "Select a category"),
  imageUrl: z.any().optional(),
  preparationTimeMinutes: z.coerce.number().int().min(1).max(300).optional().or(z.literal("")),
  isAvailable: z.boolean().default(true),
  tags: z.string().optional(),
})

type MenuItemFormValues = z.infer<typeof menuItemSchema>

export default function MenuItems() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState("all")

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<MenuItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const methods = useForm<any>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      imageUrl: "",
      preparationTimeMinutes: "",
      isAvailable: true,
      tags: "",
    },
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [menuData, catData] = await Promise.all([
        MenuItemService.getAdminMenu(),
        CategoryService.getCategories()
      ])
      setItems(menuData)
      setCategories(catData)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenSheet = (item?: MenuItem) => {
    setImageFile(null)
    setImagePreview(item?.imageUrl || null)
    if (imageInputRef.current) imageInputRef.current.value = ""

    if (item) {
      setEditTarget(item)
      methods.reset({
        name: item.name,
        description: item.description || "",
        price: item.price,
        categoryId: typeof item.categoryId === 'string' ? item.categoryId : item.categoryId._id,
        imageUrl: item.imageUrl || "",
        preparationTimeMinutes: item.preparationTimeMinutes || "",
        isAvailable: item.isAvailable,
        tags: item.tags?.join(", ") || "",
      })
    } else {
      setEditTarget(null)
      methods.reset({
        name: "",
        description: "",
        price: 0,
        categoryId: activeTab !== "all" ? activeTab : (categories.length > 0 ? categories[0]._id : ""),
        imageUrl: "",
        preparationTimeMinutes: "",
        isAvailable: true,
        tags: "",
      })
    }
    setSheetOpen(true)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (imageInputRef.current) imageInputRef.current.value = ""
  }

  const onSubmit = async (data: MenuItemFormValues) => {
    try {
      let finalImageUrl = editTarget?.imageUrl || ""

      if (imageFile) {
        finalImageUrl = await RestaurantService.uploadImage(imageFile)
      } else if (!imagePreview) {
        finalImageUrl = ""
      }

      const formattedData = {
        ...data,
        preparationTimeMinutes: data.preparationTimeMinutes === "" ? undefined : Number(data.preparationTimeMinutes),
        tags: data.tags ? (data.tags as unknown as string).split(",").map(t => t.trim()).filter(Boolean) : [],
        imageUrl: finalImageUrl === "" ? undefined : finalImageUrl,
        description: data.description === "" ? undefined : data.description
      }

      if (editTarget) {
        await MenuItemService.updateMenuItem(editTarget._id, formattedData as any)
        toast.success("Menu item updated successfully")
      } else {
        await MenuItemService.createMenuItem(formattedData as any)
        toast.success("Menu item created successfully")
      }
      setSheetOpen(false)
      fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save menu item")
    }
  }

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await MenuItemService.toggleAvailability(id, !current)
      fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to toggle availability")
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await MenuItemService.deleteMenuItem(deleteTarget)
      toast.success("Menu item deleted")
      setDeleteTarget(null)
      fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete menu item")
    }
  }

  const filteredItems = items.filter(item => {
    if (activeTab === "all") return true
    const catId = typeof item.categoryId === 'string' ? item.categoryId : item.categoryId._id
    return catId === activeTab
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Menu"
        subtitle="Manage your menu items"
        action={{
          label: "Add Item",
          onClick: () => handleOpenSheet()
        }}
      />

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand" size={32} /></div>
      ) : (
        <>
          {categories.length > 0 && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="overflow-x-auto pb-2">
                <TabsList className="w-auto inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500">
                  <TabsTrigger value="all" className="px-4 py-1.5 rounded-sm data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm">All Items</TabsTrigger>
                  {categories.map(cat => (
                    <TabsTrigger key={cat._id} value={cat._id} className="px-4 py-1.5 rounded-sm data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm">
                      {cat.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </Tabs>
          )}

          {filteredItems.length === 0 ? (
            <EmptyState
              icon={<UtensilsCrossed className="h-12 w-12 text-slate-300" />}
              title="No items found"
              description={activeTab === "all" ? "Your menu is empty." : "No items in this category."}
              action={{
                label: "Add Item",
                onClick: () => handleOpenSheet()
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredItems.map((item) => {
                const catName = typeof item.categoryId === 'string'
                  ? categories.find(c => c._id === item.categoryId)?.name
                  : item.categoryId.name

                return (
                  <div key={item._id} className={`${theme.card} p-4 flex flex-col`}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover rounded-lg mb-3" />
                    ) : (
                      <div className="w-full h-40 bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
                        <UtensilsCrossed className="text-slate-300" size={32} />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-slate-900 leading-tight">{item.name}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2">
                              <MoreVertical className="h-4 w-4 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenSheet(item)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget(item._id)}
                              className="text-red-600 focus:bg-red-50 focus:text-red-700"
                            >
                              <Trash className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <p className="text-xs text-slate-400 mb-2">{catName}</p>
                      {item.description && (
                        <p className="text-sm text-slate-500 line-clamp-2 mb-3">{item.description}</p>
                      )}

                      <div className="font-bold text-slate-900 mb-3">
                        LKR {item.price.toFixed(2)}
                      </div>

                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {item.tags.map((tag, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 mt-auto border-t border-slate-100 flex items-center justify-between">
                      <span className="text-sm text-slate-600 font-medium">Available</span>
                      <Switch
                        checked={item.isAvailable}
                        onCheckedChange={() => handleToggle(item._id, item.isAvailable)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="bg-white sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editTarget ? "Edit Item" : "Add Menu Item"}</SheetTitle>
          </SheetHeader>
          <div className="py-6">
            <FormProvider {...methods}>
              <form id="menu-form" onSubmit={methods.handleSubmit(onSubmit)} className={theme.formGap}>
                <FormField
                  name="name"
                  label="Item Name"
                  control={methods.control}
                  placeholder="e.g. Margherita Pizza"
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    name="price"
                    label="Price (LKR)"
                    control={methods.control}
                    type="number"
                  />
                  <FormSelect
                    name="categoryId"
                    label="Category"
                    control={methods.control}
                    options={categories.map(c => ({ value: c._id, label: c.name }))}
                    placeholder="Select category"
                  />
                </div>
                <FormTextarea
                  name="description"
                  label="Description"
                  control={methods.control}
                  placeholder="Brief description of the item"
                />
                <div className="space-y-2">
                  <Label>Item Image</Label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={imageInputRef}
                    onChange={handleImageSelect}
                  />
                  
                  {!imagePreview ? (
                    <div 
                      onClick={() => imageInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-orange-400 hover:text-orange-500 transition-colors cursor-pointer"
                    >
                      <Upload className="h-8 w-8 mb-2" />
                      <span className="text-sm font-medium">Click to upload image</span>
                      <span className="text-xs mt-1 opacity-70">PNG, JPG up to 5MB</span>
                    </div>
                  ) : (
                    <div className="relative border rounded-lg overflow-hidden bg-white shadow-sm group">
                      <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          type="button" 
                          onClick={removeImage}
                          className="bg-white/20 hover:bg-red-500 text-white rounded-full p-2 backdrop-blur-sm transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <FormField
                  name="preparationTimeMinutes"
                  label="Prep Time (minutes)"
                  control={methods.control}
                  type="number"
                />

                <div className="space-y-2">
                  <Label>Tags (comma separated)</Label>
                  <Input
                    {...methods.register("tags")}
                    placeholder="e.g. Spicy, Vegan, Gluten-Free"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 pb-2">
                  <div className="space-y-0.5">
                    <Label>Availability</Label>
                    <p className="text-sm text-slate-500">Is this item currently available to order?</p>
                  </div>
                  <Switch
                    checked={methods.watch("isAvailable")}
                    onCheckedChange={(val) => methods.setValue("isAvailable", val)}
                  />
                </div>
              </form>
            </FormProvider>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="menu-form" className={theme.btn.brand} disabled={methods.formState.isSubmitting}>
              {methods.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editTarget ? "Save Changes" : "Create Item"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Menu Item"
        description="Are you sure you want to delete this menu item? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  )
}
