import React from 'react';
import { useCompany } from '../contexts/CompanyContext';
import CompanyRequiredModal from './CompanyRequiredModal';

interface ProtectedModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

const ProtectedModal = ({ children, isOpen, onClose, onOpenSettings }: ProtectedModalProps) => {
  const { hasCompanies, loading } = useCompany();

  // Si está cargando, no mostrar nada
  if (loading) {
    return null;
  }

  // Si no hay empresas, mostrar modal de empresa requerida
  if (isOpen && !hasCompanies) {
    return (
      <CompanyRequiredModal 
        isOpen={true}
        onClose={onClose}
        onOpenSettings={onOpenSettings}
      />
    );
  }

  // Si hay empresas, mostrar el modal normal
  return <>{children}</>;
};

export default ProtectedModal;