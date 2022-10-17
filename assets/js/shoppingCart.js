(function(){

    "use strict";

    ////////////////////////////////////////////////////////////////////
    ////////////////------------DOM ELEMENTS------------////////////////
    ////////////////////////////////////////////////////////////////////
    const 
        cartAmount = document.getElementById("cart-amount"),
        cartLabel = document.getElementById("cart-label"),
        btnsContainer = document.getElementById("btnsContainer"),
        shoppingCartCards = document.getElementById("cartCard-container"),
        cardsQty = document.getElementsByClassName("quantity"),
        totalPrice = document.getElementById("totalPrice"),
        openLoginModalBtn = document.getElementById("openLoginModal"),
        loginModal = document.getElementById("loginModal"),
        emailInput = document.getElementById("loginEmail"),
        passwordInput = document.getElementById("loginPassword");
    ///////////////------------FORM ELEMENTS------------///////////////
    const
        form = document.getElementById("paymentForm"),
        paymentOptionsRadios = form.elements.namedItem("Payment Method");

    //get the data from the local storage, if the local storage is empty set it as an empty array
    let cart = JSON.parse(localStorage.getItem("data")) || [];
    let loginState = localStorage.getItem("loginState") || false;

    //JSON DATA
    const urljson = "../assets/js/json/data.JSON";

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
        if (cart.length === 0) { resetDynamicContent(); }
    }

    const resetDynamicContent = () => {
        //reset dynamic content when clearing cart
        cart = [];
        cartLabel.innerHTML = "Cart is empty";
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
        if (btnsContainer) { toggleVisibility( btnsContainer, "flex" ) }
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

    //removes the object passed as parameter
    const removeCard = (productObj) => { productObj.remove(); }

    //calculates the sum of values in an array, used for calculating the total number of products in the cart
    const calcAmount = (arr, keyName) => {
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
        targetElement.innerHTML = "TOTAL: $0";

        return total.toFixed(2)
    }

    const purchaseHandler = async (dataUrl, userInfo) => {

            const resp = await fetch(dataUrl);
            const data = await resp.json();

            window.open("./purchaseDetails.html");

            setTimeout( () => {
                resetDynamicContent();
                localStorage.removeItem("data");
            }, 0);

            const purchaseInfo = cart.map( (productCart) => {
                let { id, quantity } = productCart;
                let searchProductData = data.find( (product) => ("product" + product.id) === id) || [];
                return  {
                    name: searchProductData.name,
                    price: searchProductData.price,
                    qty: quantity,
                    subtotal: (quantity * searchProductData.price)
                }
            } );
            localStorage.setItem("userInfo", JSON.stringify(userInfo));
            localStorage.setItem("purchaseInfo", JSON.stringify(purchaseInfo));
        
    }

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
        const
            fname = document.getElementById("fname"),
            lname = document.getElementById("lname"),
            address1 = document.getElementById("streetAdd1"),
            address2 = document.getElementById("streetAdd2"),
            city = document.getElementById("city"),
            state = document.getElementById("state"),
            zipCode = document.getElementById("zipCode"),
            phoneNum = document.getElementById("phoneNumber"),
            emailAddress = document.getElementById("emailAddress");

        Swal.fire({
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirm',
            titleText: "Verify your information",
            html: `<p class="alert__text"> <strong> Total:</strong> $ ${totalValue}</p>
            <p class="alert__text"><strong>Name:</strong> ${fname.value} ${lname.value}</p>
            <p class="alert__text"><strong>Email:</strong> ${emailAddress.value}</p>
            <p class="alert__text"><strong>Address:</strong> ${(address2.value ? address1.value + ", " + address2.value : address1.value)} 
            </p>
            <p class="alert__text"><strong>City & State:</strong> ${city.value}, ${state.value} </p>
            <p class="alert__text"><strong>Zip Code:</strong> ${zipCode.value}</p>
            <p class="alert__text"><strong>Phone: </strong> ${phoneNum.value} </p>
            <p class="alert__text"><strong>Payment Option:</strong> ${paymentOptionsRadios.value}</p>`,

        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: `Order Confirmed
                    Thank you for your purchase!`,
                    text: "redirecting the page...",
                    timer: 5000,
                    icon: 'success',
                    showCloseButton: true
                });
                if ( cart.length !== 0 ) {
                    setTimeout( () => {
                        const userInfo = {
                            fname: fname.value,
                            lname: lname.value,
                            email: emailAddress.value,
                            address1: address1.value,
                            address2: address2.value,
                            city: city.value,
                            state: state.value,
                            zipCode: zipCode.value,
                            phoneNum: phoneNum.value,
                            paymentOption: paymentOptionsRadios.value
                        };
                        purchaseHandler(urljson, userInfo);
                    }, 2500);
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
        loginState = localStorage.getItem("loginState") || false;
        if (loginState === "true") {
            openLoginModalBtn.innerHTML = "Logout";
        } else {
            openLoginModalBtn.innerHTML = "Login";
        }
        return loginState
    }

    const closeNavMenu = () => {
        document.getElementById("page-nav-toggle").checked = false;
    }
    ///////////////////////////////////////////////////////////////////
    //////////////------------EVENT LISTENERS------------//////////////
    ///////////////////////////////////////////////////////////////////

    window.addEventListener("storage", () => { location.reload(); });

    window.addEventListener("load", () => {
        updateCartIcon(cartAmount);
        getJsonData(urljson);
        calculateTotalPrice(totalPrice, cart, urljson);
        checkLoginState();
    });

    document.querySelector("main").addEventListener("click", evt => {
        //SO-1687296 - dom delegation https://javascript.info/event-delegation
        if (evt.target && evt.target.nodeName == "I") {
            let thisProduct = evt.target.closest('.cartCard');
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

    document.getElementById("clearCartBtn").addEventListener("click", () => {
        resetDynamicContent();
        localStorage.clear();
    });

    document.getElementById("buyBtn").addEventListener("click", evt => {
        evt.preventDefault();
        checkLoginState();

        if (checkLoginState() === "false") {
            Swal.fire({
                title: 'Please Login before continuing',
                icon: 'info',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Confirm'
            });
        } else {
            if (cart.length === 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'There are no items in your cart!',
                    footer: '<a class="alert__link" href="../index.html">Go back to the main page to add items</a>'
                })
            } else {
                if ( checkForm() && form.reportValidity() ) { confirmationPopup(); }
            }
            
        }
    });
    
    window.addEventListener("click", (evt) => {
        if ( evt.target == loginModal ) { closeModal(); }
    });

    document.getElementById("closeLoginBtn").addEventListener("click", closeModal);

    document.getElementById("loginBtn").addEventListener("click", evt => {
        evt.preventDefault();
        emailInput.className = "";
        passwordInput.className = "";

        if (fakeLoginValidation(emailInput.value, passwordInput.value)) {
            localStorage.setItem("loginState", true);
            closeModal();
            Swal.fire('Login successful!', 'Reloading the page...', 'success').then(
                setTimeout( () => { location.reload(); }, 1500 ));
        } else {
            localStorage.setItem("loginState", false);
        }
    });

    openLoginModalBtn.addEventListener("click", evt => {
        
        if (checkLoginState() === "true") {
            evt.preventDefault();
            localStorage.setItem("loginState", false);
            Swal.fire('Logged out!', 'Reloading the page...', 'info').then(
                setTimeout( () => { location.reload(); }, 1500)
            );
        } else {
            openModal();
        }

        checkLoginState();
    });

    document.getElementById("paymentOptionFieldset").addEventListener("change", () => {
        if (paymentOptionsRadios.value === "Credit Card") {
            document.getElementById("ccNumber").removeAttribute("disabled");
            document.getElementById("ccCode").removeAttribute("disabled");
        } else {
            document.getElementById("ccNumber").setAttribute("disabled", "disabled");
            document.getElementById("ccCode").setAttribute("disabled", "disabled");
        }
    });

    document.getElementById("catProductsLink").addEventListener("click", evt => {
        evt.preventDefault();
        sessionStorage.setItem("filter", "cats");
        closeNavMenu();
        window.location.href = "../index.html";
    });

    document.getElementById("dogProductsLink").addEventListener("click", evt => {
        evt.preventDefault();
        sessionStorage.setItem("filter", "dogs");
        closeNavMenu();
        window.location.href = "../index.html";
    });

    ///////////////////////////////////////////////////////////////////
    //////////////------------FORM VALIDATION------------//////////////
    ///////////////////////////////////////////////////////////////////

    //only letters, allows diacritics
    const 
        nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(([\'\,\.\- ][a-zA-ZÀ-ÿ\u00f1\u00d1 ])?[a-zA-ZÀ-ÿ\u00f1\u00d1]*)*$/,
        //only alphanumeric, allows diacritics
        addressRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(([\'\,\.\- ][0-9a-zA-ZÀ-ÿ\u00f1\u00d1 ])?[a-zA-ZÀ-ÿ\u00f1\u00d10-9]*)*$/,
        //only digits any length
        onlyDigitRegex = /^\d+$/,
        //only digits, length: 4 to 8
        zipCodeRegex = /^\d{4,8}$/,
        //only digits, length: 6 to 14
        phoneRegex = /^\d{6,14}$/,
        //only 3 digits
        CCsecurityRegex = /^\d{3}$/,
        //only digits, length: 13 to 16
        CCRegex = /^\d{13,16}$/,

        formErrors = [
        /*0*/"INVALID NAME. It may not contain any numbers or special characters and must be between 1 and 20 characters long.",
        /*1*/"INVALID ADDRESS. It may not contain any special characters and must be between 1 and 30 characters long.",
        /*2*/"INVALID CITY or STATE NAME. It may not contain any numbers or special characters and must be between 1 and 30 characters long.",
        /*3*/"INVALID ZIP CODE. It may not contain any letters or special characters and must be between 4 and 8 characters long",
        /*4*/"INVALID PHONE NUMBER. It may not contain any letters or special characters and must be between 6 and 18 characters long",
        /*5*/"INVALID EMAIL ADDRESS. Please verify that it matches the correct format: user@domain. It may not contain any blank spaces.",
        /*6*/"INVALID CREDIT CARD NUMBER. It may not contain any letters or special characters and must be between 13 and 16 characters long",
        /*7*/"INVALID CREDIT CARD SECURITY NUMBER. It may not contain any letters or special characters and must be 3 characters long",
        /*8*/""
        ];

    const checkForm = () => {

        let errors = 0,
            firstInvalidFieldset;

        for (let node of form.elements) {
            if (node.nodeName !== "FIELDSET" && node.type !== "radio" && !node.disabled) {
                if (!validateInput(node).status) {
                    errors++;
                    document.getElementById(`err-${node.id}`).innerHTML = `${formErrors[validateInput(node).errorCode]}`;
                    if (!firstInvalidFieldset) { 
                        firstInvalidFieldset = node.closest("fieldset") 
                    };
                } else {
                    document.getElementById(`err-${node.id}`).innerHTML = "";
                }
            }
        }
        if (firstInvalidFieldset) { firstInvalidFieldset.scrollIntoView() }
        return errors === 0 ? true : false
    }
    
    const validateEmail = (email) => {
        //this function only checks: 
        //- if the address contains at least 1 "@", 
        //- if it has any blank spaces,
        //- if it has at least 1 character before and after the "@"
        let atPos = email.indexOf("@"),
            noBlankSpaces = !(/(\s)/.test(email)),
            atLeast1CharBefore = false,
            atLeast1CharAfter = false;

        if (atPos !== -1 && noBlankSpaces) {
            atLeast1CharBefore = email.slice(0,atPos).length > 0;
            atLeast1CharAfter = email.slice(atPos+1).length > 0;
        }
        return ( atLeast1CharAfter && atLeast1CharBefore )
    }

    const validateInput = (formElement) => {

        const thisInputID = formElement.id;
        const thisValue = formElement.value.trim();
        const checkStringLength = (str,min,max) => str.length < max && str.length >= min;

        switch (thisInputID) {
            case "fname": 
            case "lname": 
                return {
                    status: ( nameRegex.test(thisValue) && checkStringLength(thisValue,1,20) ),
                    errorCode: 0 }; 
            case "streetAdd1":
                return {
                    status: ( addressRegex.test(thisValue) && checkStringLength(thisValue,1,30) ),
                    errorCode: 1 };
            case "streetAdd2":
                if (thisValue === "") {
                    return { status: true, errorCode: 8 }
                } else {
                    return {
                        status: ( checkStringLength(thisValue,1,30) && addressRegex.test(thisValue) ),
                        errorCode: 1 };
                }
            case "city": 
            case "state":  
                return {
                    status: ( nameRegex.test(thisValue) && checkStringLength(thisValue,1,30) ),
                    errorCode: 2 };
            case "zipCode": 
                return {
                    status: ( zipCodeRegex.test(thisValue) ),
                    errorCode: 3 };
            case "phoneNumber": 
                return {
                    status: ( phoneRegex.test(thisValue) ),
                    errorCode: 4 };
            case "emailAddress":
                return {
                    status: ( validateEmail(thisValue) ),
                    errorCode: 5 };
            case "ccNumber": 
                return {
                    status: ( CCRegex.test(thisValue) ),
                    errorCode: 6 };
            case "ccCode": 
                return {
                    status: ( CCsecurityRegex.test(thisValue) ),
                    errorCode: 7 };
            default: console.log("There was an error with the form validation"); break;
        }
    }

})()