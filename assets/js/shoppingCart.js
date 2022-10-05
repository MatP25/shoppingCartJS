(function(){

    "use strict";

    ////////////////////////////////////////////////////////////////////
    ////////////////------------DOM ELEMENTS------------////////////////
    ////////////////////////////////////////////////////////////////////

    const 
        cartAmount = document.getElementById("cart-amount"),
        cartLabel = document.getElementById("cart-label"),
        buyBtn = document.getElementById("buyBtn"),
        clearCartBtn = document.getElementById("clearCartBtn"),
        btnsContainer = document.getElementById("btnsContainer"),
        shoppingCartCards = document.getElementById("cartCard-container"),
        cardsQty = document.getElementsByClassName("quantity"),
        totalPrice = document.getElementById("totalPrice"),
        userEmail = document.getElementById("userEmail"),
        main = document.querySelector("main");

    ///////////////////////////////////////////////////////////////////
    ///////////////------------FORM ELEMENTS------------///////////////
    ///////////////////////////////////////////////////////////////////

    const
        form = document.getElementById("paymentForm"),
        fnameValue = document.getElementById("fname").value,
        lnameValue = document.getElementById("lname").value,
        address1Value = document.getElementById("streetAdd1").value,
        address2Value = document.getElementById("streetAdd2").value,
        cityValue = document.getElementById("city").value,
        stateValue = document.getElementById("state").value,
        zipCodeValue = document.getElementById("zipCode").value,
        phoneNumValue = document.getElementById("phoneNumber").value,
        paymentOptionsRadios = form.elements.namedItem("Payment Method");

    //get the data from the local storage, if the local storage is empty set it as an empty array
    let cart = JSON.parse(localStorage.getItem("data")) || [];

    ///////////////////////////////////////////////////////////////////
    /////////////////------------FUNCTIONS------------/////////////////
    ///////////////////////////////////////////////////////////////////

    const toggleVisibility = (targetElement, displayType) => {
        targetElement.style.display = displayType;
    }

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
        toggleVisibility(btnsContainer, "none")
    }

    const incrementQty = (thisProd, cartArray) => {
        //receives an obj as parameter, assign selectedProduct to the object's id
        const selectedProduct = thisProd.id;
        //search for the object inside the cart which has an id = the id of the selected product, if no elements are found the find method returns undefined
        const searchCart = cartArray.find( el => el.id === selectedProduct );
        //if the find method returns undefined the object does not exist in the cart, therefore add it to the cart
        if (searchCart === undefined) {
            cartArray.push( {
                id: selectedProduct,
                quantity: 1,
            });
        //if the find method did not return undefined the object already exists in the cart, so increase the quantity of that object by 1
        } else {
            searchCart.quantity += 1;
        }
        //if a new product is added then there is at least 1 product in the cart therefore set the display of the buttons to flex
        if (btnsContainer) {
            toggleVisibility(btnsContainer, "flex")
        }
        //update the product quantity inside the card and the cart icon everytime the quantity increments or decrements
        updateQty(cardsQty,cart);
        updateCartInLocalStorage();
    }

    const decrementQty = (thisProd) => {
        const selectedProduct = thisProd.id;
        const searchCart = cart.find( obj => obj.id === selectedProduct );
        //if undefined (qty = 0) then there is no object with a matching id
        if (!searchCart) {
            addShakeAnimation(thisProd);
            return
        } else if (searchCart.quantity >= 1) {
            searchCart.quantity--;
        }
        
        cart = cart.filter( product => product.quantity > 0);
        updateQty(cardsQty,cart);
        updateCartInLocalStorage();
    }

    const updateQty = (elemCollection, cartArray) => {
        for (let i = 0; i < elemCollection.length; i++) {
            const thisCardID = elemCollection[i].id;
            const thisProduct = cartArray.find((product)=> product.id === thisCardID.slice(-10)) || 0;
            elemCollection[i].innerHTML = thisProduct.quantity || 0;
        }
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
        toggleVisibility(btnsContainer, "flex");
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
                    <i class="bi bi-trash removeItem"></i>
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
        cartArray.length > 0 ? 
        targetElement.innerHTML = `TOTAL: $${total}` : 
        targetElement.innerHTML = "";
        return total
    }

    const purchaseHandler = () => {
        
            window.open("./purchaseDetails.html");

            setTimeout( () => {
                resetDynamicContent();
                localStorage.removeItem("data");
            }, 500);

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

    const checkSession = () => {
        let sessionStorageData = JSON.parse(sessionStorage.getItem("email")) || [];

        if (sessionStorageData.length === 0) {
            loginAlert();
        } else {
            userEmail.innerHTML = `Welcome! ${sessionStorageData}`;
        }
    }

    const loginAlert = async () => {
        const {value: email } = await Swal.fire({
            title: 'Please enter your email before continuing',
            input: 'email',
            inputLabel: 'Your email address',
            inputPlaceholder: 'Enter your email address'
        });
        if (email) {
            Swal.fire({
                title: `Success
                Entered email: ${email}`,
                icon: 'success',
                showCloseButton: true
                });
            sessionStorage.setItem("email", JSON.stringify(email));
            userEmail.innerHTML = `Welcome! ${email}`;
        }
    }

    // const urljson = "./assets/js/json/dataCats.JSON";

    // const getJsonData = async (url, hasFilter) => {
    //     const resp = await fetch(url);
    //     const data = await resp.json();

    //     if (!hasFilter) {
    //         createProducts(shop, data, cart);
    //     } else {
    //         const filteredByName = nameFilter(data, searchBar.value.toLowerCase());
    //         const multiFiltered = multipleFilters(filteredByName, selectCategory.value, maxPriceInput.value, minPriceInput.value);
    //         createProducts(shop, multiFiltered, cart);
    //     }
    // }
    ///////////////////////////////////////////////////////////////////
    //////////////------------EVENT LISTENERS------------//////////////
    ///////////////////////////////////////////////////////////////////

    window.addEventListener("storage", () => {
        location.reload();
    });

    window.addEventListener("load", () => {
        updateCartIcon(cartAmount);
        generateCartItems(shoppingCartCards, productsData, cart);
        calculateTotalPrice(totalPrice, cart, productsData);
        checkSession();
        
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
                    incrementQty(thisProduct, cart);
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

    buyBtn.addEventListener("click", (evt) => {
        evt.preventDefault();
        Swal.fire({
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirm',
            titleText: "Verify your information",
            html: `<p class="alert__text"> <strong> Total:</strong> $${calculateTotalPrice(totalPrice, cart, productsData)}</p>
            <p class="alert__text"><strong>Name:</strong> ${fnameValue} ${lnameValue}</p>
            <p class="alert__text"><strong>Address:</strong> ${address1Value}, ${address2Value} </p>
            <p class="alert__text"><strong>City & State:</strong> ${cityValue}, ${stateValue} </p>
            <p class="alert__text"><strong>Zip Code:</strong> ${zipCodeValue}</p>
            <p class="alert__text"><strong>Phone: </strong> ${phoneNumValue} </p>
            <p class="alert__text"><strong>Payment Option:</strong> ${paymentOptionsRadios.value}</p>`,

        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: `Order Confirmed
                    Thank you for your purchase!`,
                    timer: 5000,
                    icon: 'success',
                    showCloseButton: true
                });
                if (cart.length !==0) {
                    setTimeout( () => {
                        purchaseHandler();
                    }, 2500);
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'There are no items in your cart!',
                        footer: '<a class="alert__link" href="../index.html">Go back to the main page to add items</a>'
                    })
                }
                
            } 
        });
    });
    
})()