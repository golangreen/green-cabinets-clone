import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ShopProducts } from "@/components/ShopProducts";

const Shop = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 sm:pt-28 md:pt-32">
        <ShopProducts />
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
