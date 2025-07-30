import { useTheme } from '../../contexts/ThemeContext';

const StatsCards = () => {
  const { theme } = useTheme();
  
  const stats = [
    { title: 'Facturas Emitidas', value: '1,234', icon: '📄', color: theme.colors.stats[0] },
    { title: 'Ingresos del Mes', value: 'S/ 45,678', icon: '💰', color: theme.colors.stats[1] },
    { title: 'Clientes Activos', value: '89', icon: '👥', color: theme.colors.stats[2] },
    { title: 'Productos', value: '156', icon: '📦', color: theme.colors.stats[3] },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className={`bg-${theme.card} rounded-lg shadow p-4 hover:shadow-lg transition-shadow`}>
          <div className="flex items-center">
            <div className={`${stat.color} rounded-lg p-3 text-white text-2xl mr-4`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;