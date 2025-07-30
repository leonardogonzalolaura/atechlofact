import Dashboard from '../../components/dashboard';
import { ThemeProvider } from '../../contexts/ThemeContext';

export default function DashboardPage() {
    return (
        <ThemeProvider>
            <Dashboard />
        </ThemeProvider>
    );
}