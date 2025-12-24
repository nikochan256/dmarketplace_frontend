'use client'
import { dummyStoreDashboardData } from "@/assets/assets"
import Loading from "@/components/Loading"
import { CircleDollarSignIcon, ShoppingBasketIcon, StarIcon, TagsIcon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export default function Dashboard() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        totalProducts: 0,
        totalEarnings: 0,
        totalOrders: 0,
        ratings: [],
    })

    const dashboardCardsData = [
        { title: 'Total Products', value: dashboardData.totalProducts, icon: ShoppingBasketIcon },
        { title: 'Total Earnings', value: currency + dashboardData.totalEarnings, icon: CircleDollarSignIcon },
        { title: 'Total Orders', value: dashboardData.totalOrders, icon: TagsIcon },
        { title: 'Total Ratings', value: dashboardData.ratings.length, icon: StarIcon },
    ]

    const sampleMonthlyEarnings = [
        { month: 'Jul', earnings: 3200, orders: 45 },
        { month: 'Aug', earnings: 4500, orders: 60 },
        { month: 'Sep', earnings: 5100, orders: 75 },
        { month: 'Oct', earnings: 4800, orders: 70 },
        { month: 'Nov', earnings: 6200, orders: 90 },
        { month: 'Dec', earnings: 7100, orders: 110 },
    ];

    const fetchDashboardData = async () => {
        setDashboardData(dummyStoreDashboardData)
        setLoading(false)
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    if (loading) return <Loading />

    return (
        <div className=" text-slate-500 mb-28">
            <h1 className="text-2xl">Seller <span className="text-slate-800 font-medium">Dashboard</span></h1>

            <div className="flex flex-wrap gap-5 my-10 mt-4">
                {
                    dashboardCardsData.map((card, index) => (
                        <div key={index} className="flex items-center gap-11 border border-slate-200 p-3 px-6 rounded-lg">
                            <div className="flex flex-col gap-3 text-xs">
                                <p>{card.title}</p>
                                <b className="text-2xl font-medium text-slate-700">{card.value}</b>
                            </div>
                            <card.icon size={50} className=" w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full" />
                        </div>
                    ))
                }
            </div>

            <h2>Total Reviews</h2>

            <div className="mt-10 p-6 bg-white rounded-xl shadow-md border border-slate-100 max-w-7xl">
                <h2 className="text-xl font-medium text-slate-800 mb-6">Earnings Trend (Last 6 Months)</h2>
                
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={sampleMonthlyEarnings}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="month" stroke="#64748b" />
                            <YAxis 
                                stroke="#64748b" 
                                tickFormatter={(value) => `${currency}${(value / 1000).toFixed(1)}k`} 
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#fff', 
                                    borderRadius: '8px', 
                                    border: '1px solid #e2e8f0',
                                    padding: '10px'
                                }} 
                                labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
                                formatter={(value, name) => [
                                    `${currency}${value.toLocaleString()}`, 
                                    name === 'earnings' ? 'Earnings' : 'Orders'
                                ]} 
                            />
                            <Legend 
                                iconType="circle" 
                                wrapperStyle={{ paddingTop: '10px' }} 
                            />
                            {/* Earnings Area */}
                            <Area 
                                type="monotone" 
                                dataKey="earnings" 
                                stroke="#4f46e5" // Indigo color for the line
                                fillOpacity={1} 
                                fill="url(#colorEarnings)" // Reference to the gradient fill
                                strokeWidth={2}
                            />
                            {/* Orders Line - Optional secondary line on top of the area */}
                             <Area 
                                type="monotone" 
                                dataKey="orders" 
                                stroke="#10b981" // Emerald color
                                fillOpacity={0} // Don't fill the orders area
                                strokeWidth={2}
                            />

                            {/* Define Gradient for Area Fill */}
                            <defs>
                                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.05}/>
                                </linearGradient>
                            </defs>
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}