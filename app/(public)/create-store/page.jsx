'use client'
import { assets } from "@/assets/assets"
import { useEffect, useState } from "react"
import Image from "next/image"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"
import { Store, Upload, FileText, CheckCircle2, X } from "lucide-react"

export default function CreateStore() {

    const [alreadySubmitted, setAlreadySubmitted] = useState(false)
    const [status, setStatus] = useState("")
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")
    const [printfulStores, setPrintfulStores] = useState([])
    const [printfulVerifying, setPrintfulVerifying] = useState(false)
    const [printfulVerified, setPrintfulVerified] = useState(false)
    const [showStoreModal, setShowStoreModal] = useState(false)
    const [btcRate, setBtcRate] = useState(null)
    const [btcLoading, setBtcLoading] = useState(true)
    const [addingToCart, setAddingToCart] = useState(false)

    const [storeInfo, setStoreInfo] = useState({
        name: "",
        walletAddress: "",
        description: "",
        email: "",
        contact: "",
        store_id: "",  
        api_key: "",
        address: "",
        image: "",
        kybDocument: ""
    })

    const onChangeHandler = (e) => {
        console.log('📝 Form field changed:', e.target.name, '=', e.target.value)
        setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value })
    }

    // Fetch BTC price from API
    const fetchBtcRate = async () => {
        try {
            setBtcLoading(true)
            console.log('💰 Fetching BTC exchange rate...')
            
            const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=USD')
            const data = await response.json()
            
            if (data && data.data && data.data.rates && data.data.rates.BTC) {
                const usdToBtc = parseFloat(data.data.rates.BTC)
                setBtcRate(usdToBtc)
                console.log('✅ BTC Rate fetched:', usdToBtc)
            } else {
                throw new Error('Invalid BTC rate response')
            }
        } catch (error) {
            console.error('❌ Error fetching BTC rate:', error)
            toast.error('Failed to fetch BTC exchange rate')
            // Fallback rate
            setBtcRate(0.000011)
        } finally {
            setBtcLoading(false)
        }
    }

    // Convert USD to BTC
    const convertToBtc = (usdAmount) => {
        if (!btcRate || btcLoading) return '...'
        const btcAmount = usdAmount * btcRate
        return btcAmount.toFixed(8) // 8 decimal places for BTC
    }

    // Format BTC with symbol
    const formatBtc = (usdAmount) => {
        return `₿${convertToBtc(usdAmount)}`
    }

    // Verify Printful API Key
    const verifyPrintfulApiKey = async (apiKey) => {
        if (!apiKey || apiKey.trim() === '') {
            toast.error('Please enter an API key')
            return
        }

        try {
            setPrintfulVerifying(true)
            console.log('🔍 Verifying Printful API Key...')

            // const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://dmarketplacebackend.vercel.app"
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://dmarketplacebackend.vercel.app"
            const response = await fetch(`${API_URL}/merchant/verify-printful-api`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    api_key: apiKey.trim()
                })
            })

            const data = await response.json()
            console.log('✅ Printful API Response:', data)

            if (!response.ok) {
                console.error('❌ Invalid API Key')
                toast.error(data.msg || 'Invalid Printful API Key')
                setPrintfulVerified(false)
                setPrintfulStores([])
                setShowStoreModal(false)
                return
            }

            if (data.result) {
                setPrintfulStores(data.result)
                
                if (data.result.length === 1) {
                    // Auto-select if only one store
                    setStoreInfo({ ...storeInfo, api_key: apiKey, store_id: data.result[0].id.toString() })
                    setPrintfulVerified(true)
                    setShowStoreModal(false)
                    toast.success(`Connected to ${data.result[0].name}`)
                    console.log('🎉 Auto-selected store:', data.result[0].name)
                } else {
                    // Show store selection modal
                    setShowStoreModal(true)
                    setPrintfulVerified(false)
                    toast.success(`Found ${data.result.length} stores. Please select one.`)
                    console.log('🏪 Multiple stores found:', data.result.length)
                }
            } else {
                toast.error('No stores found for this API key')
                setPrintfulVerified(false)
                setPrintfulStores([])
                setShowStoreModal(false)
            }
        } catch (err) {
            console.error('❌ Error verifying Printful API Key:', err)
            toast.error('Failed to verify API key. Please try again.')
            setPrintfulVerified(false)
            setPrintfulStores([])
            setShowStoreModal(false)
        } finally {
            setPrintfulVerifying(false)
        }
    }

    // Handle API Key input
    const handleApiKeyChange = (e) => {
        const apiKey = e.target.value
        setStoreInfo({ ...storeInfo, api_key: apiKey, store_id: '' })
        setPrintfulVerified(false)
        setShowStoreModal(false)
    }

    // Handle store selection from modal
    const handleStoreSelect = (store) => {
        setStoreInfo({ ...storeInfo, store_id: store.id.toString() })
        setPrintfulVerified(true)
        setShowStoreModal(false)
        toast.success(`Selected ${store.name}`)
        console.log('✅ Store selected:', store.name, 'ID:', store.id)
    }

    const fetchSellerStatus = async () => {
        console.log('🔍 Fetching seller status...')
        // Logic to check if the store is already submitted
        setTimeout(() => {
            console.log('✅ Seller status check complete')
            setLoading(false)
        }, 500) 
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        console.log('📤 Form submission started')
        console.log('📋 Store Info:', storeInfo)
        
        setAddingToCart(true)
        
        try {
            // Validation
            if (!storeInfo.image) {
                console.error('❌ No store logo uploaded')
                toast.error("Please upload a store logo")
                return
            }
            if (!storeInfo.kybDocument) {
                console.error('❌ No KYB document uploaded')
                toast.error("Please upload KYB document")
                return
            }
            if (!printfulVerified || !storeInfo.store_id) {
                console.error('❌ Printful API key not verified or store not selected')
                toast.error("Please verify your Printful API key and select a store")
                return
            }
        
            // File size validation (5MB)
            const maxSize = 5 * 1024 * 1024
            console.log('📏 Image size:', storeInfo.image.size, 'bytes')
            console.log('📏 Document size:', storeInfo.kybDocument.size, 'bytes')
            
            if (storeInfo.image.size > maxSize) {
                console.error('❌ Logo image too large:', storeInfo.image.size, 'bytes')
                toast.error("Logo image must be less than 5MB")
                return
            }
            if (storeInfo.kybDocument.size > maxSize) {
                console.error('❌ KYB document too large:', storeInfo.kybDocument.size, 'bytes')
                toast.error("KYB document must be less than 5MB")
                return
            }
        
            const formData = new FormData()
            formData.append("image", storeInfo.image)
            formData.append("kybDocument", storeInfo.kybDocument)
            formData.append("shopName", storeInfo.name)
            formData.append("walletAddress", storeInfo.walletAddress)
            formData.append("businessEmail", storeInfo.email)
            formData.append("description", storeInfo.description)
            formData.append("contact", storeInfo.contact)
            formData.append("address", storeInfo.address)
            formData.append("api_key", storeInfo.api_key)
            formData.append("store_id", storeInfo.store_id)

            console.log('📦 FormData prepared:', {
                shopName: storeInfo.name,
                walletAddress: storeInfo.walletAddress,
                businessEmail: storeInfo.email,
                storeId: storeInfo.store_id,
                hasImage: !!storeInfo.image,
                hasKybDocument: !!storeInfo.kybDocument
            })
        
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
            console.log('🌐 API URL:', `${API_URL}/merchant/create-store`)
        
            toast.loading("Submitting application...")
            
            const response = await fetch(`http://localhost:4000/merchant/create-store`, {
                method: "POST",
                body: formData
            })
        
            const data = await response.json()
            console.log('📥 Server response:', data)
        
            if (!response.ok) {
                console.error('❌ Server error:', data.msg || 'Unknown error')
                toast.dismiss()
                toast.error(data.msg || "Failed to submit application")
                return
            }
          
            
            // Success
            console.log('🎉 Application submitted successfully!')

            toast.dismiss()
            toast.success("Application submitted!")

            
            setAlreadySubmitted(true)
            setStatus("pending")
            setMessage(data.msg || "Your application has been submitted successfully!")
            
            const storeresponse = await fetch(`https://dmarketplacebackend.vercel.app/merchant/sync-store-products`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                  },                
                  body: JSON.stringify({
                    store_id: storeInfo.store_id,
                    api_key: storeInfo.api_key,
                }),
            
            })

            const storedata = await storeresponse.json()
            console.log('📥 Server response:', storedata)
            return data
        } catch (error) {
            console.error("❌ Submission error:", error)
            toast.dismiss()
            toast.error(error.message || "Error submitting application")
        } finally {
            setAddingToCart(false)
        }
    }

    useEffect(() => {
        console.log('🚀 Component mounted - CreateStore page')
        fetchSellerStatus()
        fetchBtcRate()
        
        // Refresh BTC rate every 60 seconds
        const interval = setInterval(() => {
            fetchBtcRate()
        }, 60000)
        
        return () => clearInterval(interval)
    }, [])

    return !loading ? (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
            {/* BTC Rate Display */}
            {btcLoading ? (
                <div className="fixed top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md border border-slate-200 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                    <span className="text-sm text-slate-600">Loading BTC rate...</span>
                </div>
            ) : (
                <div className="fixed top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md border border-slate-200">
                    <span className="text-sm text-slate-600">1 USD = </span>
                    <span className="text-sm font-bold text-orange-600">₿{btcRate?.toFixed(8)}</span>
                </div>
            )}

            {/* Store Selection Modal */}
            {showStoreModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-white">Select Your Store</h3>
                                <p className="text-indigo-100 text-sm mt-1">Choose which Printful store to connect</p>
                            </div>
                            <button 
                                onClick={() => setShowStoreModal(false)}
                                className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                            <div className="space-y-3">
                                {printfulStores.map((store) => (
                                    <button
                                        key={store.id}
                                        type="button"
                                        onClick={() => handleStoreSelect(store)}
                                        className="w-full text-left px-5 py-4 rounded-xl border-2 transition-all hover:shadow-lg group hover:border-indigo-400 border-slate-200 bg-white hover:bg-indigo-50"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-800 text-lg group-hover:text-indigo-700 transition-colors">
                                                    {store.name}
                                                </p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
                                                        ID: {store.id}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                                                    <CheckCircle2 className="w-6 h-6 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
                            <p className="text-sm text-slate-600 text-center">
                                Select the store you want to use for this GoCart merchant account
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {!alreadySubmitted ? (
                <div className="max-w-3xl w-full mx-auto space-y-8">
                    
                    {/* Header */}
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                            Add Your <span className="text-indigo-600">Store</span>
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg">
                            Complete the form below to launch your business on GoCart.
                        </p>
                    </div>

                    {/* Printful API Key Section */}
                    <div className="bg-white py-6 px-8 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    🖨️ Printful Integration
                                    {printfulVerified && storeInfo.store_id && (
                                        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                                            Verified
                                        </span>
                                    )}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Enter your Printful API key to enable print-on-demand fulfillment
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <input 
                                    type="text"
                                    name="api_key"
                                    value={storeInfo.api_key}
                                    onChange={handleApiKeyChange}
                                    placeholder="Enter your Printful API key"
                                    className="flex-1 px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-slate-50/50 focus:bg-white font-mono text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => verifyPrintfulApiKey(storeInfo.api_key)}
                                    disabled={printfulVerifying || !storeInfo.api_key}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:scale-95 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {printfulVerifying ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Verifying...
                                        </>
                                    ) : (
                                        'Verify'
                                    )}
                                </button>
                            </div>

                            {printfulVerified && storeInfo.store_id && (
                                <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 px-4 py-3 rounded-lg border border-green-200">
                                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                                    <span>
                                        Connected to <strong>{printfulStores.find(s => s.id.toString() === storeInfo.store_id)?.name || 'Printful store'}</strong>
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Form Card */}
                    <div className="bg-white py-10 px-8 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100">
                        <form onSubmit={onSubmitHandler} className="flex flex-col gap-8">
                            
                            {/* Logo Upload Section */}
                            <div className="flex flex-col items-center sm:flex-row gap-8 pb-8 border-b border-slate-100">
                                <div className="relative w-32 h-32 rounded-full bg-slate-50 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden shrink-0">
                                    {storeInfo.image ? (
                                        <Image 
                                            src={URL.createObjectURL(storeInfo.image)} 
                                            alt="Preview" 
                                            fill 
                                            className="object-cover" 
                                        />
                                    ) : (
                                        <Store className="w-10 h-10 text-slate-300" />
                                    )}
                                </div>
                                <div className="flex flex-col gap-3 text-center sm:text-left">
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">Store Logo</h3>
                                        <p className="text-sm text-slate-500">Upload your brand logo. Recommended size: 400x400px.</p>
                                    </div>
                                    <label className="cursor-pointer inline-flex justify-center sm:justify-start items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition active:scale-95 w-fit mx-auto sm:mx-0">
                                        <Upload className="w-4 h-4" />
                                        Upload Image
                                        <input type="file" accept="image/*" onChange={(e) => {
                                            console.log('🖼️ Logo image selected:', e.target.files[0]?.name)
                                            setStoreInfo({ ...storeInfo, image: e.target.files[0] })
                                        }} hidden />
                                    </label>
                                </div>
                            </div>

                            {/* Inputs Section */}
                            <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Store Name <span className="text-red-500">*</span></label>
                                        <input 
                                            name="name" 
                                            required
                                            onChange={onChangeHandler} 
                                            value={storeInfo.name} 
                                            type="text" 
                                            placeholder="e.g. The Fashion Hub" 
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-slate-50/50 focus:bg-white" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Wallet Address <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <input 
                                                name="walletAddress"
                                                required 
                                                onChange={onChangeHandler} 
                                                value={storeInfo.walletAddress} 
                                                type="text" 
                                                placeholder="0x..." 
                                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-slate-50/50 focus:bg-white font-medium text-slate-600" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Description</label>
                                    <textarea 
                                        name="description" 
                                        onChange={onChangeHandler} 
                                        value={storeInfo.description} 
                                        rows={4} 
                                        placeholder="Tell us about your store..." 
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none bg-slate-50/50 focus:bg-white" 
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Business Email <span className="text-red-500">*</span></label>
                                        <input 
                                            name="email" 
                                            required
                                            onChange={onChangeHandler} 
                                            value={storeInfo.email} 
                                            type="email" 
                                            placeholder="contact@mystore.com" 
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-slate-50/50 focus:bg-white" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Contact Number <span className="text-red-500">*</span></label>
                                        <input 
                                            name="contact"
                                            required 
                                            onChange={onChangeHandler} 
                                            value={storeInfo.contact} 
                                            type="text" 
                                            placeholder="+1 (555) 000-0000" 
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-slate-50/50 focus:bg-white" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Business Address</label>
                                    <textarea 
                                        name="address" 
                                        onChange={onChangeHandler} 
                                        value={storeInfo.address} 
                                        rows={3} 
                                        placeholder="Full registered business address" 
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none bg-slate-50/50 focus:bg-white" 
                                    />
                                </div>
                            </div>

                            {/* KYB Section */}
                            <div className="pt-4 border-t border-slate-100">
                                <div className="mb-4">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        Business Verification (KYB) <span className="text-red-500">*</span>
                                    </label>
                                    <p className="text-sm text-slate-500 mt-1">Upload a valid business registration or tax document.</p>
                                </div>
                                
                                <label className={`flex flex-col items-center justify-center w-full px-4 py-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${storeInfo.kybDocument ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-300 bg-slate-50 hover:bg-white hover:border-indigo-400 text-slate-500'}`}>
                                    {storeInfo.kybDocument ? (
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-8 h-8" />
                                            <div className="text-left">
                                                <p className="text-base font-semibold">Document Selected</p>
                                                <p className="text-xs opacity-80 truncate max-w-[200px]">{storeInfo.kybDocument.name}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-center">
                                            <Upload className="w-8 h-8 mb-2 opacity-50" />
                                            <p className="text-base font-medium">Click to upload document</p>
                                            <p className="text-xs opacity-70">PDF, PNG, JPG (Max 5MB)</p>
                                        </div>
                                    )}
                                    <input type="file" required accept=".pdf,image/*" onChange={(e) => {
                                        console.log('📄 KYB document selected:', e.target.files[0]?.name)
                                        setStoreInfo({ ...storeInfo, kybDocument: e.target.files[0] })
                                    }} hidden />
                                </label>
                            </div>

                            <button 
                                type="submit"
                                disabled={addingToCart}
                                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-600 active:scale-[0.98] transition-all shadow-lg shadow-indigo-900/10 hover:shadow-indigo-600/20 mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {addingToCart ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    'Submit Application'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="max-w-lg mx-auto bg-white p-12 rounded-2xl shadow-xl text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto animate-bounce">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Submission Received!</h2>
                    <p className="text-lg text-slate-500 mb-8">{message}</p>
                    {status === "approved" && (
                        <div className="bg-slate-50 py-3 px-6 rounded-full inline-block">
                            <p className="text-slate-500 text-sm">Redirecting in <span className="font-bold text-slate-800">5 seconds...</span></p>
                        </div>
                    )}
                </div>
            )}
        </div>
    ) : (<Loading />)
}