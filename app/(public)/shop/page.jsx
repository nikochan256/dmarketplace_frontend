'use client'
import { Suspense, useEffect, useState, useMemo } from "react"
import { MoveLeftIcon, Store, MapPin, Mail, Phone, CheckCircle, Clock, XCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

// Cache object to store fetched stores
const storeCache = {
    data: null,
    timestamp: null,
    expiryTime: 5 * 60 * 1000 // 5 minutes in milliseconds
}

function SellerCard({ seller }) {
    const router = useRouter()
    
    // Convert backend path to accessible URL
    const logoUrl = seller.logoImg 
        ? `https://dmarketplacebackend.vercel.app/${seller.logoImg.replace(/\\/g, '/')}` 
        : null
    
    return (
        <Link 
        href={`/shop/${seller.store_id}`}
        state={{ seller }}
      
            className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-slate-200 hover:border-blue-300 w-full"
        >
            <div className="flex flex-col md:flex-row">
                {/* Store Image/Logo */}
                <div className="relative w-full md:w-96 h-64 md:h-72 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden flex-shrink-0">
                    {logoUrl ? (
                        <img 
                            src={logoUrl} 
                            alt={seller.shopName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex'
                            }}
                        />
                    ) : null}
                    
                    <div className={`fallback-icon w-full h-full flex items-center justify-center absolute inset-0 ${logoUrl ? 'hidden' : ''}`}>
                        <Store size={64} className="text-slate-300" />
                    </div>
                    
                    {/* Status Badge */}
                    {seller.isApproved ? (
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
                            <CheckCircle size={14} />
                            Verified
                        </div>
                    ) : seller.kybStatus === 'PENDING' ? (
                        <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
                            <Clock size={14} />
                            Pending
                        </div>
                    ) : seller.kybStatus === 'REJECTED' ? (
                        <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
                            <XCircle size={14} />
                            Rejected
                        </div>
                    ) : null}
                </div>

                {/* Store Info */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                {seller.shopName}
                            </h3>
                            <span className="text-xs text-slate-500 font-mono bg-slate-100 px-3 py-1 rounded-full whitespace-nowrap ml-4">
                                ID: {seller.store_id}
                            </span>
                        </div>
                        
                        {seller.description && (
                            <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                                {seller.description}
                            </p>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {seller.businessEmail && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Mail size={16} className="text-slate-400 flex-shrink-0" />
                                    <span className="truncate">{seller.businessEmail}</span>
                                </div>
                            )}
                            
                            {seller.contactNumber && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Phone size={16} className="text-slate-400 flex-shrink-0" />
                                    <span>{seller.contactNumber}</span>
                                </div>
                            )}
                            
                            {seller.businessAddress && (
                                <div className="flex items-center gap-2 text-sm text-slate-600 lg:col-span-2">
                                    <MapPin size={16} className="text-slate-400 flex-shrink-0" />
                                    <span className="line-clamp-1">{seller.businessAddress}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
                        <div>
                            <span className="font-semibold">Wallet:</span> {seller.walletAddress.slice(0, 6)}...{seller.walletAddress.slice(-4)}
                        </div>
                        <div>
                            <span className="font-semibold">Joined:</span> {new Date(seller.createdAt).toLocaleDateString()}
                        </div>
                        {seller.approvedAt && (
                            <div>
                                <span className="font-semibold">Approved:</span> {new Date(seller.approvedAt).toLocaleDateString()}
                            </div>
                        )}
                        {seller.rejectionReason && (
                            <div className="text-red-500 w-full">
                                <span className="font-semibold">Rejection Reason:</span> {seller.rejectionReason}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 border-2 border-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </Link>
    )
}

function ShopContent() {
    const [stores, setStores] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // get query params ?search=abc
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const router = useRouter()

    // Fetch stores from backend with caching
    useEffect(() => {
        const fetchStores = async () => {
            try {
                // Check if cache exists and is still valid
                const now = Date.now()
                if (storeCache.data && storeCache.timestamp && 
                    (now - storeCache.timestamp) < storeCache.expiryTime) {
                    // Use cached data
                    setStores(storeCache.data)
                    setLoading(false)
                    return
                }

                // Cache is invalid or doesn't exist, fetch from API
                setLoading(true)
                const response = await fetch('https://dmarketplacebackend.vercel.app/merchant/get-all-stores')
                
                if (!response.ok) {
                    throw new Error('Failed to fetch stores')
                }
                
                const result = await response.json()
                
                // Update cache with the data array from response
                storeCache.data = result.data || []
                storeCache.timestamp = Date.now()
                
                setStores(result.data || [])
            } catch (err) {
                setError(err.message)
                console.error('Error fetching stores:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchStores()
    }, [])

    // Memoize filtered stores to avoid recalculating on every render
    const filteredStores = useMemo(() => {
        if (!search) return stores
        return stores.filter(store =>
            store.shopName.toLowerCase().includes(search.toLowerCase()) ||
            (store.description && store.description.toLowerCase().includes(search.toLowerCase())) ||
            (store.businessEmail && store.businessEmail.toLowerCase().includes(search.toLowerCase()))
        )
    }, [stores, search])

    if (loading) {
        return (
            <div className="min-h-[70vh] mx-6 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <div className="text-slate-500">Loading stores...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-[70vh] mx-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-lg font-semibold mb-2">Error Loading Stores</div>
                    <div className="text-slate-600">{error}</div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="my-8">
                    <h1 
                        onClick={() => search && router.push('/shop')} 
                        className={`text-3xl text-slate-700 font-bold flex items-center gap-3 ${search ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}`}
                    >
                        {search && <MoveLeftIcon size={28} />}  
                        Discover Amazing <span className="text-blue-600">Stores</span>
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Browse through our verified sellers and find the best products
                    </p>
                </div>

                {/* Store List - Full Width Banners */}
                <div className="flex flex-col gap-6 mb-32">
                    {filteredStores.length > 0 ? (
                        filteredStores.map((seller) => (
                            <SellerCard key={seller.id} seller={seller} />
                        ))
                    ) : (
                        <div className="text-center py-20">
                            <Store size={64} className="mx-auto text-slate-300 mb-4" />
                            <div className="text-slate-500 text-lg">
                                {search ? 'No stores found matching your search' : 'No stores available yet'}
                            </div>
                            {search && (
                                <button
                                    onClick={() => router.push('/shop')}
                                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function Shop() {
    return (
        <Suspense fallback={
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="text-slate-500">Loading shop...</div>
            </div>
        }>
            <ShopContent />
        </Suspense>
    )
}