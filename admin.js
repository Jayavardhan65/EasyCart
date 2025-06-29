document.addEventListener("DOMContentLoaded", () => {
    const productForm = document.getElementById("product-form");
    const productList = document.getElementById("product-list");
    let products = JSON.parse(localStorage.getItem("products")) || [];

    function updateProductList() {
        productList.innerHTML = "";
        products.forEach((product, index) => {
            let row = document.createElement("tr");
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.price}</td>
                <td><img src="${product.image}" alt="Product"></td>
                <td>
                    <button class="delete-btn" data-index="${index}">Delete</button>
                </td>
            `;
            productList.appendChild(row);
        });

        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", (event) => {
                let index = event.target.getAttribute("data-index");
                products.splice(index, 1);
                localStorage.setItem("products", JSON.stringify(products));
                updateProductList();
            });
        });
    }

    productForm.addEventListener("submit", (event) => {
        event.preventDefault();
        let name = document.getElementById("product-name").value;
        let price = document.getElementById("product-price").value;
        let image = document.getElementById("product-image").value;

        if (!name || !price || !image) {
            alert("Please fill all fields!");
            return;
        }

        products.push({ name, price, image });
        localStorage.setItem("products", JSON.stringify(products));

        document.getElementById("product-form").reset();
        updateProductList();
    });

    updateProductList();
});
