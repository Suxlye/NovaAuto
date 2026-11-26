import { lazy, Suspense } from 'react';

import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';

import useRoute from './hooks/useRoute';
import { StoreProvider } from './context/StoreContext';
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderPage = lazy(() => import('./pages/OrderPage'));
const Products = lazy(() => import('./components/Products'));
const CartPage = lazy(() => import('./pages/CartPage'));
const Services = lazy(() => import('./components/Services'));
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));
const CreditsPage = lazy(() => import('./pages/CreditsPage'));
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
        <Suspense
          fallback={
            <p className="section container" role="status">
              Cargando...
            </p>
          }
        >
          {route.page === 'inicio' && <HomePage />}
          {route.page === 'catalogo' && (
            <Products
              category={route.category}
              onCategoryChange={setCategory}
            />
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
        </Suspense>
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
