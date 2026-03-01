import React, { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="fixed top-0 inset-x-0 z-20 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <span className="text-2xl font-bold text-white">NaijaLang</span>
          <nav className="flex flex-wrap space-x-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `font-medium ${isActive ? 'text-white' : 'text-gray-200'} hover:text-white`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/translate"
              className={({ isActive }) =>
                `font-medium ${isActive ? 'text-white' : 'text-gray-200'} hover:text-white`
              }
            >
              Translate
            </NavLink>
            <NavLink
              to="/train"
              className={({ isActive }) =>
                `font-medium ${isActive ? 'text-white' : 'text-gray-200'} hover:text-white`
              }
            >
              Train
            </NavLink>
            <NavLink
              to="/docs"
              className={({ isActive }) =>
                `font-medium ${isActive ? 'text-white' : 'text-gray-200'} hover:text-white`
              }
            >
              Docs
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 pt-24 pb-6">
        {children}
      </main>
      <footer className="bg-white border-t">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} NaijaLang. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
