import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PerformanceDashboard from '@/components/performance/PerformanceDashboard';

const PerformanceMonitor = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <PerformanceDashboard />
      <Footer />
    </div>
  );
};

export default PerformanceMonitor;
