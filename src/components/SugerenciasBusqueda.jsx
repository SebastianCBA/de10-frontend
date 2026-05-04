import { useNavigate } from "react-router-dom";
import config from "../config";
import { formatPrice } from "../utils/formatPrice";


function SugerenciasBusqueda({ sugerencias, setMostrarSugerencias }) {
  const navigate = useNavigate();

  if (!sugerencias || sugerencias.length === 0) return null;

  return (
    <ul className="sugerencias-lista">
      {sugerencias.map((prod) => (
        <li
          key={prod.id}
          className="sugerencia-item"
          onClick={() => {
            navigate(`/buscar?q=${encodeURIComponent(prod.nombre)}`);
            setMostrarSugerencias(false);
          }}
        >
          <img
            src={prod.imagen ? `${config.imageBaseUrl}/${prod.imagen}` : "/images/no-image.jpg"}
            alt={prod.nombre}
          />
          <div className="sugerencia-info">
            <span>{prod.nombre}</span>
            {prod.precio && (
              <span className="precio">{formatPrice(prod.precio)}</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default SugerenciasBusqueda;
