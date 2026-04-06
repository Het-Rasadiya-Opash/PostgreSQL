import React from 'react'
import Header from '../components/layout/Header'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen flex flex-col bg-[#0a0f1c]">
            <Header/>
            <main className="flex-1 container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    )
}

export default MainLayout
