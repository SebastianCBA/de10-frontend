import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import config from "./config";
import useSubdomain from "./hooks/useSubdomain";
import { useCart } from "./context/CartContext";
import {
  FaChevronLeft,
  FaChevronRight,
  FaShoppingCart,
  FaWhatsapp,
} from "react-icons/fa";
import { formatPrice } from "./utils/formatPrice";

function ProductoDetalle() {
  const { id, slug } = useParams();
  const subdomain = useSubdomain();
  const { agregarAlCarrito } = useCart();

  const [producto, setProducto] = useState(null);
  const [tienda, setTienda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imagenActiva, setImagenActiva] = useState(0);
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(null);

  useEffect(() => {
    if (!subdomain || !id) return;

    let mounted = true;
    setLoading(true);

    Promise.all([
      axios.get(`${config.apiBaseUrl}/tienda/${subdomain}/producto/${id}`),
      axios.get(`${config.apiBaseUrl}/tienda/${subdomain}`),
    ])
      .then(([resProducto, resTienda]) => {
        if (!mounted) return;

        const p = resProducto?.data ?? null;
        const t = resTienda?.data ?? null;

        setProducto(p);
        setTienda(t);

        const vars =
          (Array.isArray(p?.variantes) && p.variantes) ||
          (Array.isArray(p?.variants) && p.variants) ||
          [];

        setVarianteSeleccionada(null);
        setImagenActiva(0);
      })
      .catch((err) => {
        console.error("Error cargando detalle del producto:", err);
        if (!mounted) return;
        setProducto(null);
        setTienda(null);
        setVarianteSeleccionada(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [subdomain, id]);

  const toSlug = (value) => {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const stripHtml = (value) => {
    return String(value || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const truncate = (value, max = 160) => {
    const clean = String(value || "").trim();
    if (!clean) return "";
    if (clean.length <= max) return clean;
    return `${clean.slice(0, max - 1).trim()}…`;
  };

  const toImgUrl = (value) => {
    if (!value) return null;
    const s = String(value).trim();
    if (!s) return null;
    if (/^https?:\/\//i.test(s) || s.startsWith("data:")) return s;
    return `${config.imageBaseUrl}/${s}`;
  };

  const productName = useMemo(() => {
    return producto?.nombre || producto?.name || "Producto";
  }, [producto]);

  const productDescription = useMemo(() => {
    return producto?.descripcion || producto?.description || "";
  }, [producto]);

  const productMainImage = useMemo(() => {
    return producto?.imagen || producto?.image || null;
  }, [producto]);

  const variantes = useMemo(() => {
    if (!producto) return [];
    return (
      (Array.isArray(producto?.variantes) && producto.variantes) ||
      (Array.isArray(producto?.variants) && producto.variants) ||
      []
    );
  }, [producto]);

  const categorias = useMemo(() => {
    if (!producto) return [];

    if (Array.isArray(producto?.category_path) && producto.category_path.length) {
      return producto.category_path;
    }

    if (producto?.category?.parent) {
      return [producto.category.parent, producto.category];
    }

    if (producto?.category) {
      return [producto.category];
    }

    return [];
  }, [producto]);

  const nombreVariante = useMemo(() => {
    if (!varianteSeleccionada) return "";
    return varianteSeleccionada?.nombre || varianteSeleccionada?.name || "";
  }, [varianteSeleccionada]);

  const precioBase = useMemo(() => {
    const raw = producto?.precio ?? producto?.price ?? 0;
    const num = Number(raw);
    return Number.isNaN(num) ? 0 : num;
  }, [producto]);

  const precioActual = useMemo(() => {
    if (!varianteSeleccionada) return precioBase;

    const raw = varianteSeleccionada?.precio ?? varianteSeleccionada?.price;

    if (raw === null || raw === undefined || raw === "") return precioBase;

    const num = Number(raw);
    return Number.isNaN(num) ? precioBase : num;
  }, [varianteSeleccionada, precioBase]);

  const galeria = useMemo(() => {
    if (!producto) return ["/images/no-image.jpg"];

    const base = Array.isArray(producto?.imagenes) ? producto.imagenes : [];
    const baseUrls = base.map(toImgUrl).filter(Boolean);

    const principal = toImgUrl(productMainImage);

    let lista = [];

    if (principal) lista.push(principal);
    if (baseUrls.length) lista.push(...baseUrls);

    if (varianteSeleccionada) {
      const imgVariante = toImgUrl(
        varianteSeleccionada?.imagen ||
          varianteSeleccionada?.image ||
          varianteSeleccionada?.image_url
      );

      if (imgVariante) lista.unshift(imgVariante);
    }

    const unicos = [];
    const seen = new Set();

    for (const img of lista) {
      if (!img) continue;
      if (seen.has(img)) continue;
      seen.add(img);
      unicos.push(img);
    }

    return unicos.length ? unicos : ["/images/no-image.jpg"];
  }, [producto, productMainImage, varianteSeleccionada]);

  useEffect(() => {
    setImagenActiva(0);
  }, [varianteSeleccionada, id]);

  const canonicalSlug = useMemo(() => {
    if (slug) return slug;
    return toSlug(productName || "producto");
  }, [slug, productName]);

  const canonicalUrl = useMemo(() => {
    if (!subdomain || !id) return "";
    return `https://${subdomain}.de10.app/producto/${id}/${canonicalSlug}`;
  }, [subdomain, id, canonicalSlug]);

  const storeName = useMemo(() => {
    return tienda?.name || tienda?.nombre || subdomain || "Tienda";
  }, [tienda, subdomain]);

  const plainDescription = useMemo(() => {
    const base = stripHtml(productDescription);
    if (base) return base;

    const cats = categorias
      .map((c) => c?.nombre || c?.name)
      .filter(Boolean)
      .join(" / ");

    return `${productName}${cats ? ` en ${cats}` : ""} disponible en ${storeName}. Comprá online o consultá por WhatsApp.`;
  }, [productDescription, categorias, productName, storeName]);

  const metaDescription = useMemo(() => {
    return truncate(plainDescription, 160);
  }, [plainDescription]);

  const schemaImages = useMemo(() => {
    return galeria.length ? galeria : ["https://de10.app/images/og-image.jpg"];
  }, [galeria]);

  const seoImage = useMemo(() => {
    return schemaImages?.[0] || "https://de10.app/images/og-image.jpg";
  }, [schemaImages]);

  const seoTitle = useMemo(() => {
    const categoriaFinal =
      categorias.length > 0
        ? categorias[categorias.length - 1]?.nombre ||
          categorias[categorias.length - 1]?.name ||
          ""
        : "";

    if (categoriaFinal) {
      return `${productName} | ${categoriaFinal} | ${storeName}`;
    }

    return `${productName} | ${storeName}`;
  }, [productName, categorias, storeName]);

  const whatsappUrl = useMemo(() => {
    if (!producto || !tienda) return "#";

    const telefonoRaw =
      tienda?.phone || tienda?.telefono || tienda?.whatsapp || "";

    const telefono = String(telefonoRaw).replace(/\D/g, "");
    if (!telefono) return "#";

    const varianteTexto = nombreVariante ? ` - Variante: ${nombreVariante}` : "";
    const precioTexto = formatPrice(precioActual);

    const mensaje = `Hola! Quiero consultar por este producto:
${productName}${varianteTexto}
Precio: ${precioTexto}
Link: ${window.location.href}`;

    return `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
  }, [producto, tienda, nombreVariante, precioActual, productName]);

  const breadcrumbSchema = useMemo(() => {
    const items = [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: `https://${subdomain}.de10.app/`,
      },
    ];

    categorias.forEach((cat, index) => {
      const nombre = cat?.nombre || cat?.name || "Categoría";
      const catSlug = cat?.slug || cat?.modo || "";
      const item =
        cat?.id && catSlug
          ? `https://${subdomain}.de10.app/categoria/${cat.id}/${catSlug}`
          : `https://${subdomain}.de10.app/`;

      items.push({
        "@type": "ListItem",
        position: index + 2,
        name: nombre,
        item,
      });
    });

    items.push({
      "@type": "ListItem",
      position: items.length + 1,
      name: productName,
      item: canonicalUrl,
    });

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items,
    };
  }, [categorias, subdomain, productName, canonicalUrl]);

  const productSchema = useMemo(() => {
    const categoryText = categorias
      .map((c) => c?.nombre || c?.name)
      .filter(Boolean)
      .join(" > ");

    return {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: productName,
      image: schemaImages,
      description: plainDescription,
      sku: String(id),
      category: categoryText,
      brand: {
        "@type": "Brand",
        name: storeName,
      },
      ...(variantes.length > 0
        ? {
            additionalProperty: variantes.map((v) => ({
              "@type": "PropertyValue",
              name: "Variante",
              value: v?.nombre || v?.name || "Variante",
            })),
          }
        : {}),
      offers: {
        "@type": "Offer",
        price: String(Number(precioActual ?? 0)),
        priceCurrency: "ARS",
        availability: "https://schema.org/InStock",
        url: canonicalUrl,
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: "0",
            currency: "ARS",
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "AR",
          },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: {
              "@type": "QuantitativeValue",
              minValue: 0,
              maxValue: 1,
              unitCode: "DAY",
            },
            transitTime: {
              "@type": "QuantitativeValue",
              minValue: 1,
              maxValue: 5,
              unitCode: "DAY",
            },
          },
        },
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          returnPolicyCategory:
            "https://schema.org/MerchantReturnFiniteReturnWindow",
          applicableCountry: "AR",
          merchantReturnDays: 0,
          returnMethod: "https://schema.org/ReturnByMail",
          returnFees: "https://schema.org/FreeReturn",
        },
      },
    };
  }, [
    categorias,
    canonicalUrl,
    id,
    plainDescription,
    precioActual,
    productName,
    schemaImages,
    storeName,
    variantes,
  ]);

  const irImagenAnterior = () => {
    setImagenActiva((prev) => (prev === 0 ? galeria.length - 1 : prev - 1));
  };

  const irImagenSiguiente = () => {
    setImagenActiva((prev) => (prev === galeria.length - 1 ? 0 : prev + 1));
  };

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

  const handleAgregarAlCarrito = () => {
    if (!producto) return;

    agregarAlCarrito({
      ...producto,
      precio: precioActual,
      varianteSeleccionada: varianteSeleccionada || null,
      variante_nombre: nombreVariante || null,
      imagen:
        (varianteSeleccionada &&
          (varianteSeleccionada?.imagen ||
            varianteSeleccionada?.image ||
            varianteSeleccionada?.image_url)) ||
        productMainImage,
    });

    mostrarMensajeAgregado();
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <Helmet>
          <title>Cargando producto...</title>
          <meta name="robots" content="noindex,follow" />
        </Helmet>

        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-3 text-muted">Cargando producto...</p>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="container py-5 text-center">
        <Helmet>
          <title>Producto no encontrado</title>
          <meta name="robots" content="noindex,follow" />
        </Helmet>

        <h3 className="mb-3">Producto no encontrado</h3>
        <Link to="/" className="btn btn-outline-secondary">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <html lang="es-AR" />
        <title>{seoTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta
          name="robots"
          content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
        />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:locale" content="es_AR" />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content={storeName} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:image:secure_url" content={seoImage} />
        <meta property="og:image:alt" content={productName} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={seoImage} />

        <meta
          name="product:price:amount"
          content={String(Number(precioActual ?? 0))}
        />
        <meta name="product:price:currency" content="ARS" />
      </Helmet>

      <div
        className="container py-4"
        style={{ paddingBottom: "calc(120px + env(safe-area-inset-bottom))" }}
      >
        <div className="mb-4 d-flex flex-wrap align-items-center gap-2">
          <Link
            to="/"
            className="text-decoration-none"
            style={{
              color: "var(--color-naranja, #ff6a00)",
              fontWeight: 700,
            }}
          >
            Inicio
          </Link>

          {categorias.map((cat, index) => {
            const nombre = cat?.nombre || cat?.name;
            const catSlug = cat?.slug || cat?.modo || "";
            const esUltima = index === categorias.length - 1;

            return (
              <React.Fragment key={cat?.id || index}>
                <span style={{ color: "#999" }}>/</span>

                {cat?.id && catSlug ? (
                  <Link
                    to={`/categoria/${cat.id}/${catSlug}`}
                    className="text-decoration-none"
                    style={{
                      color: "#4a5568",
                      fontWeight: esUltima ? 600 : 500,
                    }}
                  >
                    {nombre}
                  </Link>
                ) : (
                  <span
                    style={{
                      color: "#4a5568",
                      fontWeight: esUltima ? 600 : 500,
                    }}
                  >
                    {nombre}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="row g-4 align-items-start">
          <div className="col-lg-6">
            <div
              className="bg-white rounded-4 p-3 p-md-4"
              style={{
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                border: "1px solid #f0f0f0",
              }}
            >
              <div
                className="position-relative overflow-hidden rounded-4"
                style={{
                  background: "#fafafa",
                  minHeight: 640,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {galeria.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={irImagenAnterior}
                      aria-label="Imagen anterior"
                      className="btn position-absolute start-0 top-50 translate-middle-y ms-3 rounded-circle"
                      style={{
                        width: 54,
                        height: 54,
                        background: "#8f8f8f",
                        color: "#fff",
                        border: "none",
                        zIndex: 2,
                      }}
                    >
                      <FaChevronLeft />
                    </button>

                    <button
                      type="button"
                      onClick={irImagenSiguiente}
                      aria-label="Imagen siguiente"
                      className="btn position-absolute end-0 top-50 translate-middle-y me-3 rounded-circle"
                      style={{
                        width: 54,
                        height: 54,
                        background: "#ff6a00",
                        color: "#fff",
                        border: "none",
                        zIndex: 2,
                      }}
                    >
                      <FaChevronRight />
                    </button>
                  </>
                )}

                <img
                  src={galeria[imagenActiva]}
                  alt={`${productName}${nombreVariante ? ` - ${nombreVariante}` : ""}`}
                  className="img-fluid"
                  style={{
                    maxHeight: 560,
                    width: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>

              {galeria.length > 1 && (
                <div className="d-flex justify-content-center gap-2 mt-3 flex-wrap">
                  {galeria.map((img, index) => (
                    <button
                      key={`${img}-${index}`}
                      type="button"
                      onClick={() => setImagenActiva(index)}
                      className="border-0 bg-transparent p-0"
                      aria-label={`Ver imagen ${index + 1} de ${productName}`}
                    >
                      <span
                        style={{
                          display: "block",
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background:
                            imagenActiva === index ? "#ffffff" : "#d9d9d9",
                          border:
                            imagenActiva === index
                              ? "2px solid #cfcfcf"
                              : "2px solid transparent",
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-6">
            <div
              className="bg-white rounded-4 p-4 p-md-4"
              style={{
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                border: "1px solid #f0f0f0",
              }}
            >
              <h1
                className="mb-3"
                style={{
                  fontSize: "clamp(2rem, 3.4vw, 4rem)",
                  lineHeight: 1.05,
                  fontWeight: 800,
                  color: "#202124",
                  letterSpacing: "-0.02em",
                  textTransform: "uppercase",
                }}
              >
                {productName}
              </h1>

              <div
                className="mb-4"
                style={{
                  color: "#f15a38",
                  fontSize: "clamp(2rem, 2.4vw, 3rem)",
                  fontWeight: 800,
                  lineHeight: 1,
                }}
              >
                {formatPrice(precioActual)}
              </div>

              {variantes.length > 0 && (
                <div className="mb-4">
                  <div
                    className="mb-3"
                    style={{
                      fontWeight: 700,
                      color: "#333",
                      fontSize: "1.05rem",
                    }}
                  >
                    Elegí la variante
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    {variantes.map((v) => {
                      const nombre = v?.nombre || v?.name || "Variante";
                      const seleccionada =
                        (varianteSeleccionada?.id || null) === (v?.id || null);

                      return (
                        <button
                          key={v?.id || nombre}
                          type="button"
                          onClick={() => setVarianteSeleccionada(v)}
                          className="btn"
                          style={{
                            minWidth: 76,
                            padding: "12px 18px",
                            borderRadius: 12,
                            border: seleccionada
                              ? "2px solid #ff6a00"
                              : "1px solid #d9d9d9",
                            background: seleccionada ? "#fff7f0" : "#fff",
                            color: "#202124",
                            fontWeight: 700,
                            boxShadow: "none",
                          }}
                        >
                          {nombre}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {categorias.map((cat, index) => {
                    const nombre = cat?.nombre || cat?.name;
                    const catSlug = cat?.slug || cat?.modo || "";

                    if (cat?.id && catSlug) {
                      return (
                        <Link
                          key={cat.id || index}
                          to={`/categoria/${cat.id}/${catSlug}`}
                          className="text-decoration-none"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "8px 16px",
                            borderRadius: 999,
                            border: "1px solid #d9e0ea",
                            background: "#f6f8fb",
                            color: "#53627c",
                            fontWeight: 500,
                          }}
                        >
                          {nombre}
                        </Link>
                      );
                    }

                    return (
                      <span
                        key={cat?.id || index}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "8px 16px",
                          borderRadius: 999,
                          border: "1px solid #d9e0ea",
                          background: "#f6f8fb",
                          color: "#53627c",
                          fontWeight: 500,
                        }}
                      >
                        {nombre}
                      </span>
                    );
                  })}
                </div>

                <div
                  style={{
                    fontSize: "1.1rem",
                    lineHeight: 1.8,
                    color: "#404040",
                    whiteSpace: "pre-line",
                  }}
                >
                  {productDescription || "Sin descripción"}
                </div>
              </div>

              <div className="d-flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleAgregarAlCarrito}
                  className="btn"
                  style={{
                    background: "#ff6a00",
                    color: "#fff",
                    border: "none",
                    borderRadius: 14,
                    padding: "14px 24px",
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <FaShoppingCart />
                  Agregar al carrito
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn"
                  style={{
                    background: "#25D366",
                    color: "#fff",
                    border: "none",
                    borderRadius: 14,
                    padding: "14px 24px",
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    pointerEvents: whatsappUrl === "#" ? "none" : "auto",
                    opacity: whatsappUrl === "#" ? 0.6 : 1,
                  }}
                >
                  <FaWhatsapp />
                  Comprar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}

export default ProductoDetalle;
