
'use client'
import Link from 'next/link'
import Image from 'next/image'

const CategoryShowcase = () => {
    const categories = [
        {
            name: 'Electronics',
            image: '/categories/electronics.jpg',
            count: 245,
            color: 'from-blue-500 to-blue-600'
        },
        {
            name: 'Fashion',
            image: '/categories/fashion.jpg',
            count: 189,
            color: 'from-pink-500 to-pink-600'
        },
        {
            name: 'Home & Living',
            image: '/categories/home.jpg',
            count: 156,
            color: 'from-green-500 to-green-600'
        },
        {
            name: 'Sports',
            image: '/categories/sports.jpg',
            count: 98,
            color: 'from-orange-500 to-orange-600'
        }
    ]

    return (
        <div className='px-6  my-20 max-w-6xl mx-auto'>
            <div className='relative inline-block mb-4'>
                <h2 className='text-3xl font-bold text-slate-800'>Shop by Category</h2>
            </div>
            
            <div className='flex items-center gap-4 mb-12'>
                <div className='h-[2px] w-16 bg-gradient-to-r from-[#00C950] to-transparent'></div>
                <span className='text-xs text-gray-400 uppercase tracking-wider'>Explore Collections</span>
            </div>

            <div className='grid grid-cols-2 lg:grid-cols-4 gap-6'>
                {categories.map((category, index) => (
                    <Link 
                        href={`/category/${category.name.toLowerCase()}`} 
                        key={index}
                        className='group relative overflow-hidden rounded-xl bg-gray-100 aspect-square hover:shadow-xl transition-all duration-300'
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90 group-hover:opacity-80 transition-opacity`}></div>
                        <div className='relative h-full flex flex-col items-center justify-center p-6 text-white'>
                            <h3 className='text-2xl font-bold mb-2 group-hover:scale-110 transition-transform'>
                                {category.name}
                            </h3>
                            <p className='text-sm opacity-90'>{category.count} Products</p>
                            <div className='mt-4 opacity-0 group-hover:opacity-100 transition-opacity'>
                                <span className='text-xs border border-white px-4 py-1 rounded-full'>
                                    Browse →
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className='mt-16 flex items-center justify-center'>
                <div className='h-[1px] w-full max-w-md bg-gradient-to-r from-transparent via-gray-200 to-transparent'></div>
            </div>

            <style jsx>{`
                h2:hover::after {
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
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </div>
    )
}

export default CategoryShowcase


