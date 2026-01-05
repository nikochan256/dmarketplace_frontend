'use client'
import { Suspense, useEffect, useState, useMemo } from "react"
import { MoveLeftIcon, Store, MapPin, Mail, Phone, CheckCircle, Clock, XCircle, PackageIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import ProductCard from "@/components/ProductCard"

// Cache object to store fetched stores
const storeCache = {
    data: null,
    timestamp: null,
    expiryTime: 5 * 60 * 1000 // 5 minutes in milliseconds
}

function SellerCardWithProducts({ merchant, products }) {
    const router = useRouter()
    
    // Convert backend path to accessible URL
    const logoUrl = merchant?.logoImg 
        // ? `https://dmarketplacebackend.vercel.app/${merchant.logoImg.replace(/\\/g, '/')}` 
        ? `http://localhost:4000/${merchant.logoImg.replace(/\\/g, '/')}` 
        : null
    
    // Transform products to match ProductCard format
    const transformedProducts = products?.map(product => ({
        id: product.id,
        external_id: product.external_id,
        name: product.name,
        thumbnail: product.thumbnail_url,
        variants: product.variants,
        synced: product.synced,
        is_ignored: product.is_ignored
    })) || []
    
    return (
        <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 hover:border-blue-300 w-full">
            {/* Store Header */}
            <div className="flex flex-col md:flex-row border-b border-slate-200">
                {/* Store Image/Logo */}
                <div className="relative w-full md:w-80 h-48 md:h-56 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden flex-shrink-0">
                    {logoUrl ? (
                        <img 
                            src={logoUrl} 
                            alt={merchant?.shopName || 'Store'}
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
                    {merchant?.isApproved ? (
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
                            <CheckCircle size={14} />
                            Verified
                        </div>
                    ) : merchant?.kybStatus === 'PENDING' ? (
                        <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
                            <Clock size={14} />
                            Pending
                        </div>
                    ) : merchant?.kybStatus === 'REJECTED' ? (
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
                            <Link 
                                href={`/shop/${merchant?.store_id}`}
                                className="text-2xl font-bold text-slate-800 hover:text-blue-600 transition-colors"
                            >
                                {merchant?.shopName || 'Unknown Store'}
                            </Link>
                            <span className="text-xs text-slate-500 font-mono bg-slate-100 px-3 py-1 rounded-full whitespace-nowrap ml-4">
                                ID: {merchant?.store_id || 'N/A'}
                            </span>
                        </div>
                        
                        {merchant?.description && (
                            <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                                {merchant.description}
                            </p>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {merchant?.businessEmail && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Mail size={16} className="text-slate-400 flex-shrink-0" />
                                    <span className="truncate">{merchant.businessEmail}</span>
                                </div>
                            )}
                            
                            {merchant?.contactNumber && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Phone size={16} className="text-slate-400 flex-shrink-0" />
                                    <span>{merchant.contactNumber}</span>
                                </div>
                            )}
                            
                            {merchant?.businessAddress && (
                                <div className="flex items-center gap-2 text-sm text-slate-600 lg:col-span-2">
                                    <MapPin size={16} className="text-slate-400 flex-shrink-0" />
                                    <span className="line-clamp-1">{merchant.businessAddress}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
                        {merchant?.walletAddress && (
                            <div>
                                <span className="font-semibold">Wallet:</span> {merchant.walletAddress.slice(0, 6)}...{merchant.walletAddress.slice(-4)}
                            </div>
                        )}
                        {merchant?.createdAt && (
                            <div>
                                <span className="font-semibold">Joined:</span> {new Date(merchant.createdAt).toLocaleDateString()}
                            </div>
                        )}
                        {merchant?.approvedAt && (
                            <div>
                                <span className="font-semibold">Approved:</span> {new Date(merchant.approvedAt).toLocaleDateString()}
                            </div>
                        )}
                        {merchant?.rejectionReason && (
                            <div className="text-red-500 w-full">
                                <span className="font-semibold">Rejection Reason:</span> {merchant.rejectionReason}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Products Section */}
            {transformedProducts.length > 0 && (
                <div className="p-6 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-slate-700">
                            <PackageIcon className="w-4 h-4" />
                            <span className="text-sm font-bold uppercase tracking-wider">Products</span>
                            <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                                {transformedProducts.length}
                            </span>
                        </div>
                        <Link 
                            href={`/shop/${merchant?.store_id}`}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            View All →
                        </Link>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {transformedProducts.slice(0, 5).map((product) => (
                            <div key={product.id} className="w-full">
                                <ProductCard product={product} storeid={merchant?.store_id} />
                            </div>
                        ))}
                    </div>

                    {transformedProducts.length > 5 && (
                        <div className="mt-4 text-center">
                            <Link 
                                href={`/shop/${merchant?.store_id}`}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                            >
                                +{transformedProducts.length - 5} more products
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
function ShopContent() {
    const [merchantsData, setMerchantsData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [statistics, setStatistics] = useState(null)

    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const router = useRouter()

    // Fetch merchants with products from backend with caching
    useEffect(() => {
        let isMounted = true
        const controller = new AbortController()

        const fetchMerchantsWithProducts = async () => {
            try {
                // Check if cache exists and is still valid
                const now = Date.now()
                if (storeCache.data && storeCache.timestamp && 
                    (now - storeCache.timestamp) < storeCache.expiryTime) {
                    console.log('📦 Using cached data')
                    if (isMounted) {
                        setMerchantsData(storeCache.data)
                        setLoading(false)
                    }
                    return
                }

                // Cache is invalid or doesn't exist, fetch from API
                if (isMounted) setLoading(true)
                
                console.log('🔄 Fetching fresh data from API...')
                
                const response = await fetch(
                    'https://dmarketplacebackend.vercel.app/merchant/all-merchants-products',
                    { signal: controller.signal }
                )
                
                if (!response.ok) {
                    throw new Error('Failed to fetch merchants and products')
                }
                
                const result = await response.json()
                
                if (isMounted) {
                    // Update cache with the data array from response
                    storeCache.data = result.data || []
                    storeCache.timestamp = Date.now()
                    
                    setMerchantsData(result.data || [])
                    setStatistics(result.statistics)
                    console.log('✅ Data fetched and cached successfully')
                }
            } catch (err) {
                if (err.name === 'AbortError') {
                    console.log('⚠️ Request was cancelled')
                    return
                }
                
                if (isMounted) {
                    setError(err.message)
                    console.error('❌ Error fetching merchants:', err)
                }
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        fetchMerchantsWithProducts()

        // Cleanup function to cancel request if component unmounts
        return () => {
            isMounted = false
            controller.abort()
            console.log('🧹 Cleanup: Cancelled pending requests')
        }
    }, []) 

    // Memoize filtered merchants to avoid recalculating on every render
    const filteredMerchants = useMemo(() => {
        if (!search) return merchantsData
        return merchantsData.filter(item =>
            item.merchant.shopName.toLowerCase().includes(search.toLowerCase()) ||
            (item.merchant.description && item.merchant.description.toLowerCase().includes(search.toLowerCase())) ||
            (item.merchant.businessEmail && item.merchant.businessEmail.toLowerCase().includes(search.toLowerCase()))
        )
    }, [merchantsData, search])

    if (loading) {
        return (
            <div className="min-h-[70vh] mx-6 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <div className="text-slate-500">Loading stores and products...</div>
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

                    {/* Statistics */}
                    {/* {statistics && (
                        <div className="flex flex-wrap gap-4 mt-4">
                            <div className="bg-blue-50 px-4 py-2 rounded-lg">
                                <span className="text-sm text-slate-600">Total Stores: </span>
                                <span className="font-bold text-blue-600">{statistics.totalMerchants}</span>
                            </div>
                            <div className="bg-green-50 px-4 py-2 rounded-lg">
                                <span className="text-sm text-slate-600">Total Products: </span>
                                <span className="font-bold text-green-600">{statistics.totalProducts}</span>
                            </div>
                            <div className="bg-purple-50 px-4 py-2 rounded-lg">
                                <span className="text-sm text-slate-600">With Products: </span>
                                <span className="font-bold text-purple-600">{statistics.merchantsWithProducts}</span>
                            </div>
                        </div>
                    )} */}
                </div>

                {/* Merchants List with Products */}
                <div className="flex flex-col gap-6 mb-32">
                    {filteredMerchants.length > 0 ? (
                        filteredMerchants.map((item) => (
                            <SellerCardWithProducts 
                                key={item.merchant.id} 
                                merchant={item.merchant} 
                                products={item.products}
                            />
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
