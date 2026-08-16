// ========================================
// INVENTARIO
// ========================================

let productos = JSON.parse(
    localStorage.getItem("productos")
) || [
    {
        id: 1,
        nombre: "Audífonos Bluetooth",
        categoria: "Tecnología",
        precio: 85000,
        cantidad: 15
    },
    {
        id: 2,
        nombre: "Camiseta deportiva",
        categoria: "Ropa",
        precio: 45000,
        cantidad: 8
    },
    {
        id: 3,
        nombre: "Café colombiano",
        categoria: "Alimentos",
        precio: 28000,
        cantidad: 20
    }
];

let ventas = JSON.parse(
    localStorage.getItem("ventas")
) || [];


// ========================================
// GUARDAR DATOS
// ========================================

function guardarDatos() {

    localStorage.setItem(
        "productos",
        JSON.stringify(productos)
    );

    localStorage.setItem(
        "ventas",
        JSON.stringify(ventas)
    );
}


// ========================================
// MOSTRAR PRODUCTOS
// ========================================

function mostrarProductos() {

    const tabla = document.getElementById("tablaProductos");

    const busqueda = document
        .getElementById("buscar")
        .value
        .toLowerCase();

    const categoria = document
        .getElementById("filtroCategoria")
        .value;

    tabla.innerHTML = "";

    const filtrados = productos.filter(producto => {

        const coincideNombre =
            producto.nombre
                .toLowerCase()
                .includes(busqueda);

        const coincideCategoria =
            categoria === "" ||
            producto.categoria === categoria;

        return coincideNombre && coincideCategoria;
    });


    filtrados.forEach(producto => {

        let estado = "";
        let clase = "";

        if (producto.cantidad === 0) {

            estado = "Agotado";
            clase = "agotado";

        } else if (producto.cantidad <= 5) {

            estado = "Stock bajo";
            clase = "bajo";

        } else {

            estado = "Disponible";
            clase = "disponible";
        }


        const fila = document.createElement("tr");

        fila.innerHTML = `

            <td>
                <strong>${producto.nombre}</strong>
            </td>

            <td>
                ${producto.categoria}
            </td>

            <td>
                $${formatearNumero(producto.precio)}
            </td>

            <td>
                ${producto.cantidad}
            </td>

            <td>
                <span class="estado ${clase}">
                    ${estado}
                </span>
            </td>

            <td>

                <div class="acciones">

                    <button
                        class="btn-vender"
                        onclick="venderProducto(${producto.id})"
                        ${producto.cantidad === 0 ? "disabled" : ""}
                    >
                        💰 Vender
                    </button>

                    <button
                        class="btn-editar"
                        onclick="editarProducto(${producto.id})"
                    >
                        ✏️
                    </button>

                    <button
                        class="btn-eliminar"
                        onclick="eliminarProducto(${producto.id})"
                    >
                        🗑️
                    </button>

                </div>

            </td>
        `;

        tabla.appendChild(fila);
    });

    actualizarEstadisticas();
}


// ========================================
// FORMATEAR NUMERO
// ========================================

function formatearNumero(numero) {

    return Number(numero).toLocaleString("es-CO");
}


// ========================================
// ESTADISTICAS
// ========================================

function actualizarEstadisticas() {

    const totalProductos = productos.length;

    const totalUnidades = productos.reduce(
        (total, producto) =>
            total + Number(producto.cantidad),
        0
    );

    const valorInventario = productos.reduce(
        (total, producto) =>
            total +
            Number(producto.precio) *
            Number(producto.cantidad),
        0
    );

    const stockBajo = productos.filter(
        producto => producto.cantidad <= 5
    ).length;


    document.getElementById("totalProductos")
        .textContent = totalProductos;

    document.getElementById("totalUnidades")
        .textContent = totalUnidades;

    document.getElementById("valorInventario")
        .textContent =
        "$" + formatearNumero(valorInventario);

    document.getElementById("stockBajo")
        .textContent = stockBajo;
}


// ========================================
// MODAL
// ========================================

function abrirModal() {

    document
        .getElementById("modal")
        .classList.add("activo");

    document
        .getElementById("formProducto")
        .reset();

    document
        .getElementById("productoId")
        .value = "";

    document
        .getElementById("tituloModal")
        .textContent = "Agregar producto";
}


function cerrarModal() {

    document
        .getElementById("modal")
        .classList.remove("activo");
}


// ========================================
// AGREGAR / EDITAR PRODUCTO
// ========================================

document
    .getElementById("formProducto")
    .addEventListener("submit", function(e) {

        e.preventDefault();

        const id =
            document.getElementById("productoId").value;

        const nombre =
            document.getElementById("nombre").value;

        const categoria =
            document.getElementById("categoria").value;

        const precio =
            Number(document.getElementById("precio").value);

        const cantidad =
            Number(document.getElementById("cantidad").value);


        if (id) {

            const producto =
                productos.find(p => p.id == id);

            producto.nombre = nombre;
            producto.categoria = categoria;
            producto.precio = precio;
            producto.cantidad = cantidad;

        } else {

            const nuevoProducto = {

                id: Date.now(),

                nombre: nombre,

                categoria: categoria,

                precio: precio,

                cantidad: cantidad
            };

            productos.push(nuevoProducto);
        }


        guardarDatos();

        mostrarProductos();

        cerrarModal();
    });


// ========================================
// EDITAR
// ========================================

function editarProducto(id) {

    const producto =
        productos.find(p => p.id === id);

    if (!producto) return;


    document.getElementById("productoId")
        .value = producto.id;

    document.getElementById("nombre")
        .value = producto.nombre;

    document.getElementById("categoria")
        .value = producto.categoria;

    document.getElementById("precio")
        .value = producto.precio;

    document.getElementById("cantidad")
        .value = producto.cantidad;


    document.getElementById("tituloModal")
        .textContent = "Editar producto";


    document
        .getElementById("modal")
        .classList.add("activo");
}


// ========================================
// ELIMINAR
// ========================================

function eliminarProducto(id) {

    const producto =
        productos.find(p => p.id === id);

    if (!producto) return;


    const confirmar = confirm(
        `¿Quieres eliminar "${producto.nombre}"?`
    );

    if (!confirmar) return;


    productos = productos.filter(
        p => p.id !== id
    );

    guardarDatos();

    mostrarProductos();
}


// ========================================
// VENDER
// ========================================

function venderProducto(id) {

    const producto =
        productos.find(p => p.id === id);

    if (!producto) return;


    if (producto.cantidad <= 0) {

        alert("Este producto está agotado.");

        return;
    }


    const cantidad = prompt(
        `¿Cuántas unidades de "${producto.nombre}" deseas vender?`,
        "1"
    );


    if (cantidad === null) return;


    const cantidadVenta = Number(cantidad);


    if (
        !Number.isInteger(cantidadVenta) ||
        cantidadVenta <= 0
    ) {

        alert("Introduce una cantidad válida.");

        return;
    }


    if (cantidadVenta > producto.cantidad) {

        alert("No hay suficiente stock.");

        return;
    }


    producto.cantidad -= cantidadVenta;


    const venta = {

        producto: producto.nombre,

        cantidad: cantidadVenta,

        total:
            cantidadVenta *
            producto.precio,

        fecha:
            new Date().toLocaleString("es-CO")
    };


    ventas.unshift(venta);


    guardarDatos();

    mostrarProductos();

    mostrarVentas();


    alert("Venta registrada correctamente.");
}


// ========================================
// MOSTRAR VENTAS
// ========================================

function mostrarVentas() {

    const tabla =
        document.getElementById("tablaVentas");

    tabla.innerHTML = "";


    ventas.forEach(venta => {

        const fila =
            document.createElement("tr");


        fila.innerHTML = `

            <td>
                ${venta.producto}
            </td>

            <td>
                ${venta.cantidad}
            </td>

            <td>
                $${formatearNumero(venta.total)}
            </td>

            <td>
                ${venta.fecha}
            </td>

        `;


        tabla.appendChild(fila);
    });
}


// ========================================
// INICIAR SISTEMA
// ========================================

mostrarProductos();
mostrarVentas();