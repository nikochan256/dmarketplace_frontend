// app/layout.js
import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import "./globals.css";
import LoadingScreen from "@/components/LoadingScreen";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
    title: "Dmarketplace multi vendo",
    description: "Dmarketplace s- Shop smarter",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${outfit.className} antialiased`}>
                {/* ⬅️ Wrap the inner content with LoadingScreen */}
                <LoadingScreen> 
                    <StoreProvider>
                        <Toaster />
                        {children}
                    </StoreProvider>
                </LoadingScreen>
            </body>
        </html>
    );
}