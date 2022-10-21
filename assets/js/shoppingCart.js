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
    //FORM ELEMENTS
    const
        form = document.getElementById("paymentForm"),
        paymentOptionsRadios = form.elements.namedItem("Payment Method");

    //get the data from the local storage, if the local storage is empty set it as an empty array
    let cart = JSON.parse(localStorage.getItem("data")) || [];
    let loginState = localStorage.getItem("loginState") || false;
    //when the register form validation runs it will store the 1st password in this variable and compare it to the second
    let firstRegisterPassword;
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

    //helper function for toggling the visibility of a given html element
    const toggleVisibility = (targetElement, displayType) => {
        targetElement.style.display = displayType;
    }

    //updates the data in the local storage and resets some dynamic content when the cart is empty
    const updateCartInLocalStorage = () => {
        localStorage.setItem("data", JSON.stringify(cart));
        if (cart.length === 0) { resetDynamicContent(); }
    }

    //used for changing the content of some html elements when the cart is empty
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
        calculateTotalPrice(totalPrice, cart, urljson);
    }

    const incrementQty = (thisProd, cartArray) => {
        //receives an obj as parameter, assign selectedProduct to the object's id
        const selectedProduct = thisProd.id;
        //search for the object inside the cart which has an id = the id of the selected product, if no elements are found the find method returns undefined
        const searchCart = cartArray.find( el => el.id === selectedProduct );
        //if the find method returns undefined the object does not exist in the cart, therefore add it to the cart
        if (searchCart === undefined) {
            cartArray.push( { id: selectedProduct, quantity: 1 });
        //if the find method did not return undefined the object already exists in the cart, so increase the quantity of that object by 1
        } else if (searchCart.quantity < 20) {
            searchCart.quantity += 1;
        } else if (searchCart.quantity >= 20) {
            Swal.fire('You cannot add more than 20 of the same product', 'To buy more units consult stock first', 'info');
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

    //removes the html element passed as parameter
    const removeCard = (productObj) => { productObj.remove(); }

    //calculates the sum of values in an array, used for calculating the total number of products in the cart
    const calcAmount = (arr, keyName) => arr.map( (obj) => obj[keyName]).reduce( (a,b) => a + b, 0);

    const updateCartIcon = (targetElement) => {
        //updates the cart icon's product counter
        targetElement.innerHTML = calcAmount(cart, "quantity");
    }

    //show a different title and shows the purchase buttons if the cart is not empty
    const displayCartHeader = () => {
        toggleVisibility(btnsContainer, "flex");
        cartLabel.innerHTML = "My shopping cart";
    }

    const generateCartItems = (targetElement, dataArray, cartArray) => {
        if (cartArray.length !== 0) {
            displayCartHeader();
            //map will go over every object in the data array and for each object it will return a new piece of html
            return (targetElement.innerHTML = cartArray.map( (productCart) => {
                    //find the objects inside data array with a matching id to the id of the objects in the cart, so the object's properties can be accessed to construct the cards
                    let { id, quantity } = productCart;
                    let search = dataArray.find( (product) => ("product" + product.id) === id) || [];
                //returns the card's html for every product inside the cart
                return `<div class="cartCard" id="product${search.id}">
                <div>
                    <img src=${'.' + search.imgSrc} class="cartCard__img" alt="${search.name}">
                    <span class="cartCard__price">$${search.price}</span>
                </div>
                <div class="cartCard__details">
                    <h3> ${search.name}</h3>
                    <i class="bi bi-trash removeItem"></i>
                    <div class="cardCart__buttons">
                        <i class="bi bi-dash decrementQty"></i>
                        <span id="qtyID${id}" class="quantity">${quantity}</span>
                        <i class="bi bi-plus incrementQty"></i>
                    </div>
                    <p class="cartCard__subtotal">Subtotal: $${(quantity * search.price).toFixed(2)}</p>
                    <div class="tooltip">
                        View details
                        <div class="top-smaller">
                            <h3>Product description:</h3>
                            <p>Brand: ${search.brand}</p>
                            <p>${search.details}</p>
                            <p>${search.description}</p>
                            <i></i>
                        </div>
                    </div>
                </div>
            </div>`
            }).join(""));
        } else {
            resetDynamicContent();
        }
    }

    //retrieves the data from the JSON file to get the products' price and gets the quantity of the products in the cart
    const calculateTotalPrice = async (targetElement, cartArray, dataUrl) => {
        try {
            const resp = await fetch(dataUrl);
            const data = await resp.json();
            //calculates the total price for every element in the cart
            let total = 0;
            cartArray.map(productCart => {
                //finds every product in the data array with a matching id to the products in cart to access the price
                let {id, quantity} = productCart;
                let searchData = data.find( (product) => ("product" + product.id) === id) || [];
                //calculates the subtotal for each product in the cart and adds it to the total
                total += searchData.price * quantity;
            });
            cartArray.length > 0 ? 
            targetElement.innerHTML = `TOTAL: $${total.toFixed(2)}` : 
            targetElement.innerHTML = "TOTAL: $0";
            //returns the total value with only 2 decimal values
            return total.toFixed(2);
        } catch (error) {
            console.error(error)
        }
    }

    //this function handles the purchase process after everything is validated
    //receives the json url and an object with the user information from the filled form
    const purchaseHandler = async (dataUrl, userInfo) => {
            //retrieves the data from the JSON file to access the products info
            const resp = await fetch(dataUrl);
            const data = await resp.json();

            //opens a new window with the purchase information
            window.open("./purchaseDetails.html");

            //clears the cart data after its finished
            setTimeout( () => {
                resetDynamicContent();
                localStorage.removeItem("data");
            }, 0);

            //creates an array of objects with each product found in the cart
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
            //uploads the purchaseInfo array and userinfo object to localstorage so it can be retrieved in the purchaseDetails.html page
            localStorage.setItem("userInfo", JSON.stringify(userInfo));
            localStorage.setItem("purchaseInfo", JSON.stringify(purchaseInfo));
    }

    const getJsonData = async (url) => {
        //while the function is awaiting the response show the loading animation
        shoppingCartCards.innerHTML = "<div class='loader'></div> <p class='centered'>Loading...</p>";

        try {
            const resp = await fetch(url);
            const data = await resp.json();
            //creates the cards
            generateCartItems(shoppingCartCards, data, cart);
        } catch (error) {
            //if there's an error show an error message in the console and the html
            shoppingCartCards.innerHTML = "<div class='loadingError'><p> There was an error retrieving the data, please try reloading the page </p></div>";
            console.error(error);
        }
    }

    //awaits for the total price calculation and runs the confirmation alert
    const confirmationPopup = async () => {
        let totalPriceValue = await calculateTotalPrice(totalPrice, cart, urljson);
        confirmationAlert(totalPriceValue);
    } 

    //displays an alert message with the information entered by the user in the purchase form
    const confirmationAlert = (totalValue) => {
        //grabs the form elements
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
            //if the user confirms the info shows a successful purchase alert
            if (result.isConfirmed) {
                Swal.fire({
                    title: `Order Confirmed
                    Thank you for your purchase!`,
                    text: "redirecting the page...",
                    timer: 5000,
                    icon: 'success',
                    showCloseButton: true
                });
                //then creates an object with the user information and passes it to the purchaseHandler function
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

    //checks if the user has logged in and updates the text of the login/logout button
    const checkLoginState = () => {
        loginState = localStorage.getItem("loginState") || false;
        if (loginState === "true") {
            openLoginModalBtn.innerHTML = "Logout";
        } else {
            openLoginModalBtn.innerHTML = "Login";
        }
        return loginState
    }

    const closeNavMenu = () => { document.getElementById("page-nav-toggle").checked = false; }

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
                        break;
                    } else if (classes[i] == "decrementQty") {
                        decrementQty(thisProduct);
                        break;
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

    document.getElementById("searchByName").addEventListener("click", evt => {
        evt.preventDefault();
        sessionStorage.setItem("searchQuery", document.getElementById("searchBar").value);
        window.location.href = "../index.html";
    });

    document.querySelector("#registerBtn").addEventListener("click", evt => {
        evt.preventDefault();

        const 
            email = document.querySelector("#registerEmail"),
            passw1 = document.querySelector("#registerPassword1"),
            passw2 = document.querySelector("#registerPassword2");
        
        if ( checkRegisterForm([email,passw1,passw2]) ) {
            localStorage.setItem(
                "registeredUser", 
                JSON.stringify({ 
                    email: email.value, 
                    password: passw1.value }));
            Swal.fire('Registered successfully!', 'Reloading the page...', 'success').then(
                setTimeout( () => { location.reload(); }, 1000)
            );
        }
    });
    
    ///////////////////////////////////////////////////////////////////
    //////////////------------FORM VALIDATION------------//////////////
    ///////////////////////////////////////////////////////////////////

    const
        //only letters, allows diacritics 
        nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(([\'\,\.\- ][a-zA-ZÀ-ÿ\u00f1\u00d1 ])?[a-zA-ZÀ-ÿ\u00f1\u00d1]*)*$/,
        //only alphanumeric, allows diacritics
        addressRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(([\'\,\.\- ][0-9a-zA-ZÀ-ÿ\u00f1\u00d1 ])?[a-zA-ZÀ-ÿ\u00f1\u00d10-9]*)*$/,
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
        ],

        registerFormErrors = [
            "Invalid email address. Please verify that it matches the correct format: user@domain. It may not contain any blank spaces.",
            "Invalid password. It must contain at least 1 uppercase and lowercase letter and 1 digit and must be between 6 and 25 characters long.",
            "Invalid password. The password does not match."
        ];

    //simple validation for a fake login without a database
    //checks if the inputs match the pre-defined user or the registered user
    const fakeLoginValidation = (email, passw) => {
        const fakeUser = {email: "user@email.com", password: "password" };
        const registeredUser = JSON.parse(localStorage.getItem("registeredUser")) || {};

        if ( (email !== fakeUser.email || passw !== fakeUser.password) && (email !== registeredUser.email || passw !== registeredUser.password) ) {
            emailInput.className += " invalidInput";
            passwordInput.className += " invalidInput";
            document.querySelector("#err-login").innerHTML = "The email or password you entered is invalid";
        } else {
            return true
        }
        return false
    }

    //function that receives a string a max and minimum value, then returns a boolean indicating if the string length is between the max and min value
    const checkStringLength = (str,min,max) => str.length < max && str.length >= min;

    //iterates over a group of form elements and runs a validator function for each input valuem then shows the corresponding error for each invalid input value
    const checkForm = () => {
        //keeps tracks of the amount of errors and the closest fieldset node to the first invalid input in the list 
        let errors = 0, firstInvalidFieldset;
        
        for (let node of form.elements) {
            //ignores fieldset nodes, radio inputs and disabled inputs
            if (node.nodeName !== "FIELDSET" && node.type !== "radio" && !node.disabled && node.nodeName !== "BUTTON") {
                //the status of the object contains a boolean that indicates if the input is valid or not
                //the errorCode contains the index position inside the registerFormErrors array of the error found in the invalid input
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
        //if there is an invalid input the firstInvalidFieldset won't be null, so scroll towards that fieldset
        if (firstInvalidFieldset) { firstInvalidFieldset.scrollIntoView() }
        //the function returns true only if all inputs are valid (0 errors)
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

    //receives a input element and validates the input value, 
    //returns an object with the status of the validation and the errorCode that contains an integer for the index position of the error string
    const validateInput = (formElement) => {
        //grabs the id of the element passed as argument
        const thisInputID = formElement.id;
        //grabs the value of the input element and removes the empty spaces around the string
        const thisValue = formElement.value.trim();
        //runs a different validation and returns a different object depending on the id of the input received
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

    //works the same way as the checkForm function
    const checkRegisterForm = (nodeArray) => {
        let errors = 0;
        for (let node of nodeArray) {
            if (!validateRegisterInput(node).status) {
                errors++;
                document.getElementById(`err-${node.id}`).innerHTML = `${registerFormErrors[validateRegisterInput(node).errorCode]}`;
            } else {
                document.getElementById(`err-${node.id}`).innerHTML = "";
            }
        }
        return errors === 0 ? true : false
    }

    //works the same as the validateInput function
    const validateRegisterInput = (formElement) => {
        const thisInputID = formElement.id;
        const thisValue = formElement.value.trim();
        //checks for at least 1 digit, at least 1 uppercase letter and at least 1 lowercase letter and no empty spaces
        const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])^[^ ]+$/;
        //(?=.*\d) - Contains a digit 
        //(?=.*[a-z]) - Contains a lowercase letter 
        //(?=.*[A-Z]) - Contains a uppercase letter

        //runs a different validation and returns a different object depending on the id of the input received
        switch (thisInputID) {
            case "registerEmail":  
                return {
                    status: ( validateEmail(thisValue) ),
                    errorCode: 0 };
            case "registerPassword1":
                if (passwordRegex.test(thisValue) && checkStringLength(thisValue,6,25)) { 
                    firstRegisterPassword = thisValue;
                    return { status: true, errorCode: 1 } 
                } else { 
                    return { status: false, errorCode: 1 } };
            case "registerPassword2":
                return { status: thisValue === firstRegisterPassword, errorCode: 2 }
            default: console.log("There was an error with the form validation"); break;
        }
    }

})()