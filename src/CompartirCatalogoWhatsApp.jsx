import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function CompartirCatalogoWhatsApp() {
  return (
    <>
      <Helmet>
        <title>Cómo compartir tu tienda por WhatsApp | de10.app</title>
        <meta
          name="description"
          content="Aprendé cómo compartir tu tienda online por WhatsApp y empezar a recibir pedidos rápidamente enviando tu link a clientes."
        />
      </Helmet>

      <div className="container py-5" style={{ maxWidth: "900px" }}>
        <h1 className="mb-4">Cómo compartir tu tienda y empezar a vender</h1>

        <p className="mb-3">
          Una vez que tenés tu tienda lista, el siguiente paso es compartirla
          para que tus clientes puedan verla y hacer pedidos.
        </p>

        <p className="mb-4">
          Tu tienda funciona con un <strong>link único</strong> que podés enviar
          por WhatsApp, redes sociales o cualquier otro medio.
        </p>

        <section className="mb-5">
          <h2 className="mb-3">1. Compartí tu link por WhatsApp</h2>
          <p>
            Podés enviar tu tienda directamente por WhatsApp a tus clientes,
            contactos o grupos.
          </p>
          <p>
            De esta forma, las personas pueden entrar, ver tus productos y
            hacerte un pedido sin necesidad de preguntarte todo por mensaje.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">2. Usalo en redes sociales</h2>
          <p>
            También podés poner el link de tu tienda en tu perfil de Instagram,
            Facebook u otras redes.
          </p>
          <p>
            Así cualquier persona que vea tu perfil puede acceder directamente a
            tus productos.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">3. Enviarlo a clientes actuales</h2>
          <p>
            Si ya tenés clientes, podés mandarles el link para que vuelvan a
            comprarte de forma más simple.
          </p>
          <p>
            Esto es ideal para generar ventas repetidas sin tener que explicar
            todo de nuevo cada vez.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">4. Dejá que tu tienda trabaje por vos</h2>
          <p>
            Una vez que compartís el link, tu tienda muestra tus productos por
            vos y organiza los pedidos automáticamente.
          </p>
          <p>Vos solo tenés que responder por WhatsApp y cerrar la venta.</p>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">5. Empezá a recibir pedidos</h2>
          <p>
            Cuantas más personas vean tu tienda, más posibilidades tenés de
            recibir pedidos.
          </p>
          <p>Compartir tu link es el paso clave para empezar a vender.</p>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">Dónde conviene compartir el link de tu tienda</h2>
          <ul>
            <li>WhatsApp personal o comercial</li>
            <li>Estados de WhatsApp</li>
            <li>Instagram</li>
            <li>Facebook</li>
            <li>Grupos o contactos frecuentes</li>
          </ul>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">Por qué compartir tu tienda ayuda a vender más</h2>
          <p>
            Cuando compartís un link directo a tu catálogo, el cliente entra
            directamente a ver tus productos. Eso reduce preguntas repetidas y
            hace más fácil que la persona pase de mirar a comprar.
          </p>
          <p>
            En vez de explicar todo cada vez, tu tienda ya hace una parte del
            trabajo por vos.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">Seguí aprendiendo</h2>
          <ul>
            <li>
              <Link to="/crear-cuenta-vender-por-whatsapp">
                Cómo crear tu cuenta
              </Link>
            </li>
            <li>
              <Link to="/agregar-productos">
                Cómo agregar productos
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
            <li>Copiás el link de tu tienda</li>
            <li>Lo compartís por WhatsApp o redes</li>
            <li>Los clientes entran y ven tus productos</li>
            <li>Te envían pedidos por WhatsApp</li>
            <li>Respondés y cerrás la venta</li>
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