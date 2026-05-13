import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import ScrollToTop from "./ScrollToTop";
import { AnimatePresence } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";


import Login from "./Login";
import Dashboard from "./Dashboard";
import Suscripcion from "./Suscripcion";
import Register from "./Register";
import Recuperar from "./Recuperar";
import ResetPassword from "./ResetPassword";
import MiTienda from "./MiTienda";
import MisCategorias from "./MisCategorias";
import MisSucursales from "./MisSucursales"
import Productos from "./Productos";
import PedidosWhatsapp from "./PedidosWhatsapp";
import Carrito from "./Carrito";
import Feedback from "./Feedback";
import Home from "./Home";
import CategoriaProductos from "./CategoriaProductos";
import BuscarProductos from "./BuscarProductos";
import Landing from "./Landing";
import Cooming from "./Cooming";
import OrdenarCategoriasRoot from "./OrdenarCategoriasRoot";
import VenderPorWhatsApp from "./VenderporWhatsapp";
import ConfigurarSubdominio from "./ConfigurarSubdominio";
import ProductosPropios from "./ProductosPropios"
import TiendaLayout from "./TiendaLayout";
import useSubdomain from "./hooks/useSubdomain";
import { useAuth } from "./AuthContext";
import { CartProvider } from "./context/CartContext";
import AnimatedPage from "./AnimatedPage";
import CatalogoDigital from "./CatalogoDigital";
import TiendaOnlineGratis from "./TiendaOnlineGratis";
import VenderPorInternetSinPaginaWeb from "./VenderPorInternetSinPaginaWeb";
import EmpezarAVenderOnline from "./EmpezarAVenderOnline";
import ComparativaHerramientasWhatsApp from "./ComparativaHerramientasWhatsApp";
import GuiaVenderPorWhatsApp from "./GuiaVenderPorWhatsApp";
import CrearCuentaVenderPorWhatsApp from "./CrearCuentaVenderPorWhatsApp";
import ConfigurarTuTienda from "./ConfigurarTiendaGuide";
import AgregarProductos from "./AgregarProductos";
import OrdenarCategorias from "./OrdenarCategorias";
import MisSucursalesGuia from "./MisSucursalesGuia";
import RecibirPedidosWhatsApp from "./RecibirPedidosWhatsApp";
import CompartirCatalogoWhatsApp from "./CompartirCatalogoWhatsApp";
import ProductoDetalle from "./ProductoDetalle";
import AnalyticsTracker from "./AnalyticsTracker";

function AppRoutes() {
  const { token } = useAuth();
  const subdomain = useSubdomain();
  const location = useLocation();

  if (
    subdomain !== "de10" &&
    subdomain !== "www" &&
    subdomain !== "localhost" &&
    subdomain !== "192" &&
    !token
  ) {
    return (
      <CartProvider>
        <Routes>
            <Route path="/" element={<TiendaLayout />}>
            <Route index element={<Home />} />
            <Route path="/categoria/:id/:slug" element={<CategoriaProductos />} />
            <Route path="/producto/:id/:slug" element={<ProductoDetalle />} />
            <Route path="/buscar" element={<BuscarProductos />} />
            <Route path="/carrito" element={<Carrito />} />
          </Route>
        </Routes>
      </CartProvider>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            token ? (
              <Navigate to="/dashboard" />
            ) : (
              <AnimatedPage><Landing /></AnimatedPage>
            )
          }
        />
        <Route path="/landing" element={<AnimatedPage><Landing /></AnimatedPage>} />
        <Route path="/vender-por-whatsapp" element={<AnimatedPage><VenderPorWhatsApp /></AnimatedPage>}/>
        <Route path="/catalogo-digital" element={<AnimatedPage><CatalogoDigital /></AnimatedPage>} />
        <Route path="/tienda-online-ahora" element={<AnimatedPage><TiendaOnlineGratis /></AnimatedPage>} />
        <Route path="/vender-por-internet-sin-pagina-web" element={<AnimatedPage><VenderPorInternetSinPaginaWeb /></AnimatedPage>}/>
        <Route path="/empezar-a-vender-online" element={<AnimatedPage><EmpezarAVenderOnline /></AnimatedPage>}/>
        <Route path="/configurar-tu-tienda" element={<AnimatedPage><ConfigurarTuTienda /></AnimatedPage>}/>
        <Route path="/ordenar-categorias" element={<AnimatedPage><OrdenarCategorias /></AnimatedPage>}/>
        <Route path="/mis-sucursales-guia" element={<AnimatedPage><MisSucursalesGuia /></AnimatedPage>}/>
        <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
        <Route path="/registro" element={<AnimatedPage><Register /></AnimatedPage>} />
        <Route path="/recuperar" element={<AnimatedPage><Recuperar /></AnimatedPage>} />
        <Route path="/herramientas-para-vender-por-whatsapp" element={<AnimatedPage><ComparativaHerramientasWhatsApp /></AnimatedPage>}/>
        <Route path="/guia-vender-por-whatsapp" element={<AnimatedPage><GuiaVenderPorWhatsApp /></AnimatedPage>}/>
        <Route path="/crear-cuenta-vender-por-whatsapp" element={<AnimatedPage><CrearCuentaVenderPorWhatsApp /></AnimatedPage>}/>  
        <Route path="/compartir-catalogo-whatsapp" element={<AnimatedPage><CompartirCatalogoWhatsApp /></AnimatedPage>}/>  
   
        <Route path="/recibir-pedidos-whatsapp" element={<AnimatedPage><RecibirPedidosWhatsApp /></AnimatedPage>}/>                
        <Route path="/reset-password/:token" element={<AnimatedPage><ResetPassword /></AnimatedPage>} />
        <Route path="/agregar-productos" element={<AnimatedPage><AgregarProductos /></AnimatedPage>} />
        <Route
          path="/configurar-subdominio"
          element={
            token ? (
              <AnimatedPage><ConfigurarSubdominio /></AnimatedPage>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            token ? (
              <AnimatedPage><Dashboard /></AnimatedPage>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/suscripcion"
          element={
            token ? (
              <AnimatedPage><Suscripcion /></AnimatedPage>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/suscripcion-exitosa" element={<AnimatedPage><Feedback tipo="success" /></AnimatedPage>} />
        <Route path="/suscripcion-fallida" element={<AnimatedPage><Feedback tipo="failure" /></AnimatedPage>} />
        <Route path="/suscripcion-pendiente" element={<AnimatedPage><Feedback tipo="pending" /></AnimatedPage>} />
        <Route path="/productos-propios" element={<ProductosPropios />} />

        <Route
          path="/mi-tienda"
          element={
            token ? (
              <AnimatedPage><MiTienda /></AnimatedPage>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/productos"
          element={
            token ? (
              <AnimatedPage><Productos /></AnimatedPage>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/categorias"
          element={
            token ? (
              <AnimatedPage><MisCategorias /></AnimatedPage>
            ) : (
              <Navigate to="/login" />
            )
          }
        />        
        <Route
          path="/sucursales"
          element={
            token ? (
              <AnimatedPage><MisSucursales /></AnimatedPage>
            ) : (
              <Navigate to="/login" />
            )
          }
        /> 
        <Route
          path="/pedidos-whatsapp"
          element={
            token ? (
              <AnimatedPage><PedidosWhatsapp /></AnimatedPage>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      <Route
        path="/orden/categorias"
        element={
          token ? (
            <AnimatedPage>
              <OrdenarCategoriasRoot />
            </AnimatedPage>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <AnalyticsTracker /> 
        <ScrollToTop />
        <AppRoutes />
      </Router>
    </HelmetProvider>
  );
}
