import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

const LS_KEY = "carrito";

const makeKey = (id, varianteId) => `${id}::${varianteId ?? 0}`;
const toNumber = (v, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

export function CartProvider({ children }) {
  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem(LS_KEY);
    const arr = guardado ? JSON.parse(guardado) : [];
    if (!Array.isArray(arr)) return [];

    // MIGRACIÓN: asegurar key, precio numérico y forma de variante
    return arr.map((it) => {
      const varianteId = it?.variante_id ?? it?.variante?.id ?? null;
      const key = it?.key ?? makeKey(it?.id, varianteId);
      const precio = toNumber(it?.precio ?? it?.variante?.precio ?? it?.price ?? 0, 0);
      const variante =
        varianteId != null || it?.variante
          ? {
              id: varianteId,
              nombre: it?.variante?.nombre ?? it?.variante?.name ?? "",
              imagen: it?.variante?.imagen ?? null,
              precio,
            }
          : null;

      return {
        ...it,
        key,
        precio,
        variante_id: varianteId ?? null,
        variante,
        cantidad: Math.max(1, toNumber(it?.cantidad ?? 1, 1)),
      };
    });
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(carrito));
  }, [carrito]);

  const agregarAlCarrito = (producto) => {
    const id =
      producto?.product?.id ??
      producto?.product_id ??
      producto?.producto_id ??
      producto?.id;
    if (id == null) return;

    const varianteId = producto?.variante_id ?? producto?.variante?.id ?? null;
    const key = makeKey(id, varianteId);

    const nombre = producto?.nombre ?? "";
    const imagen =
      (producto?.variante && producto.variante.imagen) ||
      producto?.imagen ||
      producto?.image ||
      null;

    const precio = toNumber(
      producto?.variante?.precio ?? producto?.precio ?? producto?.price,
      0
    );

    const variante =
      varianteId != null
        ? {
            id: varianteId,
            nombre: producto?.variante?.nombre ?? producto?.variante?.name ?? "",
            imagen: producto?.variante?.imagen ?? null,
            precio,
          }
        : null;

    setCarrito((prev) => {
      const idx = prev.findIndex((p) => p.key === key);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], cantidad: copy[idx].cantidad + 1 };
        return copy;
      }
      return [
        ...prev,
        {
          key,
          id,
          nombre,
          imagen,
          precio,
          cantidad: 1,
          variante_id: varianteId,
          variante,
        },
      ];
    });
  };

  const _findIndexByIdOrKey = (list, idOrKey) => {
    if (idOrKey == null) return -1;
    const s = String(idOrKey);
    if (s.includes("::")) return list.findIndex((p) => p.key === s);
    const idNum = Number(idOrKey);
    return list.findIndex((p) => Number(p.id) === idNum);
  };

  const actualizarCantidad = (idOrKey, nuevaCantidad) => {
    const qty = Math.max(1, toNumber(nuevaCantidad, 1));
    setCarrito((prev) => {
      const idx = _findIndexByIdOrKey(prev, idOrKey);
      if (idx === -1) return prev;
      const copy = [...prev];
      copy[idx] = { ...copy[idx], cantidad: qty };
      return copy;
    });
  };

  const eliminarDelCarrito = (idOrKey) => {
    setCarrito((prev) => {
      const idx = _findIndexByIdOrKey(prev, idOrKey);
      if (idx === -1) return prev;
      const copy = [...prev];
      copy.splice(idx, 1);
      return copy;
    });
  };

  const vaciarCarrito = () => setCarrito([]);

  return (
    <CartContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        actualizarCantidad,
        eliminarDelCarrito,
        vaciarCarrito,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
