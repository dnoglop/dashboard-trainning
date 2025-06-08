// src/App.tsx

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";
import FuncionariosView from "./views/FuncionariosView";
import TreinamentosView from "./views/TreinamentosView";
import PerformanceView from "./views/PerformanceView";
import ParticipacaoView from "./views/ParticipacaoView";
import {
  UsersIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

const App: React.FC = () => {
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
      isActive
        ? "bg-blue-100 text-blue-600"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-blue-600">HR Analytics</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <NavLink to="/funcionarios" className={navLinkClasses}>
              <UsersIcon className="h-5 w-5 mr-3" /> Funcionários
            </NavLink>
            <NavLink to="/treinamentos" className={navLinkClasses}>
              <AcademicCapIcon className="h-5 w-5 mr-3" /> Treinamentos
            </NavLink>
            <NavLink to="/participacoes" className={navLinkClasses}>
              <ClipboardDocumentCheckIcon className="h-5 w-5 mr-3" />{" "}
              Participações
            </NavLink>
            <NavLink to="/performance" className={navLinkClasses}>
              <ChartBarIcon className="h-5 w-5 mr-3" /> Performance
            </NavLink>
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8">
            <Routes>
              <Route
                path="/"
                element={<Navigate to="/funcionarios" replace />}
              />
              <Route path="/funcionarios" element={<FuncionariosView />} />
              <Route path="/treinamentos" element={<TreinamentosView />} />
              <Route path="/performance" element={<PerformanceView />} />
              <Route path="/participacoes" element={<ParticipacaoView />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;
