import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function OrdenarCategorias() {
  return (
    <>
      <Helmet>
        <title>Cómo ordenar categorías y productos | de10.app</title>
        <meta
          name="description"
          content="Aprendé cómo organizar el orden de las categorías, subcategorías y productos de tu tienda usando arrastrar y soltar."
        />
      </Helmet>

      <div className="container py-5" style={{ maxWidth: "900px" }}>
        <h1 className="mb-4">
          Cómo ordenar categorías, subcategorías y productos
        </h1>

        <p className="mb-3">
          En la sección <strong>Mis categorías</strong> podés organizar tu tienda
          acomodando el orden de todo tu catálogo.
        </p>

        <p className="mb-4">
          Podés ordenar <strong>categorías</strong>,{" "}
          <strong>subcategorías</strong> y también{" "}
          <strong>productos</strong> de forma simple, arrastrando y soltando.
        </p>

        <section className="mb-5">
          <h2 className="mb-3">1. Ordená las categorías principales</h2>

          <p>
            Las categorías principales son las que agrupan tus productos, como
            por ejemplo <strong>Aceites</strong>, <strong>Leche</strong> o{" "}
            <strong>Lácteos</strong>.
          </p>

          <p>
            Podés moverlas hacia arriba o hacia abajo para definir el orden en
            que se muestran en tu tienda.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">
            2. Ordená las subcategorías dentro de cada categoría
          </h2>

          <p>
            Dentro de cada categoría también podés acomodar las subcategorías.
          </p>

          <p>
            Por ejemplo, dentro de <strong>Aceites</strong> podés tener distintas
            opciones y organizarlas según te convenga.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">
            3. Ordená los productos dentro de cada subcategoría
          </h2>

          <p>
            También podés cambiar el orden de los productos dentro de una
            subcategoría.
          </p>

          <p>
            Esto te permite destacar ciertos productos primero o acomodarlos
            según tu estrategia de venta.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">4. Arrastrá y soltá</h2>

          <p>
            Para mover cualquier elemento, solo tenés que usar el ícono de
            arrastre y soltarlo en la posición deseada.
          </p>

          <p>
            Es rápido, simple y no necesitás configurar nada más.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">5. El guardado es automático</h2>

          <p>
            Cada vez que cambiás el orden, el sistema guarda los cambios
            automáticamente.
          </p>

          <p>
            No necesitás hacer click en ningún botón para confirmar.
          </p>

          <div className="text-center my-4">
            <img
              src="/images/guia/ordenar-categorias.png"
              alt="Ordenar categorías y productos"
              className="img-fluid rounded-4 border shadow-sm"
            />
          </div>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">Por qué conviene ordenar bien tu catálogo</h2>

          <p>
            Un catálogo bien ordenado ayuda a que el cliente encuentre más rápido
            lo que busca. Cuando las categorías, subcategorías y productos están
            acomodados con lógica, navegar la tienda se vuelve mucho más simple.
          </p>

          <p>
            También te permite destacar primero lo que más te interesa vender o
            lo que querés que el cliente vea antes.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">Qué podés organizar desde esta sección</h2>

          <ul>
            <li>El orden de las categorías principales</li>
            <li>El orden de las subcategorías dentro de cada categoría</li>
            <li>El orden de los productos dentro de una subcategoría</li>
            <li>La forma en que se muestra tu catálogo al cliente</li>
          </ul>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">Seguí aprendiendo</h2>

          <ul>
            <li>
              <Link to="/agregar-productos">
                Cómo agregar productos a tu tienda
              </Link>
            </li>
            <li>
              <Link to="/mis-sucursales-guia">
                Cómo usar sucursales en tu tienda
              </Link>
            </li>
            <li>
              <Link to="/recibir-pedidos-whatsapp">
                Cómo recibir pedidos por WhatsApp
              </Link>
            </li>
          </ul>
        </section>

        <section className="p-4 bg-light border rounded-4 mb-4">
          <h2 className="h5 mb-3">Resumen rápido</h2>
          <ol className="mb-0">
            <li>Podés mover categorías</li>
            <li>Podés mover subcategorías</li>
            <li>Podés mover productos</li>
            <li>Todo se hace arrastrando</li>
            <li>Se guarda automáticamente</li>
          </ol>
        </section>

        <div className="d-flex flex-wrap gap-3">
          <Link to="/registro" className="btn btn-primary btn-lg">
            Crear mi cuenta ahora
          </Link>

          <Link
            to="/guia-vender-por-whatsapp"
            className="btn btn-primary btn-lg"
          >
            Volver a la guía completa
          </Link>
        </div>
      </div>
    </>
  );
}