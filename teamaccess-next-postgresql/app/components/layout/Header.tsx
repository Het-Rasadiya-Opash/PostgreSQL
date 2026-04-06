'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

const Header = () => {

    const pathname = usePathname();
    const { user, logout } = useAuth();
    
    // const navigation = [{
    //     name: 'Home',
    //     href: '/',
    //     show: true
    // }, { name: 'Dashboard', href: '/dashboard', show: !!user }].filter(item => item.show);

    //     let isActive = false;
    //     if (href === '/') {
    //         isActive = pathname === '/';
    //     } else {
    //         isActive = pathname.startsWith(href);
    //     }
    //     return `px-5 py-2 rounded text-sm font-medium transition-colors shadow-sm ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white bg-transparent'}`;
    // };

    return (
        <header className="w-full border-b border-slate-800 bg-[#0a0f1c] h-16 flex items-center">
            <div className="w-full px-6 flex items-center justify-between">

                {/* Logo - Left aligned */}
                <div className="flex-1 flex justify-start">
                    <Link href="/" className="text-xl font-bold text-white tracking-wide">
                        TeamAccess
                    </Link>
                </div>

                {/* Center Navigation */}
                {/* <nav className="flex-1 flex justify-center space-x-6">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={getNavItemClass(item.href)}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav> */}

                {/* Right Auth Links */}
                <div className="flex-1 flex justify-end items-center gap-6">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
                                    {user.name.charAt(0)}
                                </div>
                                <span className="text-slate-300 text-sm font-medium hidden sm:block">{user.name}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="text-slate-400 hover:text-white px-3 py-1.5 rounded text-sm font-medium transition-colors border border-slate-700 hover:bg-slate-800"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-slate-300 hover:text-white text-sm transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-sm font-medium transition-colors shadow-sm"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>

            </div>
        </header>
    );
};

export default Header;
