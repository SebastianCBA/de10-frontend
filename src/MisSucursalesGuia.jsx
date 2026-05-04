import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function MisSucursalesGuia() {
  return (
    <>
      <Helmet>
        <title>Cómo usar sucursales en tu tienda | de10.app</title>
        <meta
          name="description"
          content="Aprendé cómo cargar sucursales en tu tienda para usar más de una dirección o más de un teléfono y organizar mejor la atención por WhatsApp."
        />
      </Helmet>

      <div className="container py-5" style={{ maxWidth: "900px" }}>
        <h1 className="mb-4">Cómo usar sucursales en tu tienda</h1>

        <p className="mb-3">
          Si tu negocio tiene <strong>más de una dirección</strong> o{" "}
          <strong>más de un teléfono</strong>, podés crear sucursales para
          organizar mejor la atención.
        </p>

        <p className="mb-4">
          De esta forma, cada cliente puede comunicarse con la{" "}
          <strong>sucursal correspondiente</strong>, sin mezclar consultas,
          pedidos o datos de contacto.
        </p>

        <section className="mb-5">
          <h2 className="mb-3">1. Creá una nueva sucursal</h2>
          <p>
            En esta sección podés agregar una sucursal nueva haciendo click en{" "}
            <strong>Nueva sucursal</strong>.
          </p>
          <p>
            Cada sucursal tiene su propia información para que puedas separar la
            atención según la ubicación o el teléfono de contacto.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">2. Completá nombre, dirección y teléfono</h2>
          <p>
            Para cada sucursal podés cargar un <strong>nombre</strong>, una{" "}
            <strong>dirección</strong> y un <strong>teléfono</strong>.
          </p>
          <p>
            Por ejemplo, podrías tener una sucursal en el centro y otra en otro
            barrio, cada una con su propio número de contacto.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">3. Editá o eliminá sucursales cuando lo necesites</h2>
          <p>
            Si cambia algún dato, también podés editar la sucursal o eliminarla
            cuando ya no la uses.
          </p>
          <p>
            Así mantenés siempre actualizada la información que ven tus
            clientes.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">4. Mejorá la atención de tus clientes</h2>
          <p>
            Usar sucursales te ayuda a que cada persona vea o use el dato de
            contacto correcto.
          </p>
          <p>
            Esto es especialmente útil cuando vendés en distintas zonas o cuando
            cada local tiene su propio teléfono.
          </p>

          <div className="text-center my-4">
            <img
              src="/images/guia/mis-sucursales.png"
              alt="Formulario para crear sucursales en la tienda"
              className="img-fluid rounded-4 border shadow-sm"
            />
          </div>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">Cuándo conviene usar sucursales</h2>
          <p>
            Esta función te conviene especialmente si atendés distintas zonas,
            si tenés más de un local o si querés separar teléfonos y direcciones
            para evitar confusiones.
          </p>
          <p>
            También ayuda cuando un negocio quiere mostrar diferentes puntos de
            atención dentro de una misma tienda online.
          </p>
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
              <Link to="/agregar-productos">
                Cómo agregar productos
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
            <li>Podés crear varias sucursales</li>
            <li>Cada una puede tener su propia dirección</li>
            <li>Cada una puede tener su propio teléfono</li>
            <li>Podés editar o eliminar sucursales</li>
            <li>Ayuda a que el cliente contacte la sucursal correcta</li>
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