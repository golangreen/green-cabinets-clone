import { Helmet } from "react-helmet-async";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PerformanceDashboard from '@/components/performance/PerformanceDashboard';

const PerformanceMonitor = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Performance Monitor | Green Cabinets</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Header />
      <PerformanceDashboard />
      <Footer />
    </div>
  );
};

export default PerformanceMonitor;
