import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function VenderPorWhatsApp() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Cómo vender por WhatsApp sin página web?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Podés vender por WhatsApp sin página web usando un catálogo online. Cargás tus productos o servicios, compartís tu link y recibís pedidos directos por WhatsApp de forma ordenada.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué conviene más: catálogo online o PDF?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "El catálogo online suele ser mejor que el PDF porque permite actualizar precios y productos al instante, compartir un solo link y recibir pedidos más claros por WhatsApp.",
        },
      },
      {
        "@type": "Question",
        name: "¿Sirve para comercios y también para servicios?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí. Sirve para comercios, emprendedores y también para servicios como estética, peluquerías, profesionales, técnicos y otros rubros que quieran mostrar lo que ofrecen y recibir pedidos o consultas por WhatsApp.",
        },
      },
      {
        "@type": "Question",
        name: "¿Necesito conocimientos técnicos para empezar?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Podés crear tu catálogo, cargar productos o servicios y compartir tu tienda sin necesidad de programar.",
        },
      },
    ],
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Cómo vender por WhatsApp con un catálogo online",
    description:
      "Guía paso a paso para vender por WhatsApp usando un catálogo online, compartir un link y recibir pedidos directos.",
    totalTime: "PT10M",
    step: [
      {
        "@type": "HowToStep",
        name: "Crear tu catálogo",
        text: "Registrate y cargá tus productos o servicios con fotos, precio y descripción.",
      },
      {
        "@type": "HowToStep",
        name: "Compartir tu link",
        text: "Enviá el link de tu catálogo por WhatsApp, Instagram, Facebook o donde quieras.",
      },
      {
        "@type": "HowToStep",
        name: "Recibir pedidos",
        text: "Tus clientes eligen lo que necesitan y te mandan el pedido por WhatsApp de forma más clara y ordenada.",
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>
          Cómo vender por WhatsApp sin página web | Guía 2026 | de10.app
        </title>

        <meta
          name="description"
          content="Aprendé cómo vender por WhatsApp sin página web usando un catálogo online. Mostrá tus productos o servicios, compartí tu link y recibí pedidos directos sin comisiones."
        />

        <link rel="canonical" href="https://de10.app/vender-por-whatsapp" />

        <meta
          property="og:title"
          content="Cómo vender por WhatsApp sin página web | de10.app"
        />
        <meta
          property="og:description"
          content="Guía práctica para vender por WhatsApp con un catálogo online, carrito y pedidos directos. Ideal para comercios, emprendedores y servicios."
        />
        <meta
          property="og:url"
          content="https://de10.app/vender-por-whatsapp"
        />
        <meta property="og:type" content="article" />
        <meta
          property="og:image"
          content="https://de10.app/images/og-image.jpg"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Cómo vender por WhatsApp sin página web | de10.app"
        />
        <meta
          name="twitter:description"
          content="Descubrí cómo vender por WhatsApp con un catálogo online profesional y pedidos directos."
        />
        <meta
          name="twitter:image"
          content="https://de10.app/images/og-image.jpg"
        />

        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(howToSchema)}
        </script>
      </Helmet>

      <main className="py-5 bg-light">
        <div className="container">
          <div className="mx-auto" style={{ maxWidth: "920px" }}>
            <header className="text-center mb-5">
              <span className="badge text-bg-success mb-3">
                Guía práctica 2026
              </span>

              <h1 className="fw-bold mb-3">
                Cómo vender por WhatsApp sin página web
              </h1>

              <p className="lead text-muted mb-4">
                Si tenés un comercio, emprendimiento o brindás un servicio,
                podés vender por WhatsApp de forma más profesional usando un
                catálogo online. Compartís un solo link, mostrás lo que ofrecés
                y recibís pedidos directos sin complicarte con una tienda difícil
                de administrar.
              </p>

              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Link to="/registro" className="btn btn-primary btn-lg px-4">
                  Crear mi catálogo ahora
                </Link>

                <Link
                  to="/catalogo-digital"
                  className="btn btn-outline-secondary btn-lg px-4"
                >
                  Ver cómo funciona
                </Link>
              </div>

              <p className="mt-3 text-muted" style={{ fontSize: "0.95rem" }}>
                Gratis por 15 días · Sin tarjeta · Sin comisiones
              </p>
            </header>

            <section className="bg-white rounded-4 shadow-sm p-4 p-md-5 mb-4">
              <h2 className="h3 fw-bold mb-3">
                Por qué vender por WhatsApp hoy tiene sentido
              </h2>

              <p>
                WhatsApp ya es uno de los canales más usados para consultar,
                pedir precios y cerrar compras. El problema aparece cuando todo
                se maneja con fotos sueltas, mensajes desordenados, listas
                viejas o PDFs que quedan desactualizados.
              </p>

              <p className="mb-0">
                Con un catálogo online, en cambio, tus clientes pueden ver lo
                que vendés en un solo lugar, elegir productos o servicios y
                mandarte el pedido directo por WhatsApp de una forma mucho más
                clara.
              </p>
            </section>

            <section className="bg-white rounded-4 shadow-sm p-4 p-md-5 mb-4 border-start border-4 border-primary">
              <h2 className="h3 fw-bold mb-3">
                Catálogo online vs PDF: cuál conviene más
              </h2>

              <div className="row g-4 mt-1">
                <div className="col-md-4">
                  <div className="h-100 border rounded-4 p-4">
                    <h3 className="h5 fw-bold mb-2">Actualización inmediata</h3>
                    <p className="mb-0 text-muted">
                      Si cambia un precio o querés agregar un producto, lo
                      actualizás una sola vez. No hace falta reenviar un archivo
                      a cada cliente.
                    </p>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="h-100 border rounded-4 p-4">
                    <h3 className="h5 fw-bold mb-2">Más simple para compartir</h3>
                    <p className="mb-0 text-muted">
                      En vez de mandar imágenes o PDFs, compartís un solo link
                      que siempre muestra la versión actual de tu catálogo.
                    </p>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="h-100 border rounded-4 p-4">
                    <h3 className="h5 fw-bold mb-2">Pedidos más ordenados</h3>
                    <p className="mb-0 text-muted">
                      Tus clientes eligen lo que necesitan y te envían el pedido
                      listo por WhatsApp, evitando mensajes confusos o incompletos.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-4 shadow-sm p-4 p-md-5 mb-4">
              <h2 className="h3 fw-bold mb-4">Cómo funciona paso a paso</h2>

              <div className="row g-4">
                <div className="col-md-4">
                  <div className="border rounded-4 h-100 p-4">
                    <div className="fw-bold mb-2">1. Creás tu catálogo</div>
                    <p className="mb-0 text-muted">
                      Cargás tus productos o servicios con fotos, precio,
                      descripción y organización por categorías.
                    </p>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="border rounded-4 h-100 p-4">
                    <div className="fw-bold mb-2">2. Compartís tu link</div>
                    <p className="mb-0 text-muted">
                      Lo enviás por WhatsApp, Instagram, Facebook o donde quieras.
                      Tus clientes acceden desde el celular en segundos.
                    </p>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="border rounded-4 h-100 p-4">
                    <div className="fw-bold mb-2">3. Recibís pedidos</div>
                    <p className="mb-0 text-muted">
                      Tus clientes seleccionan lo que les interesa y te envían
                      el pedido por WhatsApp de forma más clara y profesional.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-4 shadow-sm p-4 p-md-5 mb-4">
              <h2 className="h3 fw-bold mb-3">Ideal para estos rubros</h2>

              <div className="row g-3">
                <div className="col-md-6">
                  <ul className="mb-0">
                    <li>Despensas y almacenes</li>
                    <li>Kioscos y dietéticas</li>
                    <li>Ferreterías y comercios en general</li>
                    <li>Venta por catálogo</li>
                  </ul>
                </div>

                <div className="col-md-6">
                  <ul className="mb-0">
                    <li>Peluquerías y estética</li>
                    <li>Servicios técnicos</li>
                    <li>Profesionales y estudios</li>
                    <li>Emprendedores</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-4 shadow-sm p-4 p-md-5 mb-4">
              <h2 className="h3 fw-bold mb-3">
                Ventajas de vender por WhatsApp con de10.app
              </h2>

              <ul className="mb-0">
                <li>Mostrás lo que vendés de forma más prolija</li>
                <li>Compartís un solo link, siempre actualizado</li>
                <li>Ahorrás tiempo en consultas repetidas</li>
                <li>Recibís pedidos más claros y ordenados</li>
                <li>No dependés de una web compleja</li>
                <li>Podés empezar en minutos</li>
                <li>No pagás comisiones por cada venta</li>
              </ul>
            </section>

            <section className="bg-white rounded-4 shadow-sm p-4 p-md-5 mb-4">
              <h2 className="h3 fw-bold mb-4">Preguntas frecuentes</h2>

              <div className="mb-4">
                <h3 className="h5 fw-bold mb-2">
                  ¿Cómo vender por WhatsApp sin página web?
                </h3>
                <p className="mb-0 text-muted">
                  Podés hacerlo con un catálogo online. Cargás tus productos o
                  servicios, compartís el link y recibís pedidos por WhatsApp de
                  forma ordenada.
                </p>
              </div>

              <div className="mb-4">
                <h3 className="h5 fw-bold mb-2">
                  ¿Qué conviene más: catálogo online o PDF?
                </h3>
                <p className="mb-0 text-muted">
                  El catálogo online suele ser mejor porque se actualiza al
                  instante, no obliga a reenviar archivos y facilita que el
                  cliente haga el pedido.
                </p>
              </div>

              <div className="mb-4">
                <h3 className="h5 fw-bold mb-2">
                  ¿Sirve solo para productos?
                </h3>
                <p className="mb-0 text-muted">
                  No. También sirve para servicios, profesionales y rubros donde
                  necesitás mostrar lo que ofrecés y recibir consultas o pedidos
                  por WhatsApp.
                </p>
              </div>

              <div>
                <h3 className="h5 fw-bold mb-2">
                  ¿Necesito saber programar para usarlo?
                </h3>
                <p className="mb-0 text-muted">
                  No. Está pensado para que cualquier persona pueda empezar sin
                  conocimientos técnicos.
                </p>
              </div>
            </section>

            <section className="bg-primary text-white rounded-4 shadow p-4 p-md-5 text-center">
              <h2 className="h3 fw-bold mb-3 text-white">
                Empezá a vender por WhatsApp hoy
              </h2>

              <p className="mb-4 opacity-90">
                Creá tu catálogo online, compartilo con tus clientes y recibí
                pedidos directos sin comisiones.
              </p>

              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Link to="/registro" className="btn btn-light btn-lg px-4 fw-bold">
                  Crear mi catálogo ahora
                </Link>

                <Link
                  to="/catalogo-digital"
                  className="btn btn-outline-light btn-lg px-4"
                >
                  Ver más información
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}