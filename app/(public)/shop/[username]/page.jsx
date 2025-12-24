'use client'
import ProductCard from "@/components/ProductCard"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { MailIcon, MapPinIcon, PackageIcon } from "lucide-react"
import Loading from "@/components/Loading"
import Image from "next/image"


export default function StoreShop() {

    const { username } = useParams()
    const [products, setProducts] = useState([])
    const [storeInfo, setStoreInfo] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    

    const fetchStoreData = async () => {
        try {
            setLoading(true)
          
            const response = await fetch(`https://dmarketplacebackend.vercel.app/merchant/store-products/${username}`)
            
            if (!response.ok) {
                throw new Error('Failed to fetch products')
            }
            
            const data = await response.json()
            console.log("this is the data recieved ",data)
            
            const transformedProducts = data.data.result.map(product => ({
                id: product.id,
                external_id: product.external_id,
                name: product.name,
                thumbnail: product.thumbnail_url,
                variants: product.variants,
                synced: product.synced,
                is_ignored: product.is_ignored
            }))
            
            setProducts(transformedProducts)
            setStoreInfo(data.store)
            
        } catch (err) {
            console.error('Error fetching store data:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    

    useEffect(() => {
        if (username) {
            fetchStoreData()
        }
    }, [username])

    if (loading) return <Loading />
    
    if (error) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-2">Error</h2>
                    <p className="text-slate-600">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[70vh]">

            {/* Store Info Banner - Enhanced */}
            {storeInfo && (
                <div className="relative bg-gradient-to-br from-slate-50 via-white to-slate-50 border-b border-slate-200">
                    {/* Decorative background elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-slate-100 rounded-full opacity-30 blur-3xl"></div>
                        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-50 rounded-full opacity-30 blur-3xl"></div>
                    </div>

                    <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-16">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                            {/* Store Logo */}
                            <div className="flex-shrink-0">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                    <Image
                                        src={`https://dmarketplacebackend.vercel.app/${storeInfo.logoImg.replace(/\\/g, '/')}`}
                                        alt={storeInfo.shopName}
                                        className="relative w-40 ruoh-40 md:w-48 md:h-48 object-cover rounded-2xl shadow-lg border-4 border-white ring-1 ring-slate-200"
                                        width={192}
                                        height={192}
                                    />
                                </div>
                            </div>

                            {/* Store Details */}
                            <div className="flex-1 text-center md:text-left space-y-4">
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
                                        {storeInfo.shopName}
                                    </h1>
                                    <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-2xl">
                                        {storeInfo.description}
                                    </p>
                                </div>

                                {/* Contact Info Cards */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg shadow-sm border border-slate-200 hover:border-slate-300 transition-colors">
                                        <MapPinIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                        <span className="text-sm text-slate-700">{storeInfo.businessAddress}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg shadow-sm border border-slate-200 hover:border-slate-300 transition-colors">
                                        <MailIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                        <span className="text-sm text-slate-700">{storeInfo.businessEmail}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Products Section - Enhanced */}
            <div className="max-w-7xl mx-auto px-6 py-12 mb-20">
                <div className="flex items-center gap-3 mb-8">
                    <PackageIcon className="w-7 h-7 text-slate-700" />
                    <h2 className="text-3xl font-bold text-slate-900">
                        Our Products
                    </h2>
                </div>
                
                {products.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => <ProductCard key={product.id} product={product} storeid={storeInfo.store_id} />)}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                            <PackageIcon className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-600 text-lg">No products available yet</p>
                        <p className="text-slate-500 text-sm mt-1">Check back soon for new items</p>
                    </div>
                )}
            </div>
        </div>
    )
}