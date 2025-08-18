import { Outlet } from 'react-router-dom';
import Header from '@/components/share/header/Header';
import Footer from '@/components/share/Footer';
import Breadcrumb from '@/components/share/Breadcrumb';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Breadcrumb />
      <main className="flex-grow">
        <Outlet /> 
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
