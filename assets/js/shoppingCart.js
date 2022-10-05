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
        openLoginModalBtn = document.getElementById("openLoginModal"),
        loginModal = document.getElementById("loginModal"),
        loginBtn = document.getElementById("loginBtn"),
        closeLoginBtn = document.getElementById("closeLoginBtn"),
        emailInput = document.getElementById("loginEmail"),
        passwordInput = document.getElementById("loginPassword"),
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

    
    const openModal = () => {
            loginModal.classList.remove("hidden");
            loginModal.className += " visibleBlock";
        }
    
    const closeModal = () => {
        loginModal.classList.remove("visibleBlock");
        loginModal.className += " hidden";
    }

    const toggleVisibility = (targetElement, displayType) => {
        targetElement.style.display = displayType;
    }

    const updateCartInLocalStorage = () => {
        localStorage.setItem("data", JSON.stringify(cart));

        if (cart.length === 0) {
            resetDynamicContent();
        }
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
        toggleVisibility(btnsContainer, "none");
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
        updateCards();
        updateCartInLocalStorage();
    }

    const decrementQty = (thisProd) => {
        //get the id of the object
        const thisID = thisProd.id;
        //find the product with matching id
        const matchingProduct = cart.find( obj => obj.id === thisID );
        //if undefined (qty = 0) then there is no object with a matching id
        if (!matchingProduct) {
            return
        } else if (matchingProduct.quantity === 1) {
            matchingProduct.quantity--;
            //if the quantity is 1, the next time it decreases it will remove the card
            removeCard(thisProd);
        } else if (matchingProduct.quantity > 1) {
            matchingProduct.quantity--;
        }
        //filters from the cart all products with a quantity of 0;
        cart = cart.filter( product => product.quantity > 0);
        updateCards();
        updateCartInLocalStorage();
    }

    const updateCards = () => {
        //updates the item counter in the cart icon
        updateCartIcon(cartAmount);
        //calculates and updates the total price
        calculateTotalPrice(totalPrice, cart, urljson);
        //renders all cards with the updated content (quantity & subtotal)
        //need to find a way to update the content without re-rendering every card again
        getJsonData(urljson);
    }

    const removeProduct = (productObj, cartArray) => {
        //find the product inside the cart that matches the id of the obj passed as parameter
        let foundProduct = cartArray.find ((obj) => obj.id === productObj.id) || [];
        //set the quantity of that item to 0
        foundProduct.quantity = 0;
        //filter the cart array to remove all products with 0 quantity
        cart = cart.filter( product => product.quantity > 0);
        //removes the card obj from the html
        removeCard(productObj);
        updateCards();
        updateCartInLocalStorage();
    }

    const removeCard = (productObj) => {
        //removes the object passed as parameter
        productObj.remove();
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
                    //find the objects inside data array with a matching id to the id of the objects in the cart, so the object's properties can be accessed to construct the cards
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
                        <span id="qtyID${id}" class="quantity">${quantity}</span>
                        <i class="bi bi-plus incrementQty"></i>
                    </div>
                    <p class="cartCard__subtotal">Subtotal: $${(quantity * search.price).toFixed(2)}</p>
                </div>
            </div>`
            }).join(""));
        } else {
            resetDynamicContent();
        }
    }

    const calculateTotalPrice = async (targetElement, cartArray, dataUrl) => {

        const resp = await fetch(dataUrl);
        const data = await resp.json();

        //calculates the total price for every element in the cart
        let total = 0;
        cartArray.map(productCart => {
            //finds every product in the data array with a matching id to the products in cart to access the price
            let {id, quantity} = productCart;
            let searchData = data.find( (product) => ("product" + product.id) === id) || [];
            total += searchData.price * quantity;
        });
        cartArray.length > 0 ? 
        targetElement.innerHTML = `TOTAL: $${total.toFixed(2)}` : 
        targetElement.innerHTML = "";
        return total.toFixed(2)
    }

    const purchaseHandler = async (dataUrl) => {
        //NOT WORKING!!!
            const resp = await fetch(dataUrl);
            const data = await resp.json();

            window.open("./purchaseDetails.html");

            setTimeout( () => {
                resetDynamicContent();
                localStorage.removeItem("data");
            }, 500);

            let purchaseInfo = cart.map( (productCart) => {
                let { id, quantity } = productCart;
                let searchProductData = data.find( (product) => ("product" + product.id) === id) || [];
                return  {
                    name: searchProductData.name,
                    price: searchProductData.price,
                    qty: quantity,
                    subtotal: (quantity * searchProductData.price)
                }
            } );
            
            localStorage.setItem("purchaseInfo", JSON.stringify(purchaseInfo));
        
    }

    const urljson = "../assets/js/json/data.JSON";

    const getJsonData = async (url) => {
        const resp = await fetch(url);
        const data = await resp.json();
        generateCartItems(shoppingCartCards, data, cart);
    }

    const confirmationPopup = async () => {
        let totalPriceValue = await calculateTotalPrice(totalPrice, cart, urljson);
        confirmationAlert(totalPriceValue);
    } 

    const confirmationAlert = (totalValue) => {
        Swal.fire({
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirm',
            titleText: "Verify your information",
            html: `<p class="alert__text"> <strong> Total:</strong> $ ${totalValue}</p>
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
    }

    const fakeLoginValidation = (email, passw) => {
        const validUserEmail = "user@email.com";
        const validUserPassword = "password";

        if (email !== validUserEmail) {
            emailInput.className += " invalidInput";
        } else {
            if (passw !== validUserPassword) {
                passwordInput.className += " invalidInput";
            } else {
                return true
            }
        }
        return false
    }

    const checkLoginState = () => {
        let loginState = localStorage.getItem("loginState");
        if (loginState === "true") {
            openLoginModalBtn.innerHTML = "Logout";
        } else {
            openLoginModalBtn.innerHTML = "Login";
        }
        return loginState
    }
    ///////////////////////////////////////////////////////////////////
    //////////////------------EVENT LISTENERS------------//////////////
    ///////////////////////////////////////////////////////////////////

    window.addEventListener("storage", () => {
        location.reload();
    });

    window.addEventListener("load", () => {
        updateCartIcon(cartAmount);
        getJsonData(urljson);
        calculateTotalPrice(totalPrice, cart, urljson);
        checkLoginState();

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

        if (checkLoginState() === "false") {
            Swal.fire({
                title: 'Please Login before continuing',
                icon: 'info',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Confirm'
            });
        } else {
            confirmationPopup();
        }
    });
    
    window.addEventListener("click", (evt) => {
        if (evt.target == loginModal) {
            closeModal();
        }
    });

    closeLoginBtn.addEventListener("click", closeModal);

    loginBtn.addEventListener("click", (evt) => {
        evt.preventDefault();
        emailInput.className = "";
        passwordInput.className = "";

        if (fakeLoginValidation(emailInput.value, passwordInput.value)) {
            localStorage.setItem("loginState", true);
            closeModal();
            Swal.fire('Login successful!', 'Reloading the page...', 'success').then(
                setTimeout( () => { location.reload(); }, 1000 ));
        } else {
            localStorage.setItem("loginState", false);
        }
    });

    openLoginModalBtn.addEventListener("click", (evt) => {
        
        if (checkLoginState() === "true") {
            evt.preventDefault();
            localStorage.setItem("loginState", false);
            Swal.fire('Logged out!', 'Reloading the page...', 'info').then(
                setTimeout( () => { location.reload(); }, 1000)
            );
        } else if (checkLoginState() === "false"){
            openModal();
        }

        checkLoginState();
    });

})()