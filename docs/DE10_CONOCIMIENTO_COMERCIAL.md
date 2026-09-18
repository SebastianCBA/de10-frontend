# DE10

Base de conocimiento comercial para Mat, asesor comercial publico de Digimates.

Este documento resume capacidades funcionales reales de DE10 a partir del analisis de los repositorios frontend y backend disponibles. No incluye codigo fuente ni detalles tecnicos sensibles. Cuando una capacidad no queda suficientemente respaldada por el sistema actual, se marca como `REQUIERE CONFIRMACION`.

## Que es

DE10 es una plataforma para que un comercio tenga una tienda online simple en un subdominio propio de `de10.app`, cargue su catalogo de productos y reciba pedidos por WhatsApp.

El cliente final ve una tienda publica con portada, categorias, productos, detalle de producto, carrito y boton para finalizar la compra por WhatsApp. El comerciante ve un panel privado donde puede configurar su tienda, cargar productos, ordenar categorias/productos, administrar sucursales y revisar pedidos generados desde la tienda.

DE10 esta pensado como una herramienta practica para comercios que ya venden por WhatsApp, Instagram o atencion directa, pero necesitan ordenar su catalogo y hacer mas facil el armado de pedidos.

## A quien esta dirigido

DE10 esta dirigido a comercios pequenos o medianos que:

- Venden productos concretos y pueden mostrarlos en un catalogo.
- Quieren compartir una tienda online sin desarrollar una web a medida.
- Quieren que el cliente arme el pedido solo y lo envie por WhatsApp.
- Necesitan ordenar productos por categorias y subcategorias.
- Necesitan modificar precios, disponibilidad e imagenes sin depender de programacion.
- Quieren derivar pedidos a un telefono central o a sucursales.

No esta orientado, en su estado actual, a negocios que necesitan checkout con pago online completo, calculo automatico de envio, facturacion, gestion avanzada de inventario o seguimiento de estados de pedido.

## Problemas que resuelve

- Evita enviar listas de precios desordenadas por WhatsApp.
- Reduce consultas repetidas del tipo "que tenes?", "cuanto sale?", "tenes foto?".
- Permite que el cliente vea productos, fotos, precios y variantes antes de escribir.
- Convierte el catalogo en un link compartible: `nombre.de10.app`.
- Ordena la atencion por WhatsApp porque el mensaje llega con productos, cantidades, variantes, ID y total.
- Da al comerciante un panel para mantener actualizado el catalogo.
- Permite registrar pedidos iniciados desde la tienda publica para revisarlos luego.

## Clasificacion general de funcionalidades

### DISPONIBLE

- Tienda publica por subdominio `*.de10.app`.
- Registro e inicio de sesion del comerciante por email y Google.
- Verificacion de email para cuentas creadas con email.
- Recuperacion de contrasena.
- Configuracion inicial de subdominio.
- Panel privado del comerciante.
- Edicion de datos generales de la tienda.
- Logo de tienda.
- Titulo y subtitulo de portada.
- Links de Instagram y Facebook.
- Catalogo publico con categorias.
- Busqueda publica de productos por nombre y por ID.
- Detalle publico de producto.
- Galeria de imagenes de producto.
- Productos propios creados por el comercio.
- Edicion de nombre, descripcion, codigo de barras, categorias, precio, disponibilidad y destacado en inicio.
- Hasta 4 imagenes por producto propio.
- Optimizacion de imagenes a WebP en el sistema.
- Variantes de producto propio.
- Precio distinto por variante o mismo precio que el producto.
- Imagen opcional por variante.
- Disponibilidad por variante en forma simple.
- Categorias y subcategorias propias.
- Ordenamiento visual de categorias, subcategorias y productos.
- Carrito publico.
- Finalizacion del pedido por WhatsApp.
- Registro interno del pedido de WhatsApp.
- Listado de pedidos de WhatsApp en el panel.
- Filtros de pedidos por fecha.
- Sucursales con nombre, direccion y telefono.
- Eleccion de destino del WhatsApp: central o sucursal.
- SEO basico, metadatos sociales y paginas publicas compartibles.
- Suscripcion mensual de la tienda mediante Mercado Pago para cobrar el servicio DE10 al comerciante.

### DISPONIBLE CON CONFIGURACION

- Login con Google: requiere credenciales/configuracion de Google.
- Suscripcion con Mercado Pago: requiere configuracion de credenciales y plan de Mercado Pago.
- Webhooks de Mercado Pago: requieren URLs y credenciales correctas en produccion.
- Envio de emails de verificacion y recuperacion: requiere configuracion de correo.
- Subdominio publico: requiere que el entorno productivo resuelva correctamente los subdominios de `de10.app`.
- Previews sociales al compartir links: existen endpoints y ajustes para bots sociales; dependen del despliegue y de la cache de cada red social.
- Google Analytics: hay tracking configurado en frontend; requiere que el tag y el entorno productivo esten activos.

### INTERNA / NO OFRECER

- Login forzado de prueba.
- Endpoints de prueba de email o ping.
- Detalles de tokens, rutas internas, almacenamiento, tablas o estructura del backend.
- Panel tecnico/admin interno basado en herramientas de administracion.
- Campos tecnicos de certificados/keys que no aparecen como una funcionalidad comercial consolidada.
- Payloads, metadatos internos de pedidos, IP enmascarada, user-agent y estructuras de base de datos.

### EN DESARROLLO / INCOMPLETA

- Monedas multiples: existe estructura backend de monedas, pero la interfaz publica y el formateo visible usan simbolo `$` y formato argentino por defecto. No prometer multi-moneda sin confirmacion.
- Roles avanzados de usuarios: existen roles en usuarios, pero no se observa una experiencia comercial completa para empleados/permisos diferenciados. No prometer administracion multiusuario.
- Stock cuantitativo avanzado: hay campos historicos y un campo de disponibilidad, pero el uso visible principal es "hay stock / sin stock". No prometer control de unidades, alertas o movimientos de inventario.
- Recomendacion de productos o sugerencia por producto faltante: hay restos de flujo tecnico, pero no debe venderse como modulo listo.
- Catalogo global/base de productos: hay busqueda de productos existentes y vinculacion, pero el flujo comercial actual fuerte es crear productos propios. Ofrecer carga propia; no prometer una base universal completa sin validar.

### NO DISPONIBLE

- Pago online del cliente final dentro de la tienda.
- Checkout con tarjeta para compradores.
- Calculo automatico de envio.
- Integracion con correo/logistica.
- Gestion de estados del pedido como pendiente, confirmado, preparado, enviado o entregado.
- Cuentas para clientes finales.
- Historial de compras para clientes finales.
- Facturacion electronica.
- Emision de comprobantes.
- Cupones, descuentos, promociones automaticas o reglas comerciales avanzadas.
- Reservas/turnos.
- Integracion directa con Instagram Shopping, Meta Catalog, Mercado Libre, Tiendanube u otros marketplaces.
- Reportes comerciales avanzados, graficos, ranking de productos o metricas de conversion.
- Importacion masiva desde Excel/CSV confirmada como funcionalidad lista.
- Dominio propio del comercio confirmado como funcionalidad comercial.

## Administracion

El comerciante cuenta con un panel privado para administrar su tienda. Desde ese panel puede:

- Ver un dashboard de acceso rapido.
- Configurar datos generales de la tienda.
- Gestionar productos.
- Gestionar categorias y orden del catalogo.
- Gestionar sucursales.
- Revisar pedidos por WhatsApp.
- Consultar estado de suscripcion e historial de pagos.

El panel funciona como una aplicacion web responsive, por lo que puede usarse desde computadora o celular. Aun asi, para cargas extensas de productos o imagenes puede ser mas comodo usar una computadora.

## Experiencia del cliente

El cliente entra a la tienda publica del comercio, por ejemplo `mitienda.de10.app`.

Puede:

- Ver portada con nombre, logo, titulo y subtitulo.
- Navegar categorias y subcategorias.
- Ver productos destacados o ultimos productos agregados.
- Buscar productos.
- Abrir el detalle de un producto.
- Ver fotos, descripcion, precio y variantes.
- Agregar productos al carrito.
- Cambiar cantidades.
- Elegir variante cuando corresponde.
- Finalizar por WhatsApp.
- Elegir destino central o sucursal si el comercio tiene sucursales configuradas.

Al finalizar, DE10 arma un mensaje de WhatsApp con el detalle del pedido. El cliente puede revisarlo antes de enviarlo al comercio.

## Pedidos

DE10 registra los pedidos iniciados desde la tienda publica cuando el cliente confirma la derivacion a WhatsApp.

Informacion disponible para el comerciante:

- Numero/ID del pedido.
- Fecha y hora.
- Destino: central o sucursal.
- Telefono destino.
- Cantidad de items.
- Total.
- Productos del pedido.
- Variantes.
- Cantidades.
- Precio unitario.
- Subtotal.
- ID del producto.

El panel permite filtrar pedidos por rango de fechas. El rango por defecto cubre los ultimos 30 dias.

Importante: DE10 no reemplaza la conversacion comercial. El pedido se envia por WhatsApp y la confirmacion final, pago, entrega y coordinacion dependen del comercio.

## Catalogo y productos

El comercio puede cargar y administrar productos propios.

Cada producto propio puede tener:

- Nombre.
- Descripcion.
- Codigo de barras opcional.
- Categoria y subcategoria.
- Precio.
- Disponibilidad simple.
- Marca opcional a nivel interno de carga.
- Imagen principal.
- Imagenes adicionales, hasta 4 imagenes totales.
- Opcion de aparecer en inicio.
- Variantes.

Las variantes permiten representar opciones como talle, color, tamano, sabor, presentacion u otra diferencia comercial. Cada variante puede usar el precio base del producto o tener un precio propio. Tambien puede tener imagen propia.

El sistema permite editar productos ya cargados, cambiar imagenes, marcar una imagen como principal, eliminar imagenes extra y administrar variantes.

## Categorias

DE10 permite ordenar el catalogo con categorias y subcategorias.

Capacidades disponibles:

- Crear categorias propias.
- Crear subcategorias.
- Editar nombres.
- Eliminar categorias propias si no tienen subcategorias ni productos asociados.
- Ordenar categorias.
- Ordenar subcategorias.
- Ordenar productos dentro de una subcategoria.

En la tienda publica solo se muestran categorias con productos disponibles.

## Stock y disponibilidad

DE10 maneja disponibilidad de forma simple:

- Producto con stock/disponible.
- Producto sin stock/no visible en ciertas vistas publicas.
- Variante con disponibilidad simple.

No se debe prometer inventario por unidades, movimientos de stock, alertas por minimo, stock por sucursal ni reportes de inventario. Eso requiere confirmacion o desarrollo.

## Precios

El comercio puede modificar precios de productos desde el panel.

Las variantes pueden:

- Usar el mismo precio del producto.
- Tener precio propio.

El cliente ve el precio del producto y, cuando hay variantes, el sistema puede mostrar el precio correspondiente a la variante elegida. En tarjetas de producto, si hay variantes con precios distintos, se muestra el menor precio disponible entre el producto base y sus variantes.

## Configuracion

Configuraciones disponibles para el comercio:

- Nombre de la tienda.
- Direccion.
- Telefono.
- Email visible/administrativo.
- Logo.
- Titulo de bienvenida.
- Subtitulo de bienvenida.
- Instagram.
- Facebook.
- Subdominio.
- Sucursales.
- Productos destacados en inicio.

El subdominio se valida antes de guardarlo. Debe tener al menos 3 caracteres, maximo 25, usar minusculas/numeros/guiones y no puede ser una palabra reservada.

## Integraciones

### WhatsApp

WhatsApp es la integracion central para ventas. DE10 arma el mensaje de pedido y abre WhatsApp para que el cliente lo envie.

Mat puede decir:

"DE10 no intenta reemplazar tu WhatsApp: lo ordena. El cliente arma el pedido en la tienda y cuando termina te llega un mensaje con el detalle listo para responder."

No decir que DE10 envia mensajes automaticamente desde una cuenta del comercio. El cliente revisa y envia el mensaje desde su WhatsApp.

### Mercado Pago

Mercado Pago esta implementado para la suscripcion del comerciante al servicio DE10. No es un checkout de productos para el comprador final.

Mat debe distinguir claramente:

- Disponible: pagar la suscripcion de DE10 con Mercado Pago.
- No disponible actualmente: cobrarle online al cliente final por los productos del comercio dentro de la tienda.

### Google

DE10 permite registrarse o iniciar sesion con Google si la integracion esta configurada.

### Email

DE10 usa email para verificacion de cuenta y recuperacion de contrasena, sujeto a configuracion del servidor de correo.

### SEO y enlaces compartibles

DE10 genera paginas publicas y metadatos para tienda, categorias y productos. Esto ayuda a compartir links con mejor titulo, descripcion e imagen en redes y mensajeria.

## Personalizacion

Personalizacion disponible:

- Subdominio propio dentro de `de10.app`.
- Logo.
- Textos de portada.
- Redes sociales.
- Organizacion del catalogo.
- Productos destacados.
- Imagenes y descripcion por producto.
- Variantes con nombre, precio e imagen.

No prometer cambios visuales a medida, temas personalizados, CSS propio del cliente o dominio propio sin confirmacion.

## Seguridad

Capacidades visibles:

- Autenticacion con token.
- Registro e inicio de sesion.
- Verificacion de email para cuentas por correo.
- Recuperacion de contrasena.
- Proteccion de endpoints privados para panel.
- Validaciones de pertenencia: el comercio solo puede editar recursos de su tienda.
- Subdominios reservados y validacion de formato.

Mat debe hablar de seguridad en terminos comerciales, sin revelar detalles internos:

"El panel esta protegido con usuario y contrasena, y cada comercio administra su propia tienda."

No debe explicar tokens, middleware, rutas internas, tablas, estructura de almacenamiento ni detalles de implementacion.

## Casos de uso

### Indumentaria

Aplica cuando el comercio quiere mostrar productos con fotos, precios y variantes como talle, color o modelo. DE10 ayuda a que el cliente arme el pedido antes de escribir por WhatsApp.

Limite: las variantes son flexibles por nombre, no un sistema avanzado de matriz talle/color con stock por combinacion.

### Decoracion y bazar

Aplica para productos visuales donde importan fotos, descripcion, categorias y precio. El cliente puede navegar por ambientes, tipos de producto o colecciones, y enviar el pedido por WhatsApp.

### Cosmetica, perfumeria y productos naturales

Aplica para catalogos con variantes de presentacion, tamanos, aromas o lineas. Las fotos y descripciones ayudan a reducir consultas repetidas.

### Ferreteria y repuestos

Aplica si el comercio necesita ordenar muchos productos y que el pedido llegue con ID del producto. La busqueda por nombre o ID ayuda a encontrar articulos.

Limite: no prometer compatibilidad avanzada por vehiculo, medidas tecnicas complejas o stock por deposito sin confirmacion.

### Alimentos envasados, dieteticas y vinotecas

Aplica para productos con categorias, marcas, presentaciones y precios. El carrito por WhatsApp sirve para preparar pedidos y coordinar entrega o retiro.

Limite: DE10 no calcula envio, no cobra online al cliente final y no controla reglas legales de venta de alcohol/alimentos.

### Regaleria, juguetes y tiendas infantiles

Aplica para catalogos visuales con categorias, precios, productos destacados y consulta rapida por WhatsApp.

### Comercios con sucursales

Aplica cuando el comercio quiere que el cliente envie el pedido a casa central o a una sucursal especifica. Cada sucursal puede tener nombre, direccion y telefono.

Limite: no prometer stock diferenciado por sucursal.

## Preguntas frecuentes

### Que es DE10?

DE10 es una plataforma para crear una tienda online simple conectada a WhatsApp. El comercio carga productos, precios, categorias e imagenes; el cliente navega el catalogo, arma un carrito y envia el pedido por WhatsApp.

### Para quien sirve?

Sirve para comercios que venden productos y hoy atienden por WhatsApp, Instagram o mostrador, pero necesitan ordenar su catalogo y hacer mas facil que el cliente elija.

### Que problema resuelve?

Reduce el ida y vuelta manual. En lugar de responder producto por producto, el comercio comparte un link y el cliente arma el pedido con fotos, precios, cantidades y variantes.

### Necesito saber programacion?

No. El comerciante administra la tienda desde un panel web. Puede cargar productos, modificar precios, subir imagenes y ordenar categorias sin tocar codigo.

### Puedo cargar mis productos?

Si. DE10 permite crear productos propios con nombre, descripcion, precio, categorias, imagenes y disponibilidad.

### Puedo modificar precios?

Si. El precio del producto se puede editar desde el panel. Tambien se pueden configurar variantes con precio propio.

### Puedo administrar pedidos?

Si, con alcance limitado. DE10 registra los pedidos que se generan desde la tienda y permite verlos en el panel con filtros por fecha y detalle de productos. No incluye flujo de estados como "preparado", "enviado" o "entregado".

### Que ve mi cliente?

Ve una tienda online publica con portada, categorias, buscador, productos, detalle de producto, carrito y boton para finalizar por WhatsApp.

### Que veo yo como comerciante?

Ves un panel privado para configurar tu tienda, cargar productos, ordenar categorias, administrar sucursales, revisar pedidos de WhatsApp y consultar tu suscripcion.

### Puedo usarlo desde el celular?

Si. La tienda publica y el panel son web y se adaptan a pantallas moviles. Para cargas grandes de productos puede ser mas comodo usar computadora.

### Necesito tener una pagina web?

No. DE10 te da una direccion dentro de `de10.app`, por ejemplo `mitienda.de10.app`, para compartir con tus clientes.

### Como empiezo?

El flujo esperado es: crear cuenta, verificar/iniciar sesion, elegir subdominio, configurar datos de tienda, cargar productos y compartir el link de la tienda.

### Cuanto trabajo requiere mantenerlo?

Depende de la rotacion del comercio. El mantenimiento normal es cargar nuevos productos, actualizar precios, marcar disponibilidad y revisar pedidos. Para un catalogo estable, el trabajo diario puede ser bajo.

### Que diferencia tiene respecto a vender solamente por Instagram o WhatsApp?

Instagram muestra contenido, pero no ordena el pedido. WhatsApp sirve para conversar, pero puede volverse caotico si el cliente pregunta por muchos productos. DE10 organiza el catalogo y hace que el mensaje llegue con productos, cantidades, variantes y total.

### Que cosas puede automatizar?

Automatiza la presentacion del catalogo, el armado del carrito, el calculo del total, la generacion del mensaje de WhatsApp, la derivacion a central/sucursal y el registro del pedido iniciado.

### El cliente paga dentro de DE10?

No actualmente. El cliente final envia el pedido por WhatsApp y el comercio coordina pago y entrega por fuera.

### DE10 cobra comision por venta?

No se encontro implementacion de comisiones por venta. Lo implementado es una suscripcion mensual del comercio al servicio DE10. Cualquier condicion comercial final debe confirmarse con Digimates.

### Puedo tener sucursales?

Si. El comercio puede cargar sucursales con nombre, direccion y telefono. Al finalizar el pedido, el cliente puede elegir enviar el WhatsApp a central o a una sucursal.

### Puedo destacar productos en la portada?

Si. Un producto puede marcarse para aparecer en inicio. Si no hay destacados, la portada muestra productos recientes.

### Puedo ordenar mi catalogo?

Si. DE10 permite ordenar categorias, subcategorias y productos.

### Puedo subir varias fotos?

Si. Los productos propios pueden tener hasta 4 imagenes en total. El sistema permite definir una imagen principal.

### Puedo cargar variantes?

Si. Se pueden cargar variantes con nombre, precio propio o mismo precio del producto, disponibilidad simple e imagen opcional.

### Puedo vender productos sin variantes?

Si. Si el producto no tiene variantes, el cliente puede agregarlo directamente al carrito.

### Puedo cambiar el link de mi tienda?

El sistema permite configurar el subdominio inicial y tiene validaciones de disponibilidad. Cambios posteriores deben confirmarse segun la politica comercial/operativa vigente.

### Puedo usar dominio propio?

REQUIERE CONFIRMACION. El sistema publico observado trabaja con subdominios de `de10.app`. No prometer dominio propio sin validacion.

### DE10 sirve para servicios?

REQUIERE CONFIRMACION. La estructura actual esta pensada principalmente para productos, catalogo, carrito y pedidos por WhatsApp. Puede servir para servicios paquetizados como productos, pero no hay modulo de turnos o reservas.

### Hay reportes?

Hay listado de pedidos con filtros por fecha. No se encontro un modulo de reportes comerciales avanzados con graficos, conversiones o rankings.

### Hay stock?

Hay disponibilidad simple. No prometer inventario avanzado por unidades.

### Puedo importar productos masivamente?

REQUIERE CONFIRMACION. No se encontro una funcionalidad consolidada de importacion masiva lista para ofrecer.

### Que pasa si un producto no tiene stock?

El sistema usa la disponibilidad para filtrar productos visibles en categorias y busquedas publicas. Comercialmente: el comercio puede marcar si un producto esta disponible o no.

### El pedido se envia solo?

No. DE10 prepara el mensaje y abre WhatsApp. El cliente lo revisa y lo envia.

## Limitaciones actuales

- No hay checkout de pago online para clientes finales.
- No hay modulo de envios.
- No hay calculo de costo de envio.
- No hay estados de pedido.
- No hay panel para clientes finales.
- No hay facturacion.
- No hay control avanzado de inventario.
- No hay stock por sucursal.
- No hay descuentos/cupones implementados como modulo comercial.
- No hay reportes avanzados.
- No hay importacion masiva confirmada.
- No hay dominio propio confirmado.
- No hay multiusuario/permisos comerciales completos confirmados.
- No hay integracion confirmada con marketplaces externos.

## Funcionalidades que no deben prometerse

Mat no debe prometer:

- "Tus clientes pagan online en DE10".
- "DE10 gestiona envios automaticamente".
- "DE10 descuenta stock por unidad".
- "DE10 tiene estados de pedido completos".
- "DE10 se integra con Instagram Shopping o Mercado Libre".
- "DE10 factura automaticamente".
- "DE10 tiene reportes avanzados".
- "DE10 permite empleados con permisos personalizados".
- "DE10 soporta dominio propio".
- "DE10 importa masivamente productos desde Excel".
- "DE10 envia WhatsApps automaticos desde el numero del comercio".
- "DE10 reemplaza al vendedor".

La forma correcta de posicionarlo es:

"DE10 ordena tu catalogo y facilita que el cliente te envie un pedido completo por WhatsApp."

## Requiere confirmacion

Mat debe responder con cautela ante estas preguntas:

- Dominio propio.
- Multi-moneda visible para clientes.
- Importacion masiva.
- Stock por unidades.
- Stock por sucursal.
- Usuarios empleados/permisos.
- Reportes avanzados.
- Integraciones con marketplaces.
- Integracion con sistemas contables/facturacion.
- Pagos online para clientes finales.
- Envios y calculo logistico.
- Personalizacion visual a medida.
- Migracion automatica desde otra tienda.
- Limites comerciales exactos de cantidad de productos, imagenes, pedidos o tiendas por cuenta.

Respuesta recomendada:

"Quiero confirmarte ese punto antes de asegurartelo. DE10 hoy cubre catalogo, carrito y pedidos por WhatsApp; para esa necesidad puntual prefiero validarlo con el equipo."

## Informacion interna / no divulgar

Mat nunca debe revelar:

- Codigo fuente.
- Nombres de controladores, modelos, rutas internas o archivos.
- Arquitectura privada del backend/frontend.
- Estructura de base de datos.
- Credenciales.
- Tokens.
- Claves.
- Certificados.
- Variables de entorno.
- URLs internas de desarrollo.
- Endpoints de prueba.
- IDs internos de usuarios reales.
- Datos de clientes o comercios.
- Payloads internos de pedidos.
- Logs.
- Vulnerabilidades o detalles de seguridad.
- Mecanismos internos de autenticacion.
- Nombres de tablas.
- Informacion de servidores.
- Funcionalidades experimentales o incompletas.

Si un cliente pregunta por detalles tecnicos sensibles, Mat debe responder en nivel comercial:

"Por seguridad no compartimos detalles internos de implementacion. Lo importante es que cada comercio accede a su panel privado y administra su propia tienda."

## Mensajes comerciales recomendados

### Pitch corto

DE10 te permite tener una tienda online simple para mostrar tus productos y recibir pedidos por WhatsApp. Cargas tu catalogo, compartis tu link y tus clientes arman el pedido con fotos, precios, cantidades y variantes.

### Pitch para comercios que ya venden por WhatsApp

Si ya vendes por WhatsApp, DE10 te ayuda a ordenar la venta. En vez de mandar fotos y precios uno por uno, compartis tu tienda; el cliente elige, arma el carrito y te manda un mensaje con el pedido listo.

### Pitch para comercios que venden por Instagram

Instagram sirve para mostrar, pero no siempre para ordenar pedidos. DE10 complementa Instagram con un catalogo navegable, buscador, carrito y pedido por WhatsApp.

### Pitch honesto sobre alcance

DE10 no busca ser un ecommerce complejo con pagos, envios y facturacion automatica. Es una solucion simple para publicar productos y recibir pedidos ordenados por WhatsApp.

## Resumen para Mat

Mat debe presentar DE10 como:

- Una tienda online simple.
- Orientada a comercios que venden productos.
- Con administracion propia.
- Con catalogo, categorias, productos, variantes e imagenes.
- Con carrito y pedido por WhatsApp.
- Con registro de pedidos para el comerciante.
- Sin prometer pago online, envios, facturacion, stock avanzado ni integraciones no confirmadas.

Frase guia:

"DE10 convierte tu catalogo en una tienda online compartible y hace que los pedidos lleguen ordenados a WhatsApp."
