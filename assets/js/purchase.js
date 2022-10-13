(function () {

    const 
        purchaseDetailsContainer = document.getElementById("successfulPurchase"),
        purchaseDetails = document.getElementById("purchaseDetails"),
        noProductsDiv = document.getElementById("noProducts");

    let purchaseInformation = JSON.parse(localStorage.getItem("purchaseInfo")) || [];

    const calcTotal = (arr, keyName) => arr.map( (obj) => obj[keyName]).reduce( (a,b) => a + b, 0).toFixed(2);

    if (purchaseInformation.length !== 0) {

        purchaseDetailsContainer.style.display = "inline-block";

        setTimeout( () => {
            localStorage.clear();
        }, 500); 

        return (purchaseDetails.innerHTML = purchaseInformation.map( (product) => {
            let {name, price, qty, subtotal} = product;
            return `<li>
                        <p>Product: ${name.slice(0,50)}...</p>
                        <p>Price:  $${price}</p>
                        <p>Quantity: ${qty}</p>
                        <p>Subtotal: $${subtotal}</p>
                    </li>`
                    
        }).join("") + `<h4>Total: $${calcTotal(purchaseInformation, "subtotal")}</h4>`);

    } else {
        noProductsDiv.style.display = "block";
    }

})();

