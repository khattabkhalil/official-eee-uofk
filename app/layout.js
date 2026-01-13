import './globals.css'
import { AppProvider } from '@/contexts/AppContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = {
    title: 'Official EEE UofK - University of Khartoum',
    description: 'Academic Management System for Electrical and Electronic Engineering Department - Semester 1',
    keywords: 'University of Khartoum, EEE, Electrical Engineering, Electronic Engineering, Academic Platform',
}

export default function RootLayout({ children }) {
    return (
        <html lang="ar" dir="rtl">
            <body>
                <AppProvider>
                    <Navbar />
                    <main style={{ minHeight: 'calc(100vh - 200px)' }}>
                        {children}
                    </main>
                    <Footer />
                </AppProvider>
            </body>
        </html>
    )
}
