// ======================================
// INVENTARIO DE VENTAS
// ======================================

const STORAGE_KEY = "inventario_ventas";

// Datos iniciales
let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    products: [],
    sales: [],
    totalSales: 0
};


// ======================================
// ELEMENTOS HTML
// ======================================

const productForm = document.getElementById("productForm");
const productTable = document.getElementById("productTable");
const salesList = document.getElementById("salesList");

const totalProducts = document.getElementById("totalProducts");
const totalStock = document.getElementById("totalStock");
const totalSales = document.getElementById("totalSales");

const search = document.getElementById("search");
const resetBtn = document.getElementById("resetBtn");


// ======================================
// FORMATO DE DINERO
// ======================================

function formatMoney(value) {

    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(value);

}


// ======================================
// GUARDAR DATOS
// ======================================

function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

}


// ======================================
// ESCAPAR HTML
// ======================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ======================================
// MOSTRAR INVENTARIO
// ======================================

function renderProducts() {

    const searchText = search.value
        .toLowerCase()
        .trim();

    const products = data.products.filter(product =>
        product.name
            .toLowerCase()
            .includes(searchText)
    );


    if (products.length === 0) {

        productTable.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    No hay productos registrados.
                </td>
            </tr>
        `;

        return;
    }


    productTable.innerHTML = products.map(product => {

        let status;

        if (product.stock > 0) {

            status = `
                <span class="badge available">
                    Disponible
                </span>
            `;

        } else {

            status = `
                <span class="badge out">
                    Agotado
                </span>
            `;

        }


        return `
            <tr>

                <td>
                    <strong>
                        ${escapeHTML(product.name)}
                    </strong>
                </td>

                <td>
                    ${formatMoney(product.price)}
                </td>

                <td>
                    ${product.stock}
                </td>

                <td>
                    ${status}
                </td>

                <td>

                    <div class="actions">

                        <button
                            class="btn-sell"
                            onclick="sellProduct('${product.id}')"
                            ${product.stock <= 0 ? "disabled" : ""}
                        >
                            🛒 Vender
                        </button>

                        <button
                            class="btn-delete"
                            onclick="deleteProduct('${product.id}')"
                        >
                            🗑️
                        </button>

                    </div>

                </td>

            </tr>
        `;

    }).join("");

}


// ======================================
// MOSTRAR PRODUCTOS VENDIDOS
// ======================================

function renderSales() {

    if (data.sales.length === 0) {

        salesList.innerHTML = `
            <div class="empty">
                Todavía no hay productos vendidos.
            </div>
        `;

        return;
    }


    const sales = [...data.sales].reverse();


    salesList.innerHTML = sales.map(sale => {

        return `
            <div class="sale">

                <div>

                    <strong>
                        ${escapeHTML(sale.name)}
                    </strong>

                    <br>

                    <small>
                        ${sale.date}
                    </small>

                </div>

                <span class="sale-price">
                    ${formatMoney(sale.price)}
                </span>

            </div>
        `;

    }).join("");

}


// ======================================
// ACTUALIZAR RESUMEN
// ======================================

function renderSummary() {

    totalProducts.textContent =
        data.products.length;


    const stock = data.products.reduce(
        (total, product) =>
            total + product.stock,
        0
    );

    totalStock.textContent = stock;


    totalSales.textContent =
        formatMoney(data.totalSales);

}


// ======================================
// ACTUALIZAR TODO
// ======================================

function render() {

    renderProducts();

    renderSales();

    renderSummary();

}


// ======================================
// AGREGAR PRODUCTO
// ======================================

productForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const name =
            document.getElementById("name")
                .value.trim();


        const price =
            Number(
                document.getElementById("price")
                    .value
            );


        const stock =
            Number(
                document.getElementById("stock")
                    .value
            );


        if (!name) {

            alert("Escribe el nombre del producto.");

            return;
        }


        if (price < 0) {

            alert("El precio no puede ser negativo.");

            return;
        }


        if (stock < 0) {

            alert("El stock no puede ser negativo.");

            return;
        }


        // Buscar producto existente
        const existingProduct =
            data.products.find(product =>
                product.name.toLowerCase() ===
                name.toLowerCase()
            );


        if (existingProduct) {

            // Si ya existe, aumenta el stock
            existingProduct.price = price;

            existingProduct.stock += stock;

        } else {

            // Crear producto nuevo
            data.products.push({

                id:
                    Date.now().toString() +
                    Math.random()
                        .toString(16)
                        .slice(2),

                name: name,

                price: price,

                stock: stock

            });

        }


        saveData();

        productForm.reset();

        render();

    }
);


// ======================================
// VENDER PRODUCTO
// ======================================

function sellProduct(id) {

    const product =
        data.products.find(
            product => product.id === id
        );


    if (!product) {

        return;
    }


    if (product.stock <= 0) {

        alert("Este producto está agotado.");

        return;
    }


    // Restar una unidad
    product.stock--;


    // Sumar dinero
    data.totalSales += product.price;


    // Registrar venta
    data.sales.push({

        name: product.name,

        price: product.price,

        date:
            new Date().toLocaleString("es-CO")

    });


    saveData();

    render();

}


// ======================================
// ELIMINAR PRODUCTO
// ======================================

function deleteProduct(id) {

    const product =
        data.products.find(
            product => product.id === id
        );


    if (!product) {

        return;
    }


    const confirmDelete = confirm(
        `¿Quieres eliminar "${product.name}"?`
    );


    if (!confirmDelete) {

        return;
    }


    data.products =
        data.products.filter(
            product => product.id !== id
        );


    saveData();

    render();

}


// ======================================
// BUSCAR PRODUCTOS
// ======================================

search.addEventListener(
    "input",
    function() {

        renderProducts();

    }
);


// ======================================
// RESTABLECER TODO
// ======================================

resetBtn.addEventListener(
    "click",
    function() {

        const confirmation = confirm(
            "¿Seguro que quieres borrar todo el inventario y las ventas?"
        );


        if (!confirmation) {

            return;
        }


        data = {

            products: [],

            sales: [],

            totalSales: 0

        };


        saveData();

        render();

    }
);


// ======================================
// INICIAR APLICACIÓN
// ======================================

render();s