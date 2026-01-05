'use client'
import ProductCard from "@/components/ProductCard"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { MailIcon, MapPinIcon, PackageIcon, ExternalLinkIcon, Info } from "lucide-react"
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
            // const response = await fetch(`http://localhost:4000/merchant/store-products/${username}`)
            if (!response.ok) throw new Error('Failed to fetch products')
            const data = await response.json()
            
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
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (username) fetchStoreData()
    }, [username])

    if (loading) return <Loading />
    if (error) return <div className="min-h-[70vh] flex items-center justify-center text-slate-500">{error}</div>

    return (
        <div className="min-h-screen bg-white">
            {/* Header Section */}
            {storeInfo && (
                <div className="bg-white border-b border-slate-100">
                    <div className="max-w-[1600px] mx-auto px-6 py-10">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="relative h-28 w-28 flex-shrink-0">
                                <Image
                                    src={`https://dmarketplacebackend.vercel.app/${storeInfo.logoImg.replace(/\\/g, '/')}`}
                                    alt={storeInfo.shopName}
                                    fill
                                    className="object-cover rounded-xl border border-slate-200"
                                />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl font-bold text-slate-900">{storeInfo.shopName}</h1>
                                <p className="text-slate-500 text-sm mt-1">{storeInfo.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content: Max-width expanded to support 4-col + Sidebar */}
            <main className="max-w-[1600px] mx-auto px-6 py-8">
                <div className="flex flex-col xl:flex-row gap-8">
                    
                    {/* Products Column */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-6 text-slate-400">
                            <PackageIcon className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Store Inventory</span>
                        </div>

                        {products.length > 0 ? (
                            /* Grid: 4 columns on large screens */
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                                {products.map((product) => (
                                    <div key={product.id} className="w-full">
                                        <ProductCard product={product} storeid={storeInfo.store_id} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 border rounded-xl border-dashed">
                                <p className="text-slate-400">No products found.</p>
                            </div>
                        )}
                    </div>

                    {/* Ad Sidebar */}
                    <aside className="xl:w-80 flex-shrink-0">
                        <div className="sticky top-6">
                            {/* Pro Ad Banner */}
                            <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white shadow-2xl">
                                {/* Ad Label */}
                                <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-slate-300">
                                    <Info className="w-3 h-3" /> PROMOTED
                                </div>

                                <div className="relative h-[550px] w-full">
                                    <Image 
                                        src="https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&q=80&w=800" 
                                        alt="Web3 Ad"
                                        fill
                                        className="object-cover opacity-60"
                                    />
                                    {/* Ad Content Overlay */}
                                    <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent">
                                        <div className="mb-6">
                                            <div className="w-12 h-12 bg-white rounded-lg mb-4 flex items-center justify-center">
                                                <div className="w-8 h-8 bg-blue-600 rounded-sm rotate-45" />
                                            </div>
                                            <h3 className="text-2xl font-black leading-tight mb-2">
                                                BUILT FOR THE <br />
                                                <span className="text-blue-400">NEW INTERNET</span>
                                            </h3>
                                            <p className="text-slate-300 text-sm leading-relaxed">
                                                Connect your hardware directly to the chain. Zero latency. Zero OS.
                                            </p>
                                        </div>
                                        
                                        <a 
                                            href="#" 
                                            className="group flex items-center justify-between bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl font-bold transition-all"
                                        >
                                            Explore Bare-Metal
                                            <ExternalLinkIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </a>
                                        
                                        <p className="text-center text-[10px] text-slate-500 mt-6 tracking-widest uppercase">
                                            Sponsored by D-Marketplace
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Ad/Safety Note */}
                            <div className="mt-4 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                                <p className="text-[11px] text-slate-500 leading-tight">
                                    All transactions are secured via smart contract. Please ensure you are connected to the correct network before proceeding.
                                </p>
                            </div>
                        </div>
                    </aside>

                </div>
            </main>
        </div>
    )
}