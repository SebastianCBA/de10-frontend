import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function CrearCuentaVenderPorWhatsApp() {
  return (
    <>
      <Helmet>
        <title>Cómo crear tu cuenta en de10.app | Guía paso a paso</title>
        <meta
          name="description"
          content="Aprendé cómo crear tu cuenta en de10.app paso a paso: iniciar sesión, registrarte con Google o email, recuperar contraseña y activar tu tienda."
        />
        <link
          rel="canonical"
          href="https://de10.app/crear-cuenta-vender-por-whatsapp"
        />
      </Helmet>

      <div className="container py-5" style={{ maxWidth: "960px" }}>
        <h1 className="mb-4">Cómo crear tu cuenta en de10.app</h1>

        <p className="mb-3">
          Para empezar a vender por WhatsApp con de10.app, el primer paso es
          crear tu cuenta. Podés hacerlo de forma rápida con Google o
          registrándote con tu email y contraseña.
        </p>

        <p className="mb-4">
          En esta guía te mostramos paso a paso cómo entrar, registrarte,
          recuperar tu contraseña si la olvidaste y activar tu tienda con un
          nombre propio.
        </p>

        <div className="p-4 rounded-4 bg-light border mb-5">
          <h2 className="h5 mb-3">Contenido de esta guía</h2>
          <ul className="mb-0">
            <li>Ingresar si ya tenés cuenta</li>
            <li>Registrarte con Google</li>
            <li>Registrarte con email</li>
            <li>Recuperar tu contraseña</li>
            <li>Elegir el nombre de tu tienda</li>
          </ul>
        </div>

        <section className="mb-5">
          <h2 className="mb-3">1. Ingresar si ya tenés cuenta</h2>
          <p>
            Si ya creaste tu cuenta anteriormente, solo tenés que entrar a la
            pantalla de acceso, escribir tu email y contraseña, y presionar el
            botón <strong>Entrar</strong>.
          </p>
          <p>
            También podés iniciar sesión directamente con tu cuenta de Google,
            usando el botón correspondiente.
          </p>

          <div className="text-center my-4">
            <img
              src="/images/guia/registro-login.png"
              alt="Pantalla de inicio de sesión en de10.app"
              className="img-fluid rounded-4 border shadow-sm"
            />
          </div>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">2. Crear una cuenta nueva</h2>
          <p>
            Si todavía no tenés cuenta, desde la pantalla de login hacé click en{" "}
            <strong>¿No tenés cuenta? Registrate</strong>.
          </p>
          <p>Ahí vas a ver dos opciones para crear tu cuenta:</p>

          <ul>
            <li>
              <strong>Registrarte con Google</strong>, ideal si querés entrar
              más rápido.
            </li>
            <li>
              <strong>Registrarte con tu email</strong>, completando tus datos
              manualmente.
            </li>
          </ul>

          <div className="text-center my-4">
            <img
              src="/images/guia/registro-opciones.png"
              alt="Opciones para registrarse con Google o con email"
              className="img-fluid rounded-4 border shadow-sm"
            />
          </div>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">3. Registrarte con Google</h2>
          <p>
            Si elegís <strong>Registrarse con Google</strong>, solo tenés que
            seleccionar tu cuenta y confirmar el acceso. Es la forma más rápida
            de empezar, porque evita completar formularios manualmente.
          </p>
          <p>
            Una vez hecho esto, de10.app te va a llevar al siguiente paso para
            activar tu tienda.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">4. Registrarte con tu email</h2>
          <p>
            Si preferís usar email, hacé click en{" "}
            <strong>Registrarse con tu email</strong>. Se abrirá un formulario
            donde tenés que completar:
          </p>

          <ul>
            <li>Nombre</li>
            <li>Email</li>
            <li>Contraseña</li>
            <li>Confirmación de contraseña</li>
          </ul>

          <p>
            Después presionás <strong>Continuar</strong> y tu cuenta queda
            creada.
          </p>

          <div className="text-center my-4">
            <img
              src="/images/guia/registro-email.png"
              alt="Formulario de registro con email en de10.app"
              className="img-fluid rounded-4 border shadow-sm"
            />
          </div>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">5. Recuperar tu contraseña</h2>
          <p>
            Si ya tenés cuenta pero no recordás tu contraseña, desde la pantalla
            de login podés hacer click en{" "}
            <strong>¿Olvidaste tu contraseña?</strong>.
          </p>
          <p>
            Vas a ingresar tu email y de10.app te enviará un enlace para crear
            una contraseña nueva.
          </p>

          <div className="text-center my-4">
            <img
              src="/images/guia/recuperar-password.png"
              alt="Pantalla para recuperar la contraseña"
              className="img-fluid rounded-4 border shadow-sm"
            />
          </div>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">6. Elegir el nombre de tu tienda</h2>
          <p>
            Una vez que terminás de registrarte, el último paso antes de activar
            tu tienda es elegir un nombre único.
          </p>
          <p>
            Ese nombre será parte de la dirección web que vas a compartir con
            tus clientes. Por ejemplo:
          </p>

          <p className="fw-semibold">minombre.de10.app</p>

          <p>
            Cuando completás este paso y presionás{" "}
            <strong>Activar tienda</strong>, tu cuenta queda lista y tu tienda
            ya está creada.
          </p>

          <div className="text-center my-4">
            <img
              src="/images/guia/activar-tienda.png"
              alt="Pantalla para elegir el nombre de la tienda"
              className="img-fluid rounded-4 border shadow-sm"
            />
          </div>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">Qué pasa después de crear tu cuenta</h2>
          <p>
            Después de registrarte, el siguiente paso es completar la información
            de tu negocio, cargar productos y empezar a compartir tu tienda con
            clientes.
          </p>
          <p>
            En otras palabras: crear la cuenta es el comienzo. Después vas a poder
            personalizar tu tienda y usarla para vender por WhatsApp de una forma
            mucho más ordenada.
          </p>
        </section>

        <section className="mb-5">
          <h2 className="mb-3">Ventajas de crear tu tienda online</h2>
          <ul>
            <li>Tenés un link propio para compartir</li>
            <li>Mostrás tus productos o servicios de forma profesional</li>
            <li>Recibís pedidos más claros por WhatsApp</li>
            <li>Podés empezar sin conocimientos técnicos</li>
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

        <section className="p-4 rounded-4 bg-light border mb-4">
          <h2 className="h5 mb-3">Resumen rápido</h2>
          <ol className="mb-0">
            <li>Entrás o te registrás</li>
            <li>Elegís Google o email</li>
            <li>Completás los datos</li>
            <li>Recuperás contraseña si la olvidaste</li>
            <li>Elegís el nombre de tu tienda</li>
            <li>Tu cuenta queda activa</li>
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