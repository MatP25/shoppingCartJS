(function() {
    
    "use strict";

    const 
        shop = document.getElementById("shop"),
        cartAmount = document.getElementById("cart-amount"),
        cartLabel = document.getElementById("cart-label"),
        buyBtn = document.getElementById("buyBtn"),
        clearCartBtn = document.getElementById("clearCartBtn"),
        btnsContainer = document.getElementById("btnsContainer"),
        shoppingCartCards = document.getElementById("cartCard-container"),
        cardsQty = document.getElementsByClassName("quantity"),
        totalPrice = document.getElementById("totalPrice");

    //get the data from the local storage, but if the local storage is empty set it as an empty array
    let cart = JSON.parse(localStorage.getItem("data")) || [];

    //////////////------------FUNCTIONS------------//////////////

    const cleanCartContent = () => {
        cart = [];
        cartLabel.innerHTML = "Cart is empty";
        totalPrice.innerHTML = "";
        shoppingCartCards.innerHTML = "";
        cartAmount.innerHTML = 0;
        for (let i=0;i<cardsQty.length;i++) {
            cardsQty[i].innerHTML = 0;
        }
        btnsContainer.style.display = "none";
    }

    const createProducts = () => {
        //the map function will go over every object in productsData and for every object it will return a new piece of html
        return (shop.innerHTML = productsData.map( 
            (element) => {
            // object deconstructing, makes calling the object properties easier by avoiding having to type the object name before the property (object.property)
            let {id, name, price, details, imgSrc} = element;
            //search inside the products inside the cart, if there are zero products return an empty array
            //then assign the product's quantity retrieved from the array to the quantity value inside the card, or in case the product doesn't exist inside the cart (if the array is empty searchCart.quantity will be undefined) then let the value be 0
            let searchCart = cart.find ( product => product.id === ("product" + id)) || [];
    
            return `<div id="product${id}" class="card">
            <img src=${imgSrc} alt="">
                <div class="card__details">
                    <h3>${name}</h3>
                    <p>${details}</p>
                    <div class="card__price">
                        <p>$${price}</p>
                        <div class="card__buttons">
                            <i class="bi bi-dash decrementQty"></i>
                            <span id="qtyIDproduct${id}"class="quantity">${searchCart.quantity === undefined ? 0 : searchCart.quantity}</span>
                            <i class="bi bi-plus incrementQty"></i>
                        </div>
                    </div>
                </div>
            </div>`
        }).join("")) //the join method will remove the commas that separate the objects in the array by creating a single string with every element concatenated
    }

    const incrementQty = (thisProd) => {
        // an object is passed as argument, assign selectedProduct to the object's id
        const selectedProduct = thisProd.id;
        //search for the object inside the cart which has an id = the id of the selected product, if no elements are found the find method returns undefined
        const searchCart = cart.find( el => el.id === selectedProduct );
        //if the find method returns undefined the object does not exist in the cart, therefore add it to the cart
        if (searchCart === undefined) {
            cart.push( {
                id: selectedProduct,
                quantity: 1,
            });
        //if the find method did not return undefined the object already exists in the cart, so increase the quantity of that object by 1
        } else {
            searchCart.quantity += 1;
        }
        //if a new product is added then there is at least 1 product in the cart therefore set the display of the buttons to flex
        btnsContainer.style.display = "flex";
        //update the product quantity inside the card and the cart icon everytime the quantity increments or decrements
        updateQty(selectedProduct);
        localStorage.setItem("data", JSON.stringify(cart));
    }

    const decrementQty = (thisProd) => {
        const selectedProduct = thisProd.id;
        const searchCart = cart.find( obj => obj.id === selectedProduct );
        //if undefined then there is no object with a matching id, so do nothing
        if (searchCart === undefined) {
            addShakeAnimation(thisProd);
            return
        }
        else if (searchCart.quantity <= 1) {
            cart = cart.filter(product => product.id !== selectedProduct);
        } else {
            //if the objects exists in the cart but the quantity is not 1, then decrease by 1
            searchCart.quantity -= 1;
        }
        updateQty(selectedProduct);
        cart = cart.filter(product => product.quantity !== 0);
        localStorage.setItem("data", JSON.stringify(cart));
    }

    const addShakeAnimation = (targetProduct) => {
        targetProduct.className += " shake-horizontal";

        setTimeout( () => {
            targetProduct.classList.remove("shake-horizontal")
        }, 700);
    }

    const updateQty = (id) => {
        //find inside the cart the object that matches the id passed as argument by the increment or decrement functions
        const searchCart = cart.find( (obj) => obj.id === id );
        //if there is no match the object does not exist in the cart so set the quantity inside the corresponding product card to 0
        //if the object is found then set the quantity inside the corresponding product card to the quantity of the object

        searchCart === undefined ? document.getElementById(`qtyID${id}`).innerHTML = 0 : document.getElementById(`qtyID${id}`).innerHTML = searchCart.quantity;

        updateCartIcon(cartAmount);
        calculateTotalPrice(cart);
        generateCartItems();
    }

    const removeProduct = (prod) => {
        let foundProduct = cart.find ((obj) => obj.id === prod.id);
        foundProduct.quantity = 0;
        decrementQty(prod);
    }

    const calcAmount = (arr, keyName) => {
        return arr.map( (obj) => obj[keyName]).reduce( (a,b) => a + b, 0);
    }

    const updateCartIcon = (targetElement) => {
        targetElement.innerHTML = calcAmount(cart, "quantity");
    }

    const generateCartItems = () => {
        //if the cart is not empty
        if (cart.length !== 0) {
            btnsContainer.style.display = "flex";
            cartLabel.innerHTML = "My shopping cart";
            // go through every object in the cart with a .map
            return (shoppingCartCards.innerHTML = cart.map( (productCart) => {
                    //find the objects inside productsData with a matching id to the id of the objects in the cart so the object's properties can be accessed to construct the cards
                    let { id, quantity } = productCart;
                    let search = productsData.find( (product) => ("product" + product.id) === id) || [];

                return `<div class="cartCard" id="product${search.id}">
                <img src=${search.imgSrc} class="cartCard__img" alt="">
                <div class="cartCard__details">
                    <h3> ${search.name}<span class="cartCard__price" id="">$${search.price}</span></h3>
                    <i class="bi bi-x-lg removeItem"></i>
                    <div class="card__buttons">
                        <i class="bi bi-dash decrementQty"></i>
                        <span id=""class="quantity">${quantity}</span>
                        <i class="bi bi-plus incrementQty"></i>
                    </div>
                    <p class="cartCard__subtotal">Subtotal: $${quantity * search.price}</p>
                </div>
            </div>`
            }).join(""));
        } else {
            cleanCartContent();
        }
    }

    const calculateTotalPrice = (arr) => {
        let total = 0;
        arr.map(productCart => {
            let {id, quantity} = productCart;
            let searchData = productsData.find( (product) => ("product" + product.id) === id) || [];
            total += searchData.price * quantity;
        });

        arr.length > 0 ? totalPrice.innerHTML = `TOTAL: $${total}` : totalPrice.innerHTML = "";

        return total
    }


    //////////////------------EVENT LISTENERS------------//////////////

    window.addEventListener("load", () => {
        createProducts();
        updateCartIcon(cartAmount);
        generateCartItems();
        calculateTotalPrice(cart);
    });

    //SO-1687296 - dom delegation https://javascript.info/event-delegation
    shop.addEventListener("click", evt => {
        if (evt.target && evt.target.nodeName == "I") {
            let thisProduct = evt.target.closest('.card');
            let classes = evt.target.className.split(" ");
            if (classes) {
                for (let i=0; i<classes.length; i++) {
                    if (classes[i] == "incrementQty") {
                    incrementQty(thisProduct);
                    } else if (classes[i] == "decrementQty") {
                        decrementQty(thisProduct);
                    }
                }
            }
        }
    });

    shoppingCartCards.addEventListener("click", evt => {
        if (evt.target && evt.target.nodeName == "I") {
            let thisProduct = evt.target.closest('.cartCard');
            let classes = evt.target.className.split(" ");
            if (classes) {
                for (let i=0; i<classes.length; i++) {
                    if (classes[i] == "incrementQty") {
                    incrementQty(thisProduct);
                    } else if (classes[i] == "decrementQty") {
                        decrementQty(thisProduct);
                    } else if (classes[i] == "removeItem") {
                        thisProduct.className += " scale-out-hor-right";
                        setTimeout(() => {removeProduct(thisProduct)}, 1000);
                    }
                }
            }
        }
    });

    clearCartBtn.addEventListener("click", () => {
        cleanCartContent();
        localStorage.clear();
    });

    buyBtn.addEventListener("click", () => {

        if (cart.length !==0) {

            setTimeout( () => {
                cleanCartContent();
                localStorage.removeItem("data");
            }, 250);

            let purchaseInfo = cart.map( (productCart) => {
                let { id, quantity } = productCart;
                let searchProductData = productsData.find( (product) => ("product" + product.id) === id) || [];
                return  {
                    name: searchProductData.name,
                    price: searchProductData.price,
                    qty: quantity,
                    subtotal: (quantity * searchProductData.price)
                }
            } );
            
            localStorage.setItem("purchaseInfo", JSON.stringify(purchaseInfo));
        }
    });

    
    
})();