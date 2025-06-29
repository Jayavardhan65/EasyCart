document.addEventListener("DOMContentLoaded", () => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartItemsContainer = document.getElementById("cart-items");
    const totalPriceElement = document.getElementById("total-price");

    function updateCart() {
        cartItemsContainer.innerHTML = "";
        let total = 0;
        cart.forEach((item, index) => {
            let row = document.createElement("tr");

            row.innerHTML = `
                <td><img src="${item.image}" width="50" alt="Product Image"> ${item.name}</td>
                <td>${item.price}</td>
                <td><button class="remove-btn" data-index="${index}">Remove</button></td>
            `;

            cartItemsContainer.appendChild(row);
            total += Number(item.price.replace(/[^\d.]/g, ""));
        });

        totalPriceElement.innerText = `₹${total.toFixed(2)}`;
    }

    // Remove item from cart
    cartItemsContainer.addEventListener("click", (event) => {
        if (event.target.classList.contains("remove-btn")) {
            let index = event.target.getAttribute("data-index");
            cart.splice(index, 1);
            localStorage.setItem("cart", JSON.stringify(cart));
            updateCart();
        }
    });

    // Clear Cart
    document.getElementById("clear-cart").addEventListener("click", () => {
        localStorage.removeItem("cart");
        cart = [];
        updateCart();
    });

    updateCart();
});
