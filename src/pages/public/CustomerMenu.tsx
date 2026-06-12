import { useEffect, useState, useMemo } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Loader2, Plus, Minus, X, ShoppingCart } from "lucide-react"

import { getPublicMenu, getTableContext } from "@/api/menu.api"
import { placeOrder } from "@/api/order.api"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import {
  setTableContext,
  setPaymentMethod,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  selectCartItems,
  selectCartTotal,
  selectCartCount,
  selectTableContext,
  selectPaymentMethod
} from "@/features/cart/cartSlice"
import type { MenuItem, OrderItem } from "@/types"
import { theme } from "@/lib/theme"
import { formatPrice } from "@/lib/utils"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared"

export default function CustomerMenu() {
  const [searchParams] = useSearchParams()
  const tableId = searchParams.get("table")
  const restaurantId = searchParams.get("restaurant")
  
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { restaurantId: tableRestId } = useAppSelector(selectTableContext)
  const paymentMethod = useAppSelector(selectPaymentMethod)
  const cartItems = useAppSelector(selectCartItems)
  const cartTotal = useAppSelector(selectCartTotal)
  const cartCount = useAppSelector(selectCartCount)

  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [restaurantName, setRestaurantName] = useState("Menu")
  const [tableNumber, setTableNumber] = useState(tableId?.slice(-4) || "")
  
  const [activeTab, setActiveTab] = useState("all")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [specialNote, setSpecialNote] = useState("")
  const [noteExpanded, setNoteExpanded] = useState(false)
  const [isPlacing, setIsPlacing] = useState(false)

  // Initialize context and fetch menu
  useEffect(() => {
    if (!tableId || !restaurantId) {
      setError("Invalid QR code. Please scan again.")
      setLoading(false)
      return
    }

    dispatch(setTableContext({ restaurantId, tableId }))

    const fetchData = async () => {
      try {
        const [menuRes, tableRes] = await Promise.all([
          getPublicMenu(restaurantId),
          getTableContext(tableId)
        ])

        if (menuRes.data.success) {
          setMenuItems(menuRes.data.data)
        } else {
          setError(menuRes.data.message || "Failed to load menu")
        }

        if (tableRes.data.success) {
          setRestaurantName(tableRes.data.data.restaurantName || "Menu")
          setTableNumber(tableRes.data.data.tableNumber || tableId.slice(-4))
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Failed to load menu")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [tableId, restaurantId, dispatch])

  const categories = useMemo(() => {
    const cats = new Map<string, string>()
    menuItems.forEach(item => {
      if (typeof item.categoryId !== "string" && item.categoryId?.name) {
        cats.set(item.categoryId._id, item.categoryId.name)
      }
    })
    return Array.from(cats.entries()).map(([id, name]) => ({ id, name }))
  }, [menuItems])

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    menuItems.forEach(item => item.tags?.forEach(t => tags.add(t)))
    return Array.from(tags)
  }, [menuItems])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      // Filter by category tab
      const catId = typeof item.categoryId === "string" ? item.categoryId : item.categoryId._id
      if (activeTab !== "all" && catId !== activeTab) return false

      // Filter by tags
      if (selectedTags.length > 0) {
        if (!item.tags || !item.tags.some(t => selectedTags.includes(t))) return false
      }

      return true
    })
  }, [menuItems, activeTab, selectedTags])

  const handleAddToCart = (item: MenuItem, variantIndex: number = 0) => {
    const price = item.variants?.length ? item.variants[variantIndex].price : item.price
    const variantName = item.variants?.length ? item.variants[variantIndex].name : undefined
    
    dispatch(addToCart({
      menuItemId: item._id,
      name: item.name,
      variantName,
      price,
      quantity: 1,
      imageUrl: item.imageUrl
    }))
    toast.success(`Added ${item.name} to cart`)
  }

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0 || !paymentMethod || !tableId || !restaurantId) return

    setIsPlacing(true)
    try {
      const orderData = {
        tableId,
        restaurantId,
        items: cartItems.map(i => ({
          menuItemId: i.menuItemId,
          variantName: i.variantName,
          quantity: i.quantity
        })),
        paymentMethod,
        specialNote: specialNote.trim() || undefined
      }

      const res = await placeOrder(orderData as any)
      if (res.data.success) {
        dispatch(clearCart())
        navigate(`/order/${res.data.data.order._id}/track`)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to place order")
    } finally {
      setIsPlacing(false)
    }
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center p-4 text-center">
      <div className="bg-red-50 text-red-600 p-6 rounded-xl max-w-sm">
        <X className="h-10 w-10 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    </div>
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand h-10 w-10" /></div>
  }



  const CartPanel = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 pr-12 border-b border-slate-100 flex items-center gap-3 shrink-0">
        <h2 className="text-xl font-bold text-slate-900">Your Order</h2>
        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-sm font-semibold">{cartCount} items</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {cartItems.length === 0 ? (
          <EmptyState
            icon={<ShoppingCart className="h-10 w-10 text-slate-300" />}
            title="Your cart is empty"
            description="Add items from the menu"
          />
        ) : (
          cartItems.map((item, idx) => {
            const uniqueId = `${item.menuItemId}-${item.variantName || 'base'}`
            return (
              <div key={idx} className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 leading-tight">{item.name}</p>
                  {item.variantName && <p className="text-xs text-slate-500 mb-1">{item.variantName}</p>}
                  <p className="text-sm text-brand font-medium">{formatPrice(item.price * item.quantity)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => dispatch(removeFromCart(uniqueId))} className="text-slate-400 hover:text-red-500 p-1">
                    <X size={16} />
                  </button>
                  <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 border border-slate-100">
                    <button 
                      onClick={() => dispatch(updateQuantity({ id: uniqueId, quantity: Math.max(0, item.quantity - 1) }))}
                      className="w-7 h-7 flex items-center justify-center text-slate-600 bg-white rounded shadow-sm hover:text-brand"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-4 text-center text-sm font-semibold">{item.quantity}</span>
                    <button 
                      onClick={() => dispatch(updateQuantity({ id: uniqueId, quantity: item.quantity + 1 }))}
                      className="w-7 h-7 flex items-center justify-center text-slate-600 bg-white rounded shadow-sm hover:text-brand"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="p-4 border-t border-slate-100 space-y-4 shrink-0 bg-white">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Tax (10%)</span>
            <span>{formatPrice(cartTotal * 0.1)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-100">
            <span>Total</span>
            <span>{formatPrice(cartTotal * 1.1)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-900">Payment Method</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => dispatch(setPaymentMethod("cash"))}
              className={`py-2.5 rounded-lg text-sm font-semibold transition-colors border ${
                paymentMethod === "cash" 
                ? "bg-slate-900 text-white border-slate-900" 
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              💵 Cash
            </button>
            <button
              onClick={() => dispatch(setPaymentMethod("card"))}
              className={`py-2.5 rounded-lg text-sm font-semibold transition-colors border ${
                paymentMethod === "card" 
                ? "bg-slate-900 text-white border-slate-900" 
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              💳 Card
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {noteExpanded ? (
            <textarea
              className="w-full text-sm p-2 rounded-lg border border-slate-200 focus:border-brand focus:ring-1 focus:ring-brand outline-none resize-none"
              rows={2}
              placeholder="Any special requests?"
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
            />
          ) : (
            <button onClick={() => setNoteExpanded(true)} className="text-sm text-brand font-medium hover:underline">
              + Add special note
            </button>
          )}
        </div>

        <Button 
          className="w-full h-12 text-base font-semibold" 
          disabled={cartItems.length === 0 || !paymentMethod || isPlacing}
          onClick={handlePlaceOrder}
        >
          {isPlacing ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
          {isPlacing ? "Placing Order..." : "Place Order"}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row max-w-7xl mx-auto">
      {/* Left Column - Menu */}
      <div className="flex-1 lg:max-w-4xl p-4 sm:p-6 pb-24 lg:pb-6">
        
        {/* Header Strip */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{restaurantName}</h1>
          <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
            Table {tableNumber}
          </div>
        </div>

        {/* Categories Tabs */}
        {categories.length > 0 && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
            <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              <TabsList className="w-max inline-flex h-11 items-center justify-start rounded-xl bg-slate-200/50 p-1 text-slate-500">
                <TabsTrigger value="all" className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">All</TabsTrigger>
                {categories.map(cat => (
                  <TabsTrigger key={cat.id} value={cat.id} className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                    {cat.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
        )}

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedTags([])}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors border ${
                selectedTags.length === 0 
                ? 'bg-slate-900 text-white border-slate-900' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors border ${
                  selectedTags.includes(tag)
                  ? 'bg-orange-500 text-white border-orange-500' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredItems.map(item => {
            const hasVariants = item.variants && item.variants.length > 0
            
            return (
              <div key={item._id} className={`${theme.card} p-3 flex flex-col relative overflow-hidden group`}>
                {!item.isAvailable && (
                  <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">Unavailable</span>
                  </div>
                )}
                
                <div className="flex gap-4">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.name} className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl shrink-0 border border-slate-100" />
                  )}
                  <div className="flex-1 flex flex-col min-w-0 py-1">
                    <h3 className="font-bold text-slate-900 text-base leading-tight mb-1 truncate">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-slate-500 line-clamp-2 leading-snug mb-2">{item.description}</p>
                    )}
                    
                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.tags.map((tag, idx) => (
                          <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto pt-2 flex items-center justify-between">
                      {hasVariants ? (
                        <div className="text-sm font-bold text-slate-900">From {formatPrice(item.variants![0].price)}</div>
                      ) : (
                        <div className="text-lg font-bold text-slate-900">{formatPrice(item.price)}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Add to Cart Actions */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  {hasVariants ? (
                    <div className="flex flex-wrap gap-2">
                      {item.variants!.map((v, idx) => {
                        const uniqueId = `${item._id}-${v.name}`
                        const cartItem = cartItems.find(i => i.menuItemId === item._id && i.variantName === v.name)
                        
                        return cartItem ? (
                          <div key={idx} className="flex-1 flex items-center justify-between gap-1 bg-slate-50 rounded-lg p-1 border border-brand/20">
                            <span className="text-xs font-semibold pl-1 truncate text-slate-700">{v.name}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={() => dispatch(updateQuantity({ id: uniqueId, quantity: cartItem.quantity - 1 }))} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-brand"><Minus size={12} /></button>
                              <span className="w-4 text-center text-xs font-bold">{cartItem.quantity}</span>
                              <button onClick={() => dispatch(updateQuantity({ id: uniqueId, quantity: cartItem.quantity + 1 }))} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-brand"><Plus size={12} /></button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            key={idx}
                            onClick={() => handleAddToCart(item, idx)}
                            disabled={!item.isAvailable}
                            className="flex-1 min-w-0 flex flex-col items-center justify-center py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors text-slate-700 disabled:opacity-50"
                          >
                            <span className="text-xs font-semibold truncate w-full text-center">{v.name}</span>
                            <span className="text-[10px] font-medium text-slate-500">{formatPrice(v.price)}</span>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      {(() => {
                        const uniqueId = `${item._id}-base`
                        const cartItem = cartItems.find(i => i.menuItemId === item._id && !i.variantName)
                        
                        return cartItem ? (
                          <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 border border-brand/20">
                            <button onClick={() => dispatch(updateQuantity({ id: uniqueId, quantity: cartItem.quantity - 1 }))} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-brand"><Minus size={16} /></button>
                            <span className="w-6 text-center text-sm font-bold">{cartItem.quantity}</span>
                            <button onClick={() => dispatch(updateQuantity({ id: uniqueId, quantity: cartItem.quantity + 1 }))} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-brand"><Plus size={16} /></button>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => handleAddToCart(item)}
                            disabled={!item.isAvailable}
                            size="sm" 
                            className="rounded-full px-5 shadow-sm"
                          >
                            <Plus size={16} className="mr-1" /> Add
                          </Button>
                        )
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right Column - Cart (Desktop) */}
      <div className="hidden lg:block w-[380px] shrink-0 border-l border-slate-200 bg-white sticky top-0 h-screen shadow-xl z-20">
        <CartPanel />
      </div>

      {/* Mobile Cart Trigger & Sheet */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button className="w-full h-14 rounded-2xl shadow-xl flex justify-between px-6 text-lg">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-1.5 rounded-full"><ShoppingCart size={20} /></div>
                <span className="font-semibold">{cartCount} items</span>
              </div>
              <span className="font-bold">{formatPrice(cartTotal)}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-3xl overflow-hidden flex flex-col">
            <CartPanel />
          </SheetContent>
        </Sheet>
      </div>
      
    </div>
  )
}
