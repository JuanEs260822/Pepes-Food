// Dashboard.js - Lógica para la página del dashboard

document.addEventListener('DOMContentLoaded', function() {
  // Verificar autenticación
  verificarAutenticacion()
    .then(usuario => {
      // Inicializar dashboard
      inicializarDashboard();
    })
    .catch(error => {
      console.error('Error de autenticación:', error);
      // La redirección al login se maneja en verificarAutenticacion()
    });
});

async function inicializarDashboard() {
  mostrarCargando(true);
  
  try {
    // Cargar datos para el dashboard
    await Promise.all([
      cargarResumenDelDia(),
      cargarOrdenesActivas(),
      cargarGraficoVentas()
    ]);
    
    mostrarCargando(false);
  } catch (error) {
    console.error('Error al inicializar el dashboard:', error);
    mostrarNotificacion('Error al cargar el dashboard. Por favor, recarga la página.', 'error');
    mostrarCargando(false);
  }
}

async function cargarResumenDelDia() {
  // Obtener fechas de inicio y fin del día actual
  const fechaInicio = obtenerFechaInicioDia();
  const fechaFin = obtenerFechaFinDia();
  
  try {
    // Obtener órdenes del día
    const ordenesRef = db.collection('ordenes')
      .where('fechaCreacion', '>=', fechaInicio)
      .where('fechaCreacion', '<=', fechaFin);
    
    const ordenesSnapshot = await ordenesRef.get();
    
    // Contador de órdenes
    const totalOrdenes = ordenesSnapshot.size;
    document.getElementById('ordenes-hoy').textContent = totalOrdenes;
    
    // Calcular ventas totales del día
    let ventasTotal = 0;
    ordenesSnapshot.forEach(doc => {
      const orden = doc.data();
      if (orden.estado === 'pagado' || orden.estado === 'entregado') {
        ventasTotal += orden.total || 0;
      }
    });
    
    document.getElementById('ventas-hoy').textContent = formatearMoneda(ventasTotal);
    
    // Contar órdenes activas
    const ordenesActivasRef = db.collection('ordenes')
      .where('estado', 'in', ['activo', 'ordenado', 'cocinado']);
    
    const ordenesActivasSnapshot = await ordenesActivasRef.get();
    document.getElementById('ordenes-activas').textContent = ordenesActivasSnapshot.size;
    
    // Obtener productos populares (los más vendidos hoy)
    const productosCantidad = {};
    
    // Contar productos en órdenes
    ordenesSnapshot.forEach(doc => {
      const orden = doc.data();
      if (orden.productos && Array.isArray(orden.productos)) {
        orden.productos.forEach(producto => {
          const idProducto = producto.id;
          const cantidad = producto.cantidad || 1;
          
          if (productosCantidad[idProducto]) {
            productosCantidad[idProducto] += cantidad;
          } else {
            productosCantidad[idProducto] = cantidad;
          }
        });
      }
    });
    
    // Encontrar el producto más vendido
    let maxCantidad = 0;
    let productoPopular = '-';
    
    for (const [idProducto, cantidad] of Object.entries(productosCantidad)) {
      if (cantidad > maxCantidad) {
        maxCantidad = cantidad;
        productoPopular = idProducto;
      }
    }
    
    // Si hay un producto popular, obtener su nombre
    if (productoPopular !== '-' && maxCantidad > 0) {
      const productoDoc = await db.collection('productos').doc(productoPopular).get();
      if (productoDoc.exists) {
        const producto = productoDoc.data();
        document.getElementById('productos-populares').textContent = producto.nombre;
      }
    } else {
      document.getElementById('productos-populares').textContent = 'Sin datos';
    }
  } catch (error) {
    console.error('Error al cargar el resumen del día:', error);
    mostrarNotificacion('Error al cargar el resumen del día', 'error');
  }
}

async function cargarOrdenesActivas() {
  const contenedor = document.getElementById('ordenes-activas-container');
  
  try {
    // Obtener órdenes activas (no completadas)
    const ordenesRef = db.collection('ordenes')
      .where('estado', 'in', ['activo', 'ordenado', 'cocinado'])
      .orderBy('fechaCreacion', 'desc')
      .limit(5);
    
    const ordenesSnapshot = await ordenesRef.get();
    
    // Limpiar contenedor
    contenedor.innerHTML = '';
    
    if (ordenesSnapshot.empty) {
      contenedor.innerHTML = '<p class="mensaje-info">No hay órdenes activas en este momento.</p>';
      return;
    }
    
    // Crear tabla de órdenes
    const tabla = document.createElement('table');
    tabla.className = 'tabla';
    
    // Encabezado de tabla
    const encabezado = `
      <thead>
        <tr>
          <th>Número</th>
          <th>Hora</th>
          <th>Estado</th>
          <th>Total</th>
          <th>Acciones</th>
        </tr>
      </thead>
    `;
    
    // Cuerpo de tabla
    let cuerpoTabla = '<tbody>';
    
    ordenesSnapshot.forEach(doc => {
      const orden = doc.data();
      const ordenId = doc.id;
      
      // Mapear estado a texto legible
      let estadoTexto = '';
      let estadoClase = '';
      
      switch (orden.estado) {
        case 'activo':
          estadoTexto = 'Activo';
          estadoClase = 'estado-activo';
          break;
        case 'ordenado':
          estadoTexto = 'Ordenado';
          estadoClase = 'estado-ordenado';
          break;
        case 'cocinado':
          estadoTexto = 'Cocinado';
          estadoClase = 'estado-cocinado';
          break;
      }
      
      // Formatear fecha
      const fecha = orden.fechaCreacion ? orden.fechaCreacion.toDate() : new Date();
      const horaFormateada = fecha.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Crear fila
      cuerpoTabla += `
        <tr>
          <td>${orden.numeroOrden || orden.id}</td>
          <td>${horaFormateada}</td>
          <td><span class="estado-badge ${estadoClase}">${estadoTexto}</span></td>
          <td>${formatearMoneda(orden.total || 0)}</td>
          <td>
            <a href="orders.html?id=${ordenId}" class="btn-accion">
              <i class="fas fa-eye"></i>
            </a>
          </td>
        </tr>
      `;
    });
    
    cuerpoTabla += '</tbody>';
    
    // Agregar a la tabla
    tabla.innerHTML = encabezado + cuerpoTabla;
    
    // Agregar enlace para ver todas las órdenes
    const verTodasLink = document.createElement('a');
    verTodasLink.href = 'orders.html';
    verTodasLink.className = 'ver-todas-link';
    verTodasLink.innerHTML = 'Ver todas las órdenes <i class="fas fa-arrow-right"></i>';
    
    // Agregar elementos al contenedor
    contenedor.appendChild(tabla);
    contenedor.appendChild(verTodasLink);
    
  } catch (error) {
    console.error('Error al cargar órdenes activas:', error);
    contenedor.innerHTML = '<p class="mensaje-error">Error al cargar las órdenes activas.</p>';
  }
}

async function cargarGraficoVentas() {
  try {
    // Obtener los últimos 7 días de ventas
    const fechaFin = new Date();
    fechaFin.setHours(23, 59, 59, 999);
    
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - 6); // 7 días incluyendo hoy
    fechaInicio.setHours(0, 0, 0, 0);
    
    const ventasPorDia = {};
    
    // Inicializar el objeto con los últimos 7 días
    for (let i = 0; i < 7; i++) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      fecha.setHours(0, 0, 0, 0);
      
      const fechaStr = fecha.toISOString().split('T')[0];
      ventasPorDia[fechaStr] = 0;
    }
    
    // Obtener órdenes pagadas en el rango de fechas
    const ordenesRef = db.collection('ordenes')
      .where('fechaCreacion', '>=', fechaInicio)
      .where('fechaCreacion', '<=', fechaFin)
      .where('estado', 'in', ['pagado', 'entregado']);
    
    const ordenesSnapshot = await ordenesRef.get();
    
    // Calcular ventas por día
    ordenesSnapshot.forEach(doc => {
      const orden = doc.data();
      if (orden.fechaCreacion && orden.total) {
        const fecha = orden.fechaCreacion.toDate();
        const fechaStr = fecha.toISOString().split('T')[0];
        
        if (ventasPorDia[fechaStr] !== undefined) {
          ventasPorDia[fechaStr] += orden.total;
        }
      }
    });
    
    // Preparar datos para el gráfico
    const labels = [];
    const datos = [];
    
    // Ordenar fechas (de más antigua a más reciente)
    const fechasOrdenadas = Object.keys(ventasPorDia).sort();
    
    fechasOrdenadas.forEach(fecha => {
      // Formatear fecha para mostrar
      const [year, month, day] = fecha.split('-');
      const fechaObj = new Date(year, month - 1, day);
      const fechaFormateada = fechaObj.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' });
      
      labels.push(fechaFormateada);
      datos.push(ventasPorDia[fecha]);
    });
    
    // Crear gráfico con Chart.js
    const ctx = document.getElementById('ventas-chart').getContext('2d');
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Ventas (MXN)',
          data: datos,
          backgroundColor: 'rgba(255, 136, 0, 0.2)',
          borderColor: 'rgba(255, 136, 0, 1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return formatearMoneda(context.raw);
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return formatearMoneda(value);
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error al cargar el gráfico de ventas:', error);
    document.querySelector('.canvas-container').innerHTML = 
      '<p class="mensaje-error">Error al cargar el gráfico de ventas.</p>';
  }
}

// Estilos adicionales para el dashboard
document.head.insertAdjacentHTML('beforeend', `
<style>
  .estado-badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: bold;
  }
  
  .estado-activo {
    background-color: #17a2b8;
    color: white;
  }
  
  .estado-ordenado {
    background-color: #ffc107;
    color: #333;
  }
  
  .estado-cocinado {
    background-color: #28a745;
    color: white;
  }
  
  .btn-accion {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: var(--color-primario);
    color: white;
    text-decoration: none;
    transition: all 0.3s ease;
  }
  
  .btn-accion:hover {
    background-color: var(--color-secundario);
  }
  
  .mensaje-info {
    text-align: center;
    color: var(--color-info);
    padding: 20px;
  }
  
  .mensaje-error {
    text-align: center;
    color: var(--color-error);
    padding: 20px;
  }
  
  .ver-todas-link {
    display: block;
    text-align: right;
    margin-top: 10px;
    color: var(--color-primario);
    text-decoration: none;
    font-weight: bold;
  }
  
  .ver-todas-link:hover {
    color: var(--color-secundario);
  }
  
  .cargando-mensaje {
    text-align: center;
    padding: 20px;
    color: #666;
  }
</style>
`);