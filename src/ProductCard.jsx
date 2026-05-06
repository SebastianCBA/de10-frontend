import React, { useMemo, useState } from "react";
import { FaSearch, FaShoppingCart } from "react-icons/fa";
import config from "./config";
import { useCart } from "./context/CartContext";
import ProductDetailsModal from "./ProductDetailsModal";
import { Link } from "react-router-dom";
import { formatPrice } from "./utils/formatPrice";

const ProductCard = ({ producto }) => {
  const { agregarAlCarrito } = useCart();
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  const productIdReal =
    producto?.product?.id ??
    producto?.product_id ??
    producto?.producto_id ??
    producto?.id;

  const mostrarMensajeAgregado = () => {
    const alerta = document.createElement("div");
    alerta.className = "alerta-carrito-modal";
    alerta.innerHTML = `
      <svg class="modal-check" viewBox="0 0 52 52">
        <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
        <path class="checkmark" fill="none" stroke="#fff" stroke-width="5" d="M14 27l7 7 16-16"/>
      </svg>
      <strong>¡Producto agregado al carrito!</strong><br>
      Podés revisar o modificar la cantidad desde la sección de compras.
    `;
    document.body.appendChild(alerta);
    setTimeout(() => alerta.remove(), 3000);
  };

  const toImgUrl = (v) => {
    if (!v) return null;
    const s = String(v).trim();
    if (!s) return null;
    if (/^https?:\/\//i.test(s) || s.startsWith("data:")) return s;
    return `${config.imageBaseUrl}/${s}`;
  };

  // Galería
  const galeria = useMemo(() => {
    const sources = [
      producto?.imagenes,
      producto?.imagenes_extras,
      producto?.images,
      producto?.fotos,
      producto?.galeria,
      producto?.gallery,
      producto?.extra_images,
      producto?.imagenesExtras,
    ].filter(Boolean);

    const flat = sources.flatMap((val) => {
      if (Array.isArray(val)) return val;
      if (typeof val === "string") {
        const t = val.trim();
        if (!t) return [];
        try {
          const parsed = JSON.parse(t);
          if (Array.isArray(parsed)) return parsed;
        } catch {}
        return t
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);
      }
      return [];
    });

    const principal =
      toImgUrl(producto?.imagen || producto?.image || producto?.foto) ||
      (flat[0] ? toImgUrl(flat[0]) : null);

    const extras = flat
      .map(toImgUrl)
      .filter(Boolean)
      .filter((u) => u !== principal);

    const lista = principal ? [principal, ...extras] : extras;

    const seen = new Set();
    return lista.filter((u) => (seen.has(u) ? false : (seen.add(u), true)));
  }, [producto]);

  // Precio a mostrar: si hay variantes, usar la más barata
  // Precio a mostrar:
  // - precio base del producto
  // - más el precio "efectivo" de cada variante (si es null, usa el del producto)
  // -> mostramos siempre el más bajo de todos
  const precioMostrar = useMemo(() => {
    const basePrice = Number(producto?.precio ?? producto?.price ?? 0);

    const vars =
      (Array.isArray(producto?.variantes) && producto.variantes) ||
      (Array.isArray(producto?.variants) && producto.variants) ||
      [];

    const preciosVariantes = vars
      .map((v) => {
        const raw = v?.precio ?? v?.price;

        // Si la variante no tiene precio (null/undefined),
        // usamos el precio base del producto
        if (raw === null || raw === undefined || raw === "") {
          return basePrice;
        }

        const num = Number(raw);
        return Number.isNaN(num) ? basePrice : num;
      })
      .filter((p) => !Number.isNaN(p));

    if (preciosVariantes.length) {
      // incluimos también el precio base por las dudas
      return Math.min(basePrice, ...preciosVariantes);
    }

    // sin variantes → solo el precio base
    return basePrice;
  }, [producto]);


  const productoConGaleria = useMemo(
    () => ({
      ...producto,
      product_id: productIdReal,
      galeria,
      imagenes: galeria,
      imagenes_extras: galeria,
    }),
    [producto, galeria, productIdReal]
  );

  const productSlug = (producto.nombre || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const productoParaCarrito = {
    ...producto,
    id: productIdReal,
    product_id: productIdReal,
  };
  return (
    <>
      <div className="producto-card">
        <div className="card-producto">
          <div
            className="card-producto-img"
            onClick={() => setMostrarDetalles(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setMostrarDetalles(true);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Ver detalles de ${producto.nombre}`}
            title="Ver detalles"
            style={{ cursor: "zoom-in" }}
          >
            <img
              src={
                producto.imagen
                  ? `${config.imageBaseUrl}/${producto.imagen}`
                  : "/images/no-image.jpg"
              }
              alt={producto.nombre}
              className="img-fluid"
              loading="lazy"
            />
          </div>

          <div className="card-producto-body">
            
            <Link
              to={`/producto/${productIdReal}/${productSlug}`}
              className="producto-nombre text-decoration-none"
            >
              {producto.nombre}
            </Link>
            <p className="producto-precio">{formatPrice(precioMostrar)}</p>
          </div>

          <div className="card-producto-footer">
            <button
              className="btn-detalles"
              onClick={() => setMostrarDetalles(true)}
            >
              <FaSearch className="icono" /> Detalles
            </button>
            <button
              className="btn-comprar"
              onClick={() => {
                // si tiene variantes, que elija en el modal
                if (
                  (Array.isArray(producto?.variantes) &&
                    producto.variantes.length) ||
                  (Array.isArray(producto?.variants) && producto.variants.length)
                ) {
                  setMostrarDetalles(true);
                  return;
                }
                // sin variantes: agregamos directo
                const precio = Number(producto?.precio ?? 0);
                agregarAlCarrito({ ...productoParaCarrito, precio });
                mostrarMensajeAgregado();
              }}
            >
              <FaShoppingCart className="icono" /> Comprar
            </button>
          </div>
        </div>
      </div>

      {mostrarDetalles && (
        <ProductDetailsModal
          producto={{ ...productoConGaleria, id: productIdReal, product_id: productIdReal }}
          onClose={() => setMostrarDetalles(false)}
        />
      )}
    </>
  );
};

export default ProductCard;
