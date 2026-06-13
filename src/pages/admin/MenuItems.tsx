import { useEffect, useState } from "react"
import { useForm, FormProvider, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { UtensilsCrossed, MoreVertical, Pencil, Trash2, Plus, X, Loader2, Image as ImageIcon } from "lucide-react"

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
  price: z.coerce.number().min(0, "Must be valid price"),
  categoryId: z.string().min(1, "Select a category"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  preparationTimeMinutes: z.coerce.number().int().min(1).max(300).optional().or(z.literal("")),
  isAvailable: z.boolean().default(true),
  tags: z.string().optional(),
  variants: z.array(z.object({
    name: z.string().min(1, "Name required"),
    price: z.coerce.number().positive("Must be positive")
  })).optional(),
})

type MenuItemFormValues = z.infer<typeof menuItemSchema>

const MenuItemCard = ({ 
  item, 
  categories, 
  handleOpenSheet, 
  setDeleteTarget, 
  handleToggle 
}: { 
  item: MenuItem, 
  categories: Category[],
  handleOpenSheet: (item: MenuItem) => void,
  setDeleteTarget: (id: string) => void,
  handleToggle: (id: string, current: boolean) => void
}) => {
  const catName = typeof item.categoryId === 'string'
    ? categories.find(c => c._id === item.categoryId)?.name
    : item.categoryId.name

  const hasVariants = item.variants && item.variants.length > 0
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0)

  const currentPrice = hasVariants ? item.variants![selectedVariantIdx].price : item.price

  return (
    <div className={`${theme.card} p-4 flex flex-col h-[440px]`}>
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover rounded-lg mb-3 shrink-0" />
      ) : (
        <div className="w-full h-40 bg-slate-100 rounded-lg mb-3 flex items-center justify-center shrink-0">
          <UtensilsCrossed className="text-slate-300" size={32} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-start mb-1 shrink-0">
          <h3 className="font-semibold text-slate-900 leading-tight truncate pr-2">{item.name}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 shrink-0">
                <MoreVertical className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleOpenSheet(item)}>
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteTarget(item._id)}
                className="text-red-600 focus:bg-red-50 focus:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-xs text-slate-400 mb-2 shrink-0">{catName}</p>
        
        {item.description && (
          <p className="text-sm text-slate-500 line-clamp-2 mb-2 shrink-0">{item.description}</p>
        )}

        {/* Spacer to push content to bottom */}
        <div className="flex-1" />

        <div className="shrink-0 mb-3">
          <div className="font-bold text-slate-900 text-lg">
            LKR {currentPrice.toFixed(2)}
          </div>
          {hasVariants && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.variants!.map((v, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedVariantIdx(idx)}
                  className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-colors border ${
                    selectedVariantIdx === idx 
                    ? 'bg-orange-50 text-orange-700 border-orange-200 shadow-sm' 
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3 shrink-0">
            {item.tags.map((tag, idx) => (
              <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-3 mt-auto border-t border-slate-100 flex items-center justify-between shrink-0">
        <span className="text-sm text-slate-600 font-medium">Available</span>
        <Switch
          checked={item.isAvailable}
          onCheckedChange={() => handleToggle(item._id, item.isAvailable)}
        />
      </div>
    </div>
  )
}

export default function MenuItems() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState("all")

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<MenuItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

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
      variants: [],
    },
  })

  const { formState: { errors } } = methods
  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: methods.control,
    name: "variants",
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
        variants: item.variants || [],
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
        variants: [],
      })
    }
    setSheetOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const url = await RestaurantService.uploadImage(file)
      methods.setValue("imageUrl", url, { shouldValidate: true })
      toast.success("Image uploaded successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data: MenuItemFormValues) => {
    try {
      const formattedData = {
        ...data,
        price: data.variants && data.variants.length > 0 ? 0 : data.price,
        preparationTimeMinutes: data.preparationTimeMinutes === "" ? undefined : Number(data.preparationTimeMinutes),
        tags: data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        imageUrl: data.imageUrl === "" ? undefined : data.imageUrl,
        description: data.description === "" ? undefined : data.description,
        variants: data.variants && data.variants.length > 0 ? data.variants : undefined
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
              {filteredItems.map((item) => (
                <MenuItemCard 
                  key={item._id} 
                  item={item} 
                  categories={categories}
                  handleOpenSheet={handleOpenSheet}
                  setDeleteTarget={setDeleteTarget}
                  handleToggle={handleToggle}
                />
              ))}
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
                  {variantFields.length === 0 && (
                    <FormField
                      name="price"
                      label="Base Price (LKR)"
                      control={methods.control}
                      type="number"
                    />
                  )}
                  <div className={variantFields.length > 0 ? "col-span-2" : ""}>
                    <FormSelect
                      name="categoryId"
                      label="Category"
                      control={methods.control}
                      options={categories.map(c => ({ value: c._id, label: c.name }))}
                      placeholder="Select category"
                    />
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-4 space-y-4 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold">Portions & Sizes (Optional)</Label>
                      <p className="text-xs text-slate-500">Add variations like Small, Medium, Large</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendVariant({ name: "", price: 0 })}
                    >
                      <Plus className="h-4 w-4 mr-1.5" /> Add Size
                    </Button>
                  </div>
                  
                  {variantFields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-3 bg-white p-3 rounded-md border border-slate-200 shadow-sm">
                      <div className="flex-1">
                        <Input
                          {...methods.register(`variants.${index}.name`)}
                          placeholder="Size Name (e.g. Large)"
                          className="mb-1"
                        />
                        {(errors.variants as any)?.[index]?.name && (
                          <p className="text-sm text-red-500 mt-1">{(errors.variants as any)[index].name.message}</p>
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          {...methods.register(`variants.${index}.price`)}
                          type="number"
                          placeholder="Price"
                          className="mb-1"
                        />
                        {(errors.variants as any)?.[index]?.price && (
                          <p className="text-sm text-red-500 mt-1">{(errors.variants as any)[index].price.message}</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVariant(index)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <FormTextarea
                  name="description"
                  label="Description"
                  control={methods.control}
                  placeholder="Brief description of the item"
                />
                <div className="space-y-2">
                  <Label>Item Image</Label>
                  {methods.watch("imageUrl") ? (
                    <div className="relative w-full h-40 rounded-lg border border-slate-200 overflow-hidden">
                      <img src={methods.watch("imageUrl")} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => methods.setValue("imageUrl", "")}
                        className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-md hover:bg-black/70 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative w-full h-32 rounded-lg border-2 border-dashed border-slate-200 hover:border-orange-500 hover:bg-orange-50/50 transition-colors flex flex-col items-center justify-center cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                      {isUploading ? (
                        <>
                          <Loader2 className="h-8 w-8 text-orange-500 animate-spin mb-2" />
                          <span className="text-sm text-slate-500 font-medium">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center mb-2 text-orange-600">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">Click to upload image</span>
                          <span className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP up to 5MB</span>
                        </>
                      )}
                    </div>
                  )}
                  {methods.formState.errors.imageUrl && (
                    <p className="text-[0.8rem] font-medium text-red-500">{methods.formState.errors.imageUrl.message as string}</p>
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
