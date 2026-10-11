import CheckoutPage from './pages/CheckoutPage';
import OrderPage from './pages/OrderPage';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import Products from './components/Products';
import CartPage from './pages/CartPage';
import Services from './components/Services';
import About from './components/About';
import Contact from './components/Contact';
import CreditsPage from './pages/CreditsPage';
import useRoute from './hooks/useRoute';
import { StoreProvider } from './context/StoreContext';
function StoreApp() {
  const route = useRoute();
  const setCategory = (category) => {
    window.location.hash = `/catalogo${category ? `?categoria=${encodeURIComponent(category)}` : ''}`;
  };
  return (
    <>
      <a
        className="skip-link"
        href="#contenido"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('contenido')?.focus();
        }}
      >
        Saltar al contenido
      </a>
      <Header page={route.page} />
      <main id="contenido" tabIndex={-1} className="page-content">
        {route.page === 'inicio' && <HomePage />}
        {route.page === 'catalogo' && (
          <Products category={route.category} onCategoryChange={setCategory} />
        )}
        {route.page === 'carrito' && <CartPage />}
        {route.page === 'compra' && <CheckoutPage />}
        {route.page === 'pedido' && <OrderPage id={route.id} />}
        {route.page === 'servicios' && <Services />}
        {route.page === 'nosotros' && <About />}
        {route.page === 'contacto' && <Contact />}
        {route.page === 'creditos' && <CreditsPage />}
        {!route.exists && (
          <section className="section container">
            <p className="eyebrow">404</p>
            <h1>Página no encontrada</h1>
            <a className="button" href="#/inicio">
              Volver al inicio
            </a>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
export default function App() {
  return (
    <StoreProvider>
      <StoreApp />
    </StoreProvider>
  );
}
