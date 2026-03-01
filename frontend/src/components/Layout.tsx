import React, { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <span className="text-2xl font-bold text-white">NaijaLang</span>
          {/* desktop nav -- always visible on md+ */}
          <nav className="hidden md:flex space-x-6">
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
          {/* hamburger for small screens */}
          <button
            className="md:hidden text-white hover:text-gray-200"
            onClick={() => setMenuOpen(open => !open)}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
        {/* mobile menu toggled below header */}
        {menuOpen && (
          <nav className="md:hidden bg-white border-t">
            <div className="px-4 py-2 space-y-2">
              <NavLink
                to="/"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block font-medium ${
                    isActive ? 'text-blue-600' : 'text-gray-600'
                  } hover:text-blue-800`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/translate"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block font-medium ${
                    isActive ? 'text-blue-600' : 'text-gray-600'
                  } hover:text-blue-800`
                }
              >
                Translate
              </NavLink>
              <NavLink
                to="/train"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block font-medium ${
                    isActive ? 'text-blue-600' : 'text-gray-600'
                  } hover:text-blue-800`
                }
              >
                Train
              </NavLink>
              <NavLink
                to="/docs"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block font-medium ${
                    isActive ? 'text-blue-600' : 'text-gray-600'
                  } hover:text-blue-800`
                }
              >
                Docs
              </NavLink>
            </div>
          </nav>
        )}
      </header>
      <main className="flex-grow container mx-auto px-4 py-6">{children}</main>
      <footer className="bg-white border-t">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} NaijaLang. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
