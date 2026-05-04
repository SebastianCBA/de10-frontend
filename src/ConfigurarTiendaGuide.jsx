import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function ConfigurarTuTienda() {
  return (
    <>
      <Helmet>
        <title>Cómo configurar tu tienda en de10.app | Guía paso a paso</title>
        <meta
          name="description"
          content="Aprendé cómo configurar tu tienda en de10.app paso a paso: completar datos generales, personalizar la portada, agregar redes sociales y subir tu logo."
        />
      </Helmet>

      <div className="container py-5" style={{ maxWidth: "960px" }}>
        <h1 className="mb-4">Cómo configurar tu tienda en de10.app</h1>

        <p className="mb-3">
          Una vez que creaste tu cuenta y activaste tu tienda, el siguiente paso
          es completar la información principal de tu negocio.
        </p>

        <p className="mb-4">
          En esta guía te mostramos cómo cargar los datos generales, cómo
          personalizar la portada de tu tienda y cómo agregar tus redes sociales
          y tu logo para que tu negocio se vea más profesional.
        </p>

        <div className="p-4 rounded-4 bg-light border mb-5">
          <h2 className="h5 mb-3">Contenido de esta guía</h2>
          <ul className="mb-0">
            <li>Completar los datos generales de tu tienda</li>
            <li>Configurar el título y subtítulo de bienvenida</li>
            <li>Agregar redes sociales</li>
            <li>Subir el logo de tu negocio</li>
            <li>Guardar los cambios</li>
          </ul>
        </div>

        <section className="mb-5">
          <h2 className="mb-3">1. Completá los datos generales de tu tienda</h2>
          <p>
            En la primera parte vas a poder ingresar la información básica de tu
            negocio, como el <strong>nombre</strong>, la <strong>dirección</strong>,
            el <strong>teléfono</strong> y el <strong>email</strong>.
          </p>
          <p>
            Estos datos ayudan a que tus clientes te identifiquen y puedan
            contactarte fácilmente cuando visitan tu tienda online.
          </p>
          <p>
            También vas a ver la sección <strong>Presentación en la portada</strong>,
            donde podés escribir un <strong>título de bienvenida</strong> y un{" "}
            <strong>subtítulo</strong>. Ese contenido aparece en la portada de
            tu tienda y sirve para explicar rápidamente qué vendés o cómo
            trabajás.
          </p>

          <div className="text-center my-4">
            <img
              src="/images/guia/configurar-tienda-datos-generales.png"
              alt="Formulario de datos generales y presentación de la tienda en de10.app"
              className="img-fluid rounded-4 border shadow-sm"
            />
          </div>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">2. Agregá tus redes sociales y el logo</h2>
          <p>
            Más abajo vas a encontrar la sección <strong>Redes sociales</strong>,
            donde podés cargar el enlace de tu <strong>Instagram</strong> y tu{" "}
            <strong>Facebook</strong>.
          </p>
          <p>
            Esto es útil para dar más confianza, mostrar que tu negocio tiene
            presencia online y facilitar que tus clientes también te sigan por
            otros canales.
          </p>
          <p>
            En la sección <strong>Identidad</strong> podés subir el{" "}
            <strong>logo</strong> de tu tienda. Aunque es opcional, tener un
            logo hace que tu negocio se vea mucho más prolijo y profesional.
          </p>
          <p>
            Una vez que completás todo, solo tenés que hacer click en{" "}
            <strong>Guardar cambios de la tienda</strong> para que la
            información se actualice.
          </p>

          <div className="text-center my-4">
            <img
              src="/images/guia/configurar-tienda-redes-logo.png"
              alt="Sección de redes sociales y logo de la tienda en de10.app"
              className="img-fluid rounded-4 border shadow-sm"
            />
          </div>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">3. Qué conviene escribir en la portada</h2>
          <p>
            En el <strong>título de bienvenida</strong> conviene poner una frase
            simple y clara. Por ejemplo:
          </p>

          <p className="fw-semibold mb-3">
            Comprá fácil y rápido por WhatsApp
          </p>

          <p>
            En el <strong>subtítulo</strong>, podés explicar brevemente cómo
            funciona tu tienda. Por ejemplo:
          </p>

          <p className="fw-semibold">
            Elegí tus productos, enviá el pedido y coordinamos la entrega
            directamente por WhatsApp. Sin vueltas, simple y rápido.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">Por qué conviene completar bien tu tienda</h2>
          <p>
            Una tienda con nombre claro, datos correctos, portada bien escrita
            y redes sociales cargadas transmite más confianza.
          </p>
          <p>
            Eso ayuda a que tus clientes entiendan mejor qué ofrecés y se sientan
            más cómodos al momento de hacer un pedido.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">Qué datos conviene revisar antes de compartirla</h2>
          <ul>
            <li>Nombre del negocio</li>
            <li>Dirección y teléfono correctos</li>
            <li>Título y subtítulo claros</li>
            <li>Redes sociales actualizadas</li>
            <li>Logo o imagen de marca</li>
          </ul>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">Seguí aprendiendo</h2>
          <ul>
            <li>
              <Link to="/agregar-productos">
                Cómo agregar productos
              </Link>
            </li>
            <li>
              <Link to="/mis-sucursales-guia">
                Cómo usar sucursales
              </Link>
            </li>
            <li>
              <Link to="/compartir-catalogo-whatsapp">
                Cómo compartir tu tienda
              </Link>
            </li>
          </ul>
        </section>

        <section className="p-4 rounded-4 bg-light border mb-4">
          <h2 className="h5 mb-3">Resumen rápido</h2>
          <ol className="mb-0">
            <li>Completás nombre, dirección, teléfono y email</li>
            <li>Escribís el título y subtítulo de bienvenida</li>
            <li>Agregás Instagram y Facebook si tenés</li>
            <li>Subís tu logo</li>
            <li>Guardás los cambios</li>
            <li>Tu tienda queda más completa y profesional</li>
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