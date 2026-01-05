'use client'

import { useEffect, useState } from 'react'
import Title from './Title'
import ProductCard from './ProductCard'

const ProductSections = () => {

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
            
            // Transform all products
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
            <div className='px-4 sm:px-6 py-8 sm:py-12 max-w-6xl mx-auto'>
                <div className='animate-pulse space-y-12 sm:space-y-16'>
                    {/* Best Selling Skeleton */}
                    <div className='text-center'>
                        <div className='h-8 bg-gray-200 rounded w-48 mx-auto mb-3'></div>
                        <div className='h-4 bg-gray-200 rounded w-64 mx-auto mb-8'></div>
                        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6'>
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className='h-64 bg-gray-200 rounded-lg'></div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Latest Products Skeleton */}
                    <div className='text-center'>
                        <div className='h-8 bg-gray-200 rounded w-48 mx-auto mb-3'></div>
                        <div className='h-4 bg-gray-200 rounded w-64 mx-auto mb-8'></div>
                        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6'>
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className='h-64 bg-gray-200 rounded-lg'></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Get first 4 products for Latest Products
    const latestProducts = products.slice(0, 4)
    
    // Get next 8 products for Best Selling (starting after latest products)
    const bestSellingProducts = products.slice(4, 12)

    return (
        <div>
            {/* Latest Products Section */}
            <div className='px-4 sm:px-6 py-8 sm:py-12 max-w-6xl mx-auto text-center'>
                <div className='relative inline-block mb-2'>
                    <Title 
                        title='Latest Products' 
                        description={`Showing ${latestProducts.length} newest products`} 
                        href='/shop' 
                    />
                </div>
                
                <div className='mt-8 sm:mt-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6'>
                    {latestProducts.map((product) => (
                        <ProductCard 
                            key={`latest-${product.id}`} 
                            product={product} 
                            storeid={storeInfo?.store_id} 
                        />
                    ))}
                </div>
                
                {latestProducts.length === 0 && (
                    <div className='mt-8 text-gray-500'>
                        <p>No products available at the moment</p>
                    </div>
                )}
                
                <div className='mt-10 sm:mt-12 flex items-center justify-center'>
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

            {/* Best Selling Section */}
            <div className='px-4 sm:px-6 py-8 sm:py-12 max-w-6xl mx-auto text-center'>
                <div className='relative inline-block mb-2'>
                    <Title 
                        title='Best Selling' 
                        description={`Showing ${bestSellingProducts.length} featured products`} 
                        href='/shop' 
                    />
                </div>
                
                <div className='mt-8 sm:mt-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6'>
                    {bestSellingProducts.map((product) => (
                        <ProductCard 
                            key={`best-${product.id}`} 
                            product={product} 
                            storeid={storeInfo?.store_id} 
                        />
                    ))}
                </div>
                
                {bestSellingProducts.length === 0 && (
                    <div className='mt-8 text-gray-500'>
                        <p>No products available at the moment</p>
                    </div>
                )}
                
                <div className='mt-10 sm:mt-12 flex items-center justify-center'>
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
        </div>
    )
}

export default ProductSections