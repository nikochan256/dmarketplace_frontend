'use client'
import { assets } from "@/assets/assets"
import { InfoIcon, PackageIcon, TagIcon, TrendingUpIcon } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { useParams, useRouter } from "next/navigation"

export default function StoreAddProduct() {
    const params = useParams()
    const router = useRouter()
    const sellerId = params.id
    const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Beauty & Health', 'Toys & Games', 'Sports & Outdoors', 'Books & Media', 'Food & Drink', 'Hobbies & Crafts', 'Others']

    const [images, setImages] = useState({ 1: null})
    const [productInfo, setProductInfo] = useState({
        name: "",
        description: "",
        mrp: 0,
        price: 0,
        category: "",
        stock: 0,
    })
    const [loading, setLoading] = useState(false)


    const onChangeHandler = (e) => {
        setProductInfo({ ...productInfo, [e.target.name]: e.target.value })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        
        if (!images[1]) {
            toast.error("Please upload a product image")
            return
        }

        setLoading(true)

        try {
            const formData = new FormData()
            
            // Append product data
            formData.append('name', productInfo.name)
            formData.append('description', productInfo.description)
            formData.append('price', productInfo.price.toString())
            formData.append('stock', productInfo.stock.toString())
            formData.append('category', productInfo.category)
            
            // Append image
            formData.append('image', images[1])

            const response = await fetch(`https://dmarketplacebackend.vercel.app/merchant/add-product/${sellerId}`, {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (response.ok) {
                toast.success(data.msg || "Product added successfully!")
                
                // Reset form
                setProductInfo({
                    name: "",
                    description: "",
                    mrp: 0,
                    price: 0,
                    category: "",
                    stock: 0,
                })
                setImages({ 1: null })
                
                // Optional: redirect to products list
                // router.push(`/merchant/${sellerId}/products`)
            } else {
                toast.error(data.msg || "Failed to add product")
            }
        } catch (error) {
            console.error("Error adding product:", error)
            toast.error("An error occurred while adding the product")
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className="flex gap-8 mb-28">
            {/* Left Side - Form */}
            <form onSubmit={onSubmitHandler} className="text-slate-500 flex-1">
                <h1 className="text-2xl">Add New <span className="text-slate-800 font-medium">Products</span></h1>
                <p className="mt-7">Product Images</p>

                <div htmlFor="" className="flex gap-3 mt-4">
                    {Object.keys(images).map((key) => (
                        <label key={key} htmlFor={`images${key}`}>
                            <Image width={300} height={300} className='h-15 w-auto border border-slate-200 rounded cursor-pointer' src={images[key] ? URL.createObjectURL(images[key]) : assets.upload_area} alt="" />
                            <input type="file" accept='image/*' id={`images${key}`} onChange={e => setImages({ ...images, [key]: e.target.files[0] })} hidden />
                        </label>
                    ))}
                </div>

                <label htmlFor="" className="flex flex-col gap-2 my-6 ">
                    Name
                    <input type="text" name="name" onChange={onChangeHandler} value={productInfo.name} placeholder="Enter product name" className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded" required />
                </label>

                <label htmlFor="" className="flex flex-col gap-2 my-6 ">
                    Description
                    <textarea name="description" onChange={onChangeHandler} value={productInfo.description} placeholder="Enter product description" rows={5} className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded resize-none" required />
                </label>

                <div className="flex gap-5">
                    <label htmlFor="" className="flex flex-col gap-2 ">
                        Actual Price ($)
                        <input type="number" name="mrp" onChange={onChangeHandler} value={productInfo.mrp} placeholder="0" rows={5} className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded resize-none" required />
                    </label>
                    <label htmlFor="" className="flex flex-col gap-2 ">
                        Offer Price ($)
                        <input type="number" name="price" onChange={onChangeHandler} value={productInfo.price} placeholder="0" rows={5} className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded resize-none" required />
                    </label>
                </div>
                <div>
                    <label htmlFor="" className="flex flex-col gap-2 mt-2 ">
                        Stock Quantity
                        <input type="number" name="stock" onChange={onChangeHandler} value={productInfo.stock} placeholder="0" min="0" className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded" required />
                    </label>
                </div>

                <select onChange={e => setProductInfo({ ...productInfo, category: e.target.value })} value={productInfo.category} className="w-full max-w-sm p-2 px-4 my-6 outline-none border border-slate-200 rounded" required>
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>

                <br />

                <button disabled={loading} className="bg-slate-800 text-white px-6 mt-7 py-2 hover:bg-slate-900 rounded transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? "Adding Product..." : "Add Product"}
                </button>
            </form>

            {/* Right Side - Tips and Preview */}
            <div className="w-80 space-y-6">
                {/* Tips Section */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <InfoIcon className="text-blue-600" size={20} />
                        <h3 className="font-semibold text-slate-800">Quick Tips</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-600">
                        <li className="flex gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span>Use high-quality images for better visibility</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span>Write detailed descriptions to attract customers</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span>Set competitive prices to increase sales</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span>Keep stock updated to avoid overselling</span>
                        </li>
                    </ul>
                </div>

                {/* Product Preview */}
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Product Preview</h3>
                    {productInfo.name || images[1] ? (
                        <div className="space-y-3">
                            {images[1] && (
                                <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-center">
                                    <Image src={URL.createObjectURL(images[1])} width={150} height={150} alt="Preview" className="rounded max-h-32 w-auto" />
                                </div>
                            )}
                            {productInfo.name && (
                                <p className="font-medium text-slate-800">{productInfo.name}</p>
                            )}
                            {productInfo.price > 0 && (
                                <p className="text-lg font-bold text-slate-700">${productInfo.price}</p>
                            )}
                            {productInfo.category && (
                                <span className="inline-block text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-600">{productInfo.category}</span>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 text-center py-8">Fill in product details to see preview</p>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                        <TrendingUpIcon className="text-green-600" size={24} />
                        <div>
                            <p className="text-xs text-slate-500">Potential Reach</p>
                            <p className="font-semibold text-slate-800">1000+ customers</p>
                        </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center gap-3">
                        <PackageIcon className="text-purple-600" size={24} />
                        <div>
                            <p className="text-xs text-slate-500">Your Total Products</p>
                            <p className="font-semibold text-slate-800">24 items</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}