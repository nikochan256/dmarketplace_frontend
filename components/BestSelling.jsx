'use client'
import { useEffect, useState } from 'react'
import Title from './Title'
import ProductCard from './ProductCard'

const BestSelling = () => {

    const displayQuantity = 8
    const [products, setProducts] = useState([])
    const [storeInfo, setStoreInfo] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchProducts = async () => {
        try {
            setLoading(true)
            
            // Fetch products and store info from single endpoint
            const response = await fetch('https://dmarketplacebackend.vercel.app/merchant/store-products/16547782')
            
            if (!response.ok) {
                throw new Error('Failed to fetch products')
            }
            
            const data = await response.json()
            console.log("Data received:", data)
            
            // Set store info
            setStoreInfo(data.store)
            
            // Transform and take only top 4 products
            const transformedProducts = data.data.result
                .slice(0, displayQuantity)
                .map(product => ({
                    id: product.id,
                    external_id: product.external_id,
                    name: product.name,
                    thumbnail: product.thumbnail_url,
                    variants: product.variants,
                    synced: product.synced,
                    is_ignored: product.is_ignored
                }))
            
            setProducts(transformedProducts)
            
        } catch (err) {
            console.error('Error fetching products:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    if (loading) {
        return (
            <div className='px-6 my-20 max-w-6xl mx-auto text-center'>
                <div className='animate-pulse'>
                    <div className='h-8 bg-gray-200 rounded w-48 mx-auto mb-4'></div>
                    <div className='h-4 bg-gray-200 rounded w-64 mx-auto mb-12'></div>
                    <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6'>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className='h-64 bg-gray-200 rounded-lg'></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='px-6 my-20 max-w-6xl mx-auto text-center'>
            {/* Enhanced Title Section */}
            <div className='relative inline-block mb-4'>
                <Title 
                    title='Best Selling' 
                    description={`Showing ${products.length} featured products`} 
                    href='/shop' 
                />
            </div>
            
            {/* Products Grid */}
            <div className='mt-12 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6'>
                {products.map((product) => (
                    <ProductCard 
                        key={product.id} 
                        product={product} 
                        storeid={storeInfo?.store_id} 
                    />
                ))}
            </div>
            
            {products.length === 0 && (
                <div className='mt-12 text-gray-500'>
                    <p>No products available at the moment</p>
                </div>
            )}
            
            {/* Bottom decorative line */}
            <div className='mt-16 flex items-center justify-center'>
                <div className='h-[1px] w-full max-w-md bg-gradient-to-r from-transparent via-gray-200 to-transparent'></div>
            </div>

            <style jsx>{`
                .relative:hover::after {
                    content: '';
                    position: absolute;
                    bottom: -4px;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: #00C950;
                    animation: lineExpand 0.3s ease-out forwards;
                }

                @keyframes lineExpand {
                    from {
                        width: 0%;
                    }
                    to {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    )
}

export default BestSelling