'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';
import ThemeSettings from './ThemeSettings';
import Settings from './Settings';
import Profile from './Profile';
import Header from './dashboard/Header';
import StatsCards from './dashboard/StatsCards';
import QuickActions from './dashboard/QuickActions';
import RecentInvoices from './dashboard/RecentInvoices';
import Footer from './dashboard/Footer';
import CustomerRegistration from './CustomerRegistration';
import InvoiceCreation from './InvoiceCreationTabs';
import CreditNoteCreation from './CreditNoteCreationTabs';
import DebitNoteCreation from './DebitNoteCreationTabs';
import RemissionGuideCreation from './RemissionGuideCreationTabs';
import ProductRegistration from './ProductRegistration';
import CustomerList from './CustomerList';
import ProductList from './ProductList';
import ReportsDashboard from './ReportsDashboard';
import InvoicePreview from './InvoicePreview';

const Dashboard = () => {
    const [user, setUser] = useState('');
    const [isThemeSettingsOpen, setIsThemeSettingsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isCustomerRegistrationOpen, setIsCustomerRegistrationOpen] = useState(false);
    const [isInvoiceCreationOpen, setIsInvoiceCreationOpen] = useState(false);
    const [isCreditNoteOpen, setIsCreditNoteOpen] = useState(false);
    const [isDebitNoteOpen, setIsDebitNoteOpen] = useState(false);
    const [isRemissionGuideOpen, setIsRemissionGuideOpen] = useState(false);
    const [isProductRegistrationOpen, setIsProductRegistrationOpen] = useState(false);
    const [isCustomerListOpen, setIsCustomerListOpen] = useState(false);
    const [isProductListOpen, setIsProductListOpen] = useState(false);
    const [isReportsDashboardOpen, setIsReportsDashboardOpen] = useState(false);
    const [showInvoicePreview, setShowInvoicePreview] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const handlePreviewInvoice = (invoice: any) => {
        setSelectedInvoice(invoice);
        setShowInvoicePreview(true);
    };
    const { theme } = useTheme();
    const router = useRouter();

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.push('/');
            return;
        }
        
        const username = authService.getUserFromToken();
        if (username) {
            setUser(username);
        } else {
            router.push('/');
        }
    }, [router]);

    const handleLogout = () => {
        authService.logout();
        router.push('/');
    };

    return (
        <div className={`min-h-screen bg-${theme.background}`}>
            <Header 
                user={user}
                onProfileOpen={() => setIsProfileOpen(true)}
                onThemeSettingsOpen={() => setIsThemeSettingsOpen(true)}
                onSettingsOpen={() => setIsSettingsOpen(true)}
                onLogout={handleLogout}
            />

            <main className="max-w-7xl mx-auto py-4 sm:px-4 lg:px-6">
                <div className="mb-6 flex justify-end">
                    <button
                        onClick={() => setIsReportsDashboardOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>Ver Reportes</span>
                    </button>
                </div>
                <StatsCards />
                <QuickActions 
                    onCustomerClick={() => setIsCustomerRegistrationOpen(true)}
                    onInvoiceClick={() => setIsInvoiceCreationOpen(true)}
                    onCreditNoteClick={() => setIsCreditNoteOpen(true)}
                    onDebitNoteClick={() => setIsDebitNoteOpen(true)}
                    onRemissionGuideClick={() => setIsRemissionGuideOpen(true)}
                    onProductClick={() => setIsProductRegistrationOpen(true)}
                    onCustomerListClick={() => setIsCustomerListOpen(true)}
                    onProductListClick={() => setIsProductListOpen(true)}
                />
                <RecentInvoices onPreviewInvoice={handlePreviewInvoice} />
            </main>
            
            <Footer />
            
            <ThemeSettings 
                isOpen={isThemeSettingsOpen} 
                onClose={() => setIsThemeSettingsOpen(false)} 
            />
            <Settings 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
            />
            <Profile 
                isOpen={isProfileOpen} 
                onClose={() => setIsProfileOpen(false)} 
            />
            <CustomerRegistration 
                isOpen={isCustomerRegistrationOpen} 
                onClose={() => setIsCustomerRegistrationOpen(false)} 
            />
            <InvoiceCreation 
                isOpen={isInvoiceCreationOpen} 
                onClose={() => setIsInvoiceCreationOpen(false)} 
            />
            <CreditNoteCreation 
                isOpen={isCreditNoteOpen} 
                onClose={() => setIsCreditNoteOpen(false)} 
            />
            <DebitNoteCreation 
                isOpen={isDebitNoteOpen} 
                onClose={() => setIsDebitNoteOpen(false)} 
            />
            <RemissionGuideCreation 
                isOpen={isRemissionGuideOpen} 
                onClose={() => setIsRemissionGuideOpen(false)} 
            />
            <ProductRegistration 
                isOpen={isProductRegistrationOpen} 
                onClose={() => setIsProductRegistrationOpen(false)} 
            />
            <CustomerList 
                isOpen={isCustomerListOpen} 
                onClose={() => setIsCustomerListOpen(false)} 
            />
            <ProductList 
                isOpen={isProductListOpen} 
                onClose={() => setIsProductListOpen(false)} 
            />
            <ReportsDashboard 
                isOpen={isReportsDashboardOpen} 
                onClose={() => setIsReportsDashboardOpen(false)} 
            />
            <InvoicePreview 
                isOpen={showInvoicePreview}
                onClose={() => setShowInvoicePreview(false)}
                invoiceData={selectedInvoice}
            />
        </div>
    );
};

export default Dashboard;