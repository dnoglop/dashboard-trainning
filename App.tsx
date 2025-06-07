
import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import FuncionariosView from './views/FuncionariosView';
import TreinamentosView from './views/TreinamentosView';
import PerformanceView from './views/PerformanceView';
import { HomeIcon, UsersIcon, AcademicCapIcon, ChartBarIcon, Bars3Icon, BuildingOffice2Icon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline'; // Added new icons for nav cards if needed
import { NavItem } from './types';

const navItems: NavItem[] = [
  { name: 'Início', path: '/', icon: (props) => <HomeIcon {...props} /> },
  { name: 'Funcionários', path: '/funcionarios', icon: (props) => <UsersIcon {...props} /> },
  { name: 'Treinamentos', path: '/treinamentos', icon: (props) => <AcademicCapIcon {...props} /> },
  { name: 'Performance', path: '/performance', icon: (props) => <ChartBarIcon {...props} /> },
];

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span className="text-white text-2xl font-bold">HR Dashboard</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150
                    ${location.pathname === item.path 
                      ? 'bg-indigo-700 text-white shadow-md' 
                      : 'text-blue-100 hover:bg-indigo-500 hover:text-white'
                    }`}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="bg-indigo-600 inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white"
            >
              <span className="sr-only">Abrir menu principal</span>
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium
                  ${location.pathname === item.path 
                    ? 'bg-indigo-700 text-white' 
                    : 'text-blue-100 hover:bg-indigo-500 hover:text-white'
                  }`}
              >
                <item.icon className="h-5 w-5 mr-2" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

const DashboardHome: React.FC = () => (
  <div className="p-8">
    <h1 className="text-4xl font-bold text-gray-800 mb-6">Bem-vindo ao HR Analytics Dashboard</h1>
    <p className="text-lg text-gray-600 mb-4">
      Utilize a navegação para explorar as seções de funcionários, treinamentos e performance.
      Os dados são agora carregados diretamente da sua Google Planilha.
      Certifique-se de que a variável de ambiente <code>GOOGLE_SHEETS_API_KEY</code> está configurada corretamente e que sua planilha está acessível (pública ou "qualquer pessoa com o link pode ver").
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {navItems.filter(item => item.path !== '/').map(item => (
        <Link key={item.path} to={item.path} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center">
          <item.icon className="h-12 w-12 text-indigo-600 mb-3" />
          <h2 className="text-xl font-semibold text-gray-700">{item.name}</h2>
          <p className="text-sm text-gray-500 mt-1">Acesse e analise dados de {item.name.toLowerCase()}.</p>
        </Link>
      ))}
    </div>
     <div className="mt-12 p-6 bg-blue-50 rounded-lg shadow">
        <h3 className="text-2xl font-semibold text-blue-700 mb-3">Sobre esta Aplicação</h3>
        <p className="text-gray-700">
            Este dashboard demonstra a integração da API Gemini e agora também a leitura de dados de Google Sheets.
            A API Key do Gemini (<code>process.env.API_KEY</code>) e a API Key do Google Sheets (<code>process.env.GOOGLE_SHEETS_API_KEY</code>) são gerenciadas através de variáveis de ambiente.
        </p>
    </div>
  </div>
);


const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/funcionarios" element={<FuncionariosView />} />
            <Route path="/treinamentos" element={<TreinamentosView />} />
            <Route path="/performance" element={<PerformanceView />} />
          </Routes>
        </main>
        <footer className="bg-gray-800 text-white text-center p-4 text-sm">
          © {new Date().getFullYear()} HR Analytics Dashboard. Powered by Gemini.
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
