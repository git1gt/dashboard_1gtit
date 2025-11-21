import { MetricsGrid } from '@/components/MetricsGrid';
import { TeamSection } from '@/components/TeamSection';
import { useMetrics } from '@/hooks/useMetrics';

function App() {
  const { metrics } = useMetrics();
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50/30 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-gray-200/50 bg-white/10 backdrop-blur-sm sticky top-0 z-10 w-full">
        <div className="w-full px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.location.reload()} 
                className="border-0 focus:outline-none 
                active:outline-none hover:outline-none
                focus-visible:ring-2 focus-visible:ring-cyan-500
                transition-transform duration-200 hover:scale-105
                cursor-pointer bg-transparent"
              >
                <img 
                  src="/Лого 1GT IT.png" 
                  alt="1GT Logo" 
                  className="h-12 w-auto"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 py-8">
        {/* Title Section */}
          <h2 className="text-4xl font-bold text-[#081C2C] mb-8">
             Что мы сделали за {currentYear} год
          </h2>

        {/* Metrics Grid */}
        <MetricsGrid />

        <h3 className="text-xl font-semibold text-[#081C2C] mb-6">
        Кто внёс вклад в показатели
        </h3>

        {/* Team Section */}
        <TeamSection selectedMetrics={metrics} />

        {/* Footer Section */}
        <div className="pt-8 border-t border-gray-200/50 w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <button 
                onClick={() => window.location.reload()} 
                className="border-0 focus:outline-none 
                active:outline-none hover:outline-none
                focus-visible:ring-2 focus-visible:ring-cyan-500
                cursor-pointer bg-transparent"
              >
                <img 
                  src="/Лого 1GT IT.png" 
                  alt="1GT Logo" 
                  className="h-8 w-auto opacity-80"
                />
              </button>
              <div>
                <p className="font-semibold text-sm text-gray-500">© 1GT.IT {currentYear}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Отчет обновлен: {new Date().toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;