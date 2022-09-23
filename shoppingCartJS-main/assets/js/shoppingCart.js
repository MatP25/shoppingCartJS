(function(){

    "use strict";

    const 
        cartAmount = document.getElementById("cart-amount"),
        cartLabel = document.getElementById("cart-label"),
        buyBtn = document.getElementById("buyBtn"),
        clearCartBtn = document.getElementById("clearCartBtn"),
        btnsContainer = document.getElementById("btnsContainer"),
        shoppingCartCards = document.getElementById("cartCard-container"),
        cardsQty = document.getElementsByClassName("quantity"),
        totalPrice = document.getElementById("totalPrice"),
        main = document.querySelector("main");


    //get the data from the local storage, if the local storage is empty set it as an empty array
    let cart = JSON.parse(localStorage.getItem("data")) || [];

    ///////////////////////////////////////////////////////////////////
    /////////////////------------FUNCTIONS------------/////////////////
    ///////////////////////////////////////////////////////////////////

    const updateCartInLocalStorage = () => {
        localStorage.setItem("data", JSON.stringify(cart));
    }

    const resetDynamicContent = () => {
        //reset dynamic content when clearing cart
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

    const incrementQty = (thisProd) => {
        //receives an obj as parameter, assign selectedProduct to the object's id
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
        updateQty(selectedProduct, cart);
        updateCartInLocalStorage();
    }

    const decrementQty = (thisProd) => {
        const selectedProduct = thisProd.id;
        const searchCart = cart.find( obj => obj.id === selectedProduct );
        //if undefined (qty = 0) then there is no object with a matching id
        if (!searchCart) {
            addShakeAnimation(thisProd);
            return
        } else if (searchCart.quantity <= 1) {
            cart = cart.filter(product => product.id !== selectedProduct);
        } else {
            //if the objects exists in the cart but the quantity is not 1, then decrease by 1
            searchCart.quantity--;
        }
        updateQty(selectedProduct, cart);
        updateCartInLocalStorage();
    }

    const updateQty = (productId, cartArray) => {
        //find inside the cart the object that matches the id passed as argument by the increment or decrement functions
        const searchCart = cartArray.find( (obj) => obj.id === productId );
        //if there is no matching object set the quantity inside the corresponding product card to 0
        //else set the quantity inside the corresponding product card to the quantity of the object
        // searchCart === undefined ? document.getElementById(`qtyID${productId}`).innerHTML = 0 : document.getElementById(`qtyID${productId}`).innerHTML = searchCart.quantity;

        updateCartIcon(cartAmount);
        calculateTotalPrice(totalPrice, cart, productsData);
        generateCartItems(shoppingCartCards, productsData, cart);
    }

    const removeProduct = (productObj, cartArray) => {
        //set the quantity of the product to 0 then call the decrementQty function to remove it from the cart
        let foundProduct = cartArray.find ((obj) => obj.id === productObj.id) || [];
        foundProduct.quantity = 0;
        decrementQty(productObj);
    }

    const calcAmount = (arr, keyName) => {
        //calculates the sum of values in an array, used for calculating the total number of products in the cart
        return arr.map( (obj) => obj[keyName]).reduce( (a,b) => a + b, 0);
    }

    const updateCartIcon = (targetElement) => {
        //updates the cart icon's product counter
        targetElement.innerHTML = calcAmount(cart, "quantity");
    }

    const displayCartHeader = () => {
        //change content when there are items inside the cart
        btnsContainer.style.display = "flex";
        cartLabel.innerHTML = "My shopping cart";
    }

    const generateCartItems = (targetElement, dataArray, cartArray) => {
        if (cartArray.length !== 0) {
            displayCartHeader();
            return (targetElement.innerHTML = cartArray.map( (productCart) => {
                    //find the objects inside productsData with a matching id to the id of the objects in the cart so the object's properties can be accessed to construct the cards
                    let { id, quantity } = productCart;
                    let search = dataArray.find( (product) => ("product" + product.id) === id) || [];
                //returns the card's html for every product inside the cart
                return `<div class="cartCard" id="product${search.id}">
                <img src=${'.' + search.imgSrc} class="cartCard__img" alt="">
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
            resetDynamicContent();
        }
    }

    const calculateTotalPrice = (targetElement, cartArray, dataArray) => {
        //calculates the total price for every element in the cart
        let total = 0;
        cartArray.map(productCart => {
            //finds every product in the data array with a matching id to the products in cart to access the price
            let {id, quantity} = productCart;
            let searchData = dataArray.find( (product) => ("product" + product.id) === id) || [];
            total += searchData.price * quantity;
        });
        cartArray.length > 0 ? targetElement.innerHTML = `TOTAL: $${total}` : targetElement.innerHTML = "";
    }

    ///////////////////////////////////////////////////////////////////
    //////////////------------EVENT LISTENERS------------//////////////
    ///////////////////////////////////////////////////////////////////
    window.addEventListener("storage", () => {
        location.reload();
    })

    window.addEventListener("load", () => {
        updateCartIcon(cartAmount);
        generateCartItems(shoppingCartCards, productsData, cart);
        calculateTotalPrice(totalPrice, cart, productsData);
    });

    main.addEventListener("click", evt => {
        //SO-1687296 - dom delegation https://javascript.info/event-delegation
        if (evt.target && evt.target.nodeName == "I") {
            //assigns thisProduct to whichever element doesn't return nullish
            let thisProduct = evt.target.closest(".card") ?? evt.target.closest('.cartCard');
            let classes = evt.target.className.split(" ");
            if (classes) {
                for (let i=0; i<classes.length; i++) {
                    if (classes[i] == "incrementQty") {
                    incrementQty(thisProduct);
                    } else if (classes[i] == "decrementQty") {
                        decrementQty(thisProduct);
                    } else if (classes[i] == "removeItem") {
                        thisProduct.className += " scale-out-hor-right";
                        setTimeout(() => {removeProduct(thisProduct, cart)}, 500);
                    }
                }
            }
        }
    });

    clearCartBtn.addEventListener("click", () => {
        resetDynamicContent();
        localStorage.clear();
    });

    buyBtn.addEventListener("click", () => {

        if (cart.length !==0) {

            setTimeout( () => {
                resetDynamicContent();
                localStorage.removeItem("data");
            }, 0);

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

})()