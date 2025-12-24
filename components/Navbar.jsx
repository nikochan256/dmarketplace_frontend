'use client'
import { ChevronsLeftRightEllipsis, Search, ShoppingCart, Wallet, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const Navbar = () => {

    const router = useRouter();

    const [search, setSearch] = useState('')
    const [walletAddress, setWalletAddress] = useState('')
    const [isConnecting, setIsConnecting] = useState(false)
    const [isLogin, setIsLogin] = useState(false)
    const [error, setError] = useState('')
    const cartCount = useSelector(state => state.cart.total)

    // Listen for account changes
    useEffect(() => {
        if (typeof window.ethereum !== 'undefined') {
            // Listen for account changes
            window.ethereum.on('accountsChanged', handleAccountsChanged)
            
            // Cleanup listener on unmount
            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
            }
        }
    }, [])

    const registerUser = async (walletAddress) => {
        try {
            const response = await fetch("https://dmarketplacebackend.vercel.app/user/register", {
                method: "POST", 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ walletAddress })
            });
            localStorage.setItem("DmarketPlacewalletAddress" , walletAddress)
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
    
            const data = await response.json();
            console.log("this is the user id in navbar ",data.data.id)
            localStorage.setItem("dmarketplaceUserId" , data.data.id)
            console.log("user created", data.data);
            setIsLogin(true);
            return data;
        } catch (err) {
            console.error(err);
            setError(`Failed to register user: ${err.message}`);
            throw err;
        }
    };
    
    // Then use it in both places:

    
    const handleAccountsChanged = (accounts) => {
        console.log("account changed function worked")
        if (accounts.length === 0) {
            // User disconnected all accounts
            setWalletAddress('')
        } else {
            // User switched accounts
            try{
                console.log("data sending")
                const data = { walletAddress: accounts[0] } ; 
                fetch("https://dmarketplacebackend.vercel.app/user/register", {
                    method:"POST", 
                    headers:{
                        'Content-Type': 'application/json',
                    },
                    body:JSON.stringify(data)
                })
                .then(respons=>{
                    if(!respons.ok){
                        setError("http error" , respons.status)
                        throw new error("http error, ",respons.status)
                    }
                    return respons.json()
                })
                .then(data=>{
                    console.log("user created " , data.data)
                    setIsLogin(true)
                })
                .catch(err=>{
                    console.log(err)
                    setError("error found" , err)
                })


                setWalletAddress(accounts[0])

            }catch(err){
                setError('user not created.')
                throw err("user account not created")
            }
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        router.push(`/shop?search=${search}`)
    }

    const handleLoginClick = async () => {
        setIsConnecting(true)
        setError('')

        try {
            // Check if MetaMask is installed specifically
            if (typeof window.ethereum === 'undefined') {
                setError('MetaMask is not installed! Please install MetaMask browser extension.')
                setIsConnecting(false)
                // Open MetaMask installation page
                window.open('https://metamask.io/download/', '_blank')
                return
            }

            // Get the MetaMask provider specifically (not Phantom or other wallets)
            let provider = window.ethereum

            // If multiple wallets are installed, find MetaMask specifically
            if (window.ethereum.providers) {
                provider = window.ethereum.providers.find(p => p.isMetaMask)
                if (!provider) {
                    setError('MetaMask not found. Please make sure MetaMask is installed.')
                    setIsConnecting(false)
                    return
                }
            } else if (!window.ethereum.isMetaMask) {
                // If only one provider exists but it's not MetaMask
                setError('Please use MetaMask wallet. Other wallets are not supported.')
                setIsConnecting(false)
                return
            }

            // First disconnect any existing connection to force account selection
            try {
                await provider.request({
                    method: 'wallet_revokePermissions',
                    params: [{
                        eth_accounts: {}
                    }]
                })
            } catch (revokeErr) {
                console.log('Revoke not needed or failed:', revokeErr)
            }

            // Request account access from MetaMask specifically
            const accounts = await provider.request({ 
                method: 'eth_requestAccounts' 
            })

            if (accounts && accounts.length > 0) {
                // Store the wallet address
                await registerUser(accounts[0])

                setWalletAddress(accounts[0])
                console.log('Connected MetaMask wallet:', accounts[0])
            }
        } catch (err) {
            console.error('Error connecting to MetaMask:', err)
            if (err.code === 4001) {
                setError('You rejected the connection request. Please try again and approve in MetaMask.')
            } else if (err.code === -32002) {
                setError('Connection request already pending. Please check your MetaMask extension.')
            } else {
                setError('Failed to connect to MetaMask. Please try again.')
            }
        } finally {
            setIsConnecting(false)
        }
    }

    const handleDisconnect = () => {
        setWalletAddress('')
        console.log('Wallet disconnected')
    }

    const truncateAddress = (address) => {
        if (!address) return ''
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    }

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">

                    <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                        <span className="text-green-600">DM</span>arketplace<span className="text-green-600 text-5xl leading-0">.</span>
                        <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                            plus
                        </p>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
                        
                        <Link href="/" className="group relative py-1 pb-2">
                            <span>Home</span>
                            <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-green-500 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        
                        <Link href="/shop" className="group relative py-1 pb-2">
                            <span>Shop</span>
                            <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-green-500 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        
                        <Link href="/" className="group relative py-1 pb-2">
                            <span>About</span>
                            <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-green-500 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        
                        <Link href="/" className="group relative py-1 pb-2">
                            <span>Contact</span>
                            <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-green-500 transition-all duration-300 group-hover:w-full"></span>
                        </Link>

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600 py-1 pb-2">
                            <ShoppingCart size={18} />
                            Cart
                            <button className="absolute -top-[5px] left-3 text-[12px] text-white bg-slate-600 w-[14px] h-[14px] flex justify-center items-center rounded-full">+</button>
                        </Link>

                        {!walletAddress ? (
                            <button 
                                onClick={handleLoginClick}
                                disabled={isConnecting}
                                className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-400 transition text-white rounded-full flex items-center gap-2"
                            >
                                {isConnecting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Connecting...
                                    </>
                                ) : (
                                    'Login'
                                )}
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
                                    <Wallet size={16} />
                                    {truncateAddress(walletAddress)}
                                </div>
                                <button 
                                    onClick={handleDisconnect}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 transition text-white rounded-full text-sm"
                                >
                                    Disconnect
                                </button>
                            </div>
                        )}

                    </div>

                    {/* Mobile User Button */}
                    <div className="sm:hidden">
                        {!walletAddress ? (
                            <button 
                                onClick={handleLoginClick}
                                disabled={isConnecting}
                                className="px-7 py-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-400 text-sm transition text-white rounded-full"
                            >
                                {isConnecting ? 'Connecting...' : 'Login'}
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                                    <Wallet size={14} />
                                    {truncateAddress(walletAddress)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <hr className="border-gray-300" />
            
            {error && (
                <div className="fixed top-4 right-4 z-50 max-w-md">
                    <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-start gap-3">
                        <div className="flex-1">
                            <p className="font-medium mb-1">Connection Error</p>
                            <p className="text-sm opacity-90">{error}</p>
                        </div>
                        <button 
                            onClick={() => setError('')}
                            className="text-white hover:text-gray-200"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}
        </nav>
    ) 
}

export default Navbar