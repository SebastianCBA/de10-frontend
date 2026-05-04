import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function AgregarProductos() {
  return (
    <>
      <Helmet>
        <title>Cómo agregar productos a tu tienda | de10.app</title>
        <meta
          name="description"
          content="Aprendé cómo crear productos en tu tienda: cargar nombre, precio, imágenes y variantes como talles o colores."
        />
      </Helmet>

      <div className="container py-5" style={{ maxWidth: "900px" }}>
        <h1 className="mb-4">Cómo agregar productos a tu tienda</h1>

        <p className="mb-3">
          Una vez que tenés tu tienda configurada, el siguiente paso es cargar
          tus productos para que tus clientes puedan verlos y comprarlos.
        </p>

        <p className="mb-4">
          Podés crear productos propios de forma simple, agregando nombre,
          precio, imágenes y opcionalmente variantes como talles o colores.
        </p>

        <section className="mb-5">
          <h2 className="mb-3">1. Crear un producto</h2>

          <p>
            Para empezar, hacé click en <strong>"Crear producto"</strong> y
            completá la información básica.
          </p>

          <p>
            Vas a poder seleccionar una <strong>categoría</strong>, escribir el{" "}
            <strong>nombre</strong>, el <strong>precio</strong> y una{" "}
            <strong>descripción</strong>.
          </p>

          <p>
            También podés indicar si el producto tiene stock, si querés mostrarlo
            en la portada y agregar imágenes.
          </p>

          <div className="text-center my-4">
            <img
              src="/images/guia/crear-producto.png"
              alt="Formulario para crear producto"
              className="img-fluid rounded-4 border shadow-sm"
            />
          </div>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">2. Agregar variantes (opcional)</h2>

          <p>
            Si tu producto tiene opciones como <strong>talles</strong>,{" "}
            <strong>colores</strong> o <strong>modelos</strong>, podés usar
            variantes.
          </p>

          <p>
            Cada variante puede tener su propio nombre, stock e incluso una
            imagen.
          </p>

          <p>
            También podés elegir si la variante usa el mismo precio del producto
            o definir un precio distinto.
          </p>

          <div className="text-center my-4">
            <img
              src="/images/guia/variantes-producto.png"
              alt="Configuración de variantes del producto"
              className="img-fluid rounded-4 border shadow-sm"
            />
          </div>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">3. Ejemplo práctico</h2>

          <p>
            Podés crear un producto como una <strong>remera básica</strong> y
            luego agregar variantes como:
          </p>

          <ul>
            <li>Negro - M</li>
            <li>Negro - L</li>
            <li>Blanco - M</li>
            <li>Blanco - L</li>
          </ul>

          <p>
            De esta forma, el cliente puede elegir exactamente lo que quiere
            antes de hacer el pedido.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">Cómo cargar productos de forma clara</h2>
          <p>
            Cuanto más claro sea el nombre del producto, la descripción, el precio
            y las imágenes, mejor va a ser la experiencia del cliente cuando entre
            a tu tienda.
          </p>
          <p>
            Un buen catálogo no solo muestra lo que vendés: también ayuda a que
            la persona encuentre rápido lo que necesita y te envíe un pedido más
            preciso.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">Qué conviene mostrar en cada producto</h2>
          <ul>
            <li>Nombre claro y fácil de entender</li>
            <li>Precio actualizado</li>
            <li>Descripción simple</li>
            <li>Imágenes prolijas</li>
            <li>Variantes cuando el producto las necesita</li>
          </ul>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">Seguí aprendiendo</h2>
          <ul>
            <li>
              <Link to="/configurar-tu-tienda">
                Cómo configurar tu tienda
              </Link>
            </li>
            <li>
              <Link to="/recibir-pedidos-whatsapp">
                Cómo recibir pedidos por WhatsApp
              </Link>
            </li>
            <li>
              <Link to="/compartir-catalogo-whatsapp">
                Cómo compartir tu tienda
              </Link>
            </li>
          </ul>
        </section>

        <section className="p-4 bg-light border rounded-4 mb-4">
          <h2 className="h5 mb-3">Resumen rápido</h2>
          <ol className="mb-0">
            <li>Creás un producto con nombre, precio y descripción</li>
            <li>Subís imágenes</li>
            <li>Indicás si hay stock</li>
            <li>Agregás variantes si lo necesitás</li>
            <li>Guardás el producto</li>
          </ol>
        </section>

        <div className="d-flex flex-wrap gap-3">
          <Link to="/registro" className="btn btn-primary btn-lg">
            Crear mi cuenta ahora
          </Link>
          <Link to="/guia-vender-por-whatsapp" className="btn btn-primary btn-lg">
            Volver a la guía completa
          </Link>
        </div>
      </div>
    </>
  );
}