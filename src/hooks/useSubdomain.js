export default function useSubdomain() {
  const hostname = window.location.hostname;

  // Ej: probando8.localhost ó probando8.lvh.me
  const parts = hostname.split(".");
  if (parts.length >= 3) {

    return parts[0]; // probando8
  }

//  if (parts.length === 2 && parts[0] !== "localhost") {
  if (parts.length === 2 && parts[0] !== "de10") {
    //console.log(parts[0]);
    return parts[0]; // probando8.lvh.me → "probando8"
  }

  return "localhost"; // default para desarrollo sin subdominio
}
