'use client'
import { StarIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'

const ProductCard = ({ product , storeid }) => {
    
    const router = useRouter()
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    // calculate the average rating of the product
    const rating = 5

    const handleClick = (e) => {
        e.preventDefault()
        // Navigate with state
        router.push(`/product/${storeid}/${product.id}`), { 
            state: { product } 
        }
    }

    return (
        <div
            onClick={handleClick}
            className='group max-xl:mx-auto block relative'
        >
            <div className='bg-[#F5F5F5] h-40 sm:w-60 sm:h-68 rounded-lg flex items-center justify-center relative overflow-hidden'>
                {product.image || product.thumbnail ? (
                    <Image 
                        width={500} 
                        height={500} 
                        className='max-h-30 sm:max-h-40 w-auto group-hover:scale-115 group-hover:blur-[5px] transition-all duration-300' 
                        src={product.image || product.thumbnail} 
                        alt={product.name} 
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                    </div>
                )}
                
                {/* Hover Info Slide */}
                <div className='absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-2 transition-transform duration-300 bg-white/95 rounded-t-lg p-3 shadow-lg'>
                    <p className='text-xs text-gray-600 line-clamp-2 mb-1'>
                        {product.description || 'Premium quality product with excellent features'}
                    </p>
                    <p className='text-xs text-gray-500'>
                        Seller: <span className='font-medium text-gray-700'>{product.name || 'Official Store'}</span>
                    </p>
                </div>
            </div>
            
            <div className='flex justify-between gap-3 text-sm text-slate-800 pt-2 max-w-60'>
                <div>
                    <p>{product.name}</p>
                    <div className='flex'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon 
                                key={index} 
                                size={14} 
                                className='text-transparent mt-0.5' 
                                fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"} 
                            />
                        ))}
                    </div>
                </div>
                <p>{currency}{product.price}</p>
            </div>
        </div>
    )
}

export default ProductCard