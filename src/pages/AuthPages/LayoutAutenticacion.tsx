import React from "react";
import GridShape from "../../components/common/FormaCuadricula";
import ThemeTogglerTwo from "../../components/common/AlternadorTemaDos";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full min-h-screen lg:flex-row dark:bg-gray-900 sm:p-0 pb-6">
        {children}
        <div className="items-center hidden w-full min-h-screen lg:w-1/2 bg-[#2B2F7D] lg:grid relative">
          <div className="relative flex items-center justify-center z-1">
            {/* ===== Common Grid Shape Start ===== */}
            <GridShape />
            <div className="flex flex-col items-center max-w-2xl text-white px-8">
              {/* Contenedor de Logos */}
              <div className="flex flex-col items-center gap-10 mb-8">
                {/* Logo Oh Sansi */}
                <div className="flex items-center justify-center">
                  <img
                    src="/images/LogoUmss/unnamed.png"
                    alt="Logo Oh Sansi"
                    className="w-80 h-auto object-contain"
                    onError={(e) => {
                      console.error("Error cargando imagen Oh Sansi desde: /images/LogoUmss/unnamed.png");
                      e.currentTarget.style.border = '2px solid red';
                    }}
                  />
                </div>
                
                {/* Logo UMSS */}
                <div className="flex items-center justify-center">
                  <img
                    src="/images/LogoUmss/logo-UMSS.png"
                    alt="Logo UMSS"
                    className="w-64 h-auto object-contain"
                    onError={(e) => {
                      console.error("Error cargando imagen UMSS desde: /images/LogoUmss/logo-UMSS.png");
                      e.currentTarget.style.border = '2px solid red';
                    }}
                  />
                </div>
              </div>

              <h1 className="text-3xl font-bold mb-4 text-center">
                {/* Título opcional */}
              </h1>
              
              <p className="text-center text-blue-200 leading-relaxed">
                {/* Descripción opcional */}
              </p>
            </div>
          </div>
          
          {/* Elementos decorativos */}
          <div className="absolute top-10 right-10 w-20 h-20 border-2 border-blue-400 rounded-full opacity-10"></div>
          <div className="absolute bottom-10 left-10 w-16 h-16 border-2 border-blue-400 rounded-full opacity-10"></div>
          <div className="absolute top-1/2 left-10 w-8 h-8 bg-blue-400 rounded-full opacity-20"></div>
          <div className="absolute bottom-1/3 right-20 w-6 h-6 bg-blue-400 rounded-full opacity-30"></div>
        </div>
        
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
