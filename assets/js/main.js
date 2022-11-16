(function() {
    
    "use strict";

    ////////////////////////////////////////////////////////////////////
    ////////////////------------DOM ELEMENTS------------////////////////
    ////////////////////////////////////////////////////////////////////
    
    const 
        shop = document.getElementById("shop"),
        cartAmount = document.getElementById("cart-amount"),
        cardsQty = document.getElementsByClassName("quantity"),
        openLoginModalBtn = document.getElementById("openLoginModal"),
        loginModal = document.getElementById("loginModal"),
        searchBar = document.getElementById("searchBar"),
        selectSubCategory = document.getElementById("selectCategory"),
        selectSortingMethod = document.getElementById("sortingMethod"),
        maxPriceInput = document.getElementById("maxPrice"),
        minPriceInput = document.getElementById("minPrice"),
        emailInput = document.getElementById("loginEmail"),
        passwordInput = document.getElementById("loginPassword"),
        details = document.getElementById("filtersDetails"),
        selectPetCategoryRadios = document.querySelectorAll("input[name='petCategory'");
    
    //get the data from the local storage, if the local storage is empty set it as an empty array
    let cart = JSON.parse(localStorage.getItem("data")) || [];
    let loginState;
    //when the register form validation runs it will store the 1st password in this variable and compare it to the second
    let firstRegisterPassword;
    //JSON DATA
    const urljson = "./assets/js/json/data.JSON";

    ///////////////////////////////////////////////////////////////////
    /////////////////------------FUNCTIONS------------/////////////////
    ///////////////////////////////////////////////////////////////////

    const openModal = (targetElement) => {
        targetElement.classList.remove("hidden");
        targetElement.className += " visibleBlock";
    }

    const closeModal = (targetElement) => {
        targetElement.classList.remove("visibleBlock");
        targetElement.className += " hidden";
    }

    //updates cart data in local storage
    const updateCartInLocalStorage = () => { localStorage.setItem("data", JSON.stringify(cart)); }

    const createProducts = (targetElement, dataArray, cartArray) => {
        const icons = ['<i class="fa-solid fa-cat categoryIcon" title="Cats"></i>', '<i class="fa-solid fa-dog categoryIcon" title="Dogs"></i>'];
        //map will go over every object in the data array and for each object it will return a new piece of html
        return (targetElement.innerHTML = dataArray.map( 
            (element) => {
            // object deconstructing
            let {id, name, brand, price, details, description, category, subcategory, imgSrc} = element;
            //search the cart, if there are zero products return an empty array
            //then assign the product's quantity retrieved from the array to the quantity value inside the card, if the array is empty searchCart.quantity will be undefined then let the value be 0
            let searchCart = cartArray.find ( product => product.id === ("product" + id)) || [];

            return `<div id="product${id}" class="card">
            <img src=${imgSrc} alt="${name}">
                <div class="card__details">
                    <h3>${name}</h3>
                    <div class="tooltip">
                        View product details
                        <div class="top">
                            <h3>Product description:</h3>
                            <p>Brand: ${brand}</p>
                            <p>${details}</p>
                            <p>${description}</p>
                            <i></i>
                        </div>
                    </div>
                    <div>
                        <h4>${category === "Cats" ? icons[0] : icons[1]} ${subcategory}</h4>
                        <div class="card__price">
                            <p>$${price}</p>
                            <div class="card__buttons">
                                <i class="bi bi-dash decrementQty"></i>
                                <span id="qtyIDproduct${id}" class="quantity">${searchCart.quantity === undefined ? 0 : searchCart.quantity}</span>
                                <i class="bi bi-plus incrementQty"></i>
                            </div>
                        </div> 
                        
                    </div>
                </div>
            </div>`
        }).join("")) //remove the commas that separate the objects in the array by creating a single string with every element concatenated
    }

    const incrementQty = (thisProd, cartArray) => {
        //receives an obj as parameter, assign selectedProduct to the object's id
        const selectedProduct = thisProd.id;
        //search for the object inside the cart which has an id that matches the id of the selected product, if no elements are found the find method returns undefined
        const searchCart = cartArray.find( el => el.id === selectedProduct );
        //if the find method returns undefined the object does not exist in the cart, therefore add it to the cart
        if (!searchCart) {
            cartArray.push( { id: selectedProduct, quantity: 1 } );
        //if the find method did not return undefined the object already exists in the cart, so increase the quantity of that object by 1
        } else if (searchCart.quantity < 20) {
            searchCart.quantity += 1;
        } else if (searchCart.quantity >= 20) {
            Swal.fire('You cannot add more than 20 of the same product', 'To buy more units consult stock first', 'info');
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
            addQuickAnimation(thisProd, "shake-horizontal", true, 700);
            return
        } else if (searchCart.quantity >= 1) {
            searchCart.quantity--;
        }
        
        cart = cart.filter( product => product.quantity > 0);
        updateQty(cardsQty,cart);
        updateCartInLocalStorage();
    }

    const addQuickAnimation = (targetElement, animationClass, removeClassAfter, timeout) => {
        //adds animation class to a target element, if removeClassAfter is true it removes the class after a set timeout so the animation class can be added and run again
        targetElement.className += ` ${animationClass}`;
        if (removeClassAfter) {
            setTimeout( () => { //remove the animation class when it ends
                targetElement.classList.remove(animationClass)
            }, timeout);
        }
    }

    const updateQty = (elemCollection, cartArray) => {
        for (let i = 0; i < elemCollection.length; i++) {
            //iterates over a collection of elements and grabs the id of the element
            const thisCardID = elemCollection[i].id;
            //finds the product inside the cart with a matching id
            const thisProduct = cartArray.find( (product) => product.id === thisCardID.slice(-10)) || 0;
            //sets the innerhtml of the element to the quantity of the matching product, if it's not found inside the cart set it to 0
            elemCollection[i].innerHTML = thisProduct.quantity || 0;
        }
        updateCartIcon(cartAmount);
    }

    //calculates the sum of values in an array (used for calculating the total number of products in the cart)
    const calcAmount = (arr, keyName) => arr.map( (obj) => obj[keyName]).reduce( (a,b) => a + b, 0);
    
    const updateCartIcon = (targetElement) => {
        //updates the cart icon's product counter
        targetElement.innerHTML = calcAmount(cart, "quantity");
    }

    //filters an array of objects based on their name if the given string is found inside it
    const nameFilter = (dataArray, filterValue) => {
        return dataArray.filter( prod => prod.name.toLowerCase().includes(filterValue) )
    }

    //filters an array given a group of values taken from the filters selected by the user
    const multipleFilters = (dataArray, categoryValue, subcategoryValue, maxPrice, minPrice) => {
        //if the filter value is empty it will ignore the filter condition
        let filteredData = dataArray
        .filter(
            prod => (!categoryValue || prod.category === categoryValue)
        ).filter( 
            prod => (!subcategoryValue || prod.subcategory.toLowerCase().includes(subcategoryValue))
        ).filter( 
            prod => (!minPrice || prod.price >= parseInt(minPrice))
        ).filter( 
            prod => (!maxPrice || prod.price <= parseInt(maxPrice))
        );
        return filteredData
    }

    const clearFilters = () => {
        //clear filter values when reloading the page & using the search function
        searchBar.value = "";
        maxPriceInput.value = ""; 
        minPriceInput.value = "";
        selectCategory.value = "";
        document.querySelector("#allPets").checked = true;
    }

    const sortArray = (arr) => {
        //receives an array and sorts it based on the criteria selected by the user in the filter section
        let sorted, reversed, sortBy;

        if (selectSortingMethod.value === "priceInc") {
            sortBy = "price"; reversed = false; 
        } else if (selectSortingMethod.value === "priceDec") {
            sortBy = "price"; reversed = true;
        } else if (selectSortingMethod.value === "nameAsc") {
            sortBy = "name"; reversed = false;
        } else if (selectSortingMethod.value === "nameDes") {
            sortBy = "name"; reversed = true;
        }

        if (sortBy === "price") {
            sorted = arr.sort( (a,b) => {
                if (a.price > b.price) return 1;
                if (a.price < b.price) return -1;
                return 0;
            });
        } else if (sortBy === "name") {
            sorted = arr.sort( (a,b) => {
                if (a.name > b.name) return 1;
                if (a.name < b.name) return -1;
                return 0;
            });
        }
        return reversed ? sorted.reverse() : sorted
    }

    //retrieves the data from the JSON file then creates the cards with it
    const getJsonData = async (url) => {
        //while the function is awaiting the response show the loading animation
        shop.innerHTML = "<div class='loader'></div> <p class='centered'>Loading...</p>";

        try {
            const resp = await fetch(url);
            const data = await resp.json();
            //sorts the data array
            const sortedData = sortArray(data);
            //filters the data
            const filteredByName = nameFilter(sortedData, searchBar.value.toLowerCase());
            const filteredData = multipleFilters(
                        filteredByName, 
                        getRadioValue(), 
                        selectSubCategory.value, 
                        maxPriceInput.value, 
                        minPriceInput.value);
            //creates the cards
            createProducts(shop, filteredData, cart);
            //updates the title based on the data retrieved and filters applied
            updateTitle();
        } catch(error) {
            //if there's an error show an error message in the console and the html
            shop.innerHTML = "<div class='loadingError'><p> There was an error retrieving the data, please try reloading the page </p></div>";
            console.error(error);
        }
    }
    
    //gets the value from the selected category
    const getRadioValue = () => {
        let radioValue;
        for (let i=0; i<selectPetCategoryRadios.length; i++) {
            if (selectPetCategoryRadios[i].checked) {
                radioValue = selectPetCategoryRadios[i].value;
                break;
            }
        }
        return radioValue;
    }

    //updates the title based on the data retrieved and filters applied
    const updateTitle = () => {
        const title = document.getElementById("productsTitle");
        //counts the amount of products retrieved based on the number of cards created
        const foundQty = shop.children.length;
        //if 0 products were found
        if (!foundQty) {
            title.innerHTML = "Sorry... No matching products were found."
        } else { 
            //if at least 1 product was found then updates the title
            if (!getRadioValue()) {
                // if the selected category is "all", getRadioValue returns an empty string
                title.innerHTML = `Showing ${foundQty} products for Dogs & Cats`;
            } else {
                title.innerHTML = `Showing ${foundQty} ${getRadioValue().toLowerCase().slice(0,3)} products`;
            }
        }
    }

    //checks if the user has logged in and updates the text of the login/logout button
    const checkLoginState = () => {
        loginState = localStorage.getItem("loginState") || false;
        if (localStorage.getItem("loginState") === "true") {
            loginState = true;
            openLoginModalBtn.innerHTML = "Logout";
        } else {
            loginState = false;
            localStorage.setItem("loginState", false);
            openLoginModalBtn.innerHTML = "Login";
        }
        return loginState
    }

    const closeNavMenu = () => { document.getElementById("page-nav-toggle").checked = false; }

    //when the user clicks on dog / cat products from the nav menu of another html that isn't index it stores a filter value in the session storage and is redirected to index.html,
    //then, when the page loads it checks the filter value and selects the corresponding category value so the data with that category is loaded
    const checkSessionStorage = () => {
        let filterFromSession = sessionStorage.getItem("filter");
        searchBar.value = sessionStorage.getItem("searchQuery") || "";
        if (filterFromSession === "cats") {
            selectPetCategoryRadios[0].checked = true;
        } else if (filterFromSession === "dogs") {
            selectPetCategoryRadios[1].checked = true;
        }
        sessionStorage.clear();
    }

    ///////////////////////////////////////////////////////////////////
    //////////////------------FORM VALIDATION------------//////////////
    ///////////////////////////////////////////////////////////////////

    const registerFormErrors = [
        "Invalid email address. Please verify that it matches the correct format: user@domain. It may not contain any blank spaces.",
        "Invalid password. It must contain at least 1 uppercase and lowercase letter and 1 digit and must be between 6 and 25 characters long.",
        "Invalid password. The password does not match."
    ];
    
    //given an array of input nodes runs a function that validates each input, if the validator function returns true it doesn't show any error,
    //if the validator function returns false it shows the corresponding error
    const checkRegisterForm = (nodeArray) => {
        //keeps tracks of the amount of errors
        let errors = 0;
        //the status of the object contains a boolean that indicates if the input is valid or not
        //the errorCode contains the index position inside the registerFormErrors array of the error found in the invalid input
        for (let node of nodeArray) {
            if (!validateRegisterInput(node).status) {
                errors++;
                document.getElementById(`err-${node.id}`).innerHTML = `${registerFormErrors[validateRegisterInput(node).errorCode]}`;
            } else {
                document.getElementById(`err-${node.id}`).innerHTML = "";
            }
        } //the function returns true only if all inputs are valid (0 errors)
        return errors === 0 ? true : false
    }

    //receives a input element and validates the input value, 
    //returns an object with the status of the validation and the errorCode that contains an integer for the index position of the error string
    const validateRegisterInput = (formElement) => {
        //grabs the id of the element passed as argument
        const thisInputID = formElement.id;
        //grabs the value of the input element and removes the empty spaces around the string
        const thisValue = formElement.value.trim();
        //function that receives a string a max and minimum value, then returns a boolean indicating if the string length is between the max and min value
        const checkStringLength = (str,min,max) => str.length < max && str.length >= min;
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
    ///////////////////////////////////////////////////////////////////
    //////////////------------EVENT LISTENERS------------//////////////
    ///////////////////////////////////////////////////////////////////

    window.addEventListener("storage", () => {
        //listens to storage changes and updates the quantity of the cards when it changes, 
        //even when the quantity is changed in another tab from the shoppingCart.html,
        //it also updates the loginState
        cart = JSON.parse(localStorage.getItem("data")) || [];
        updateQty(cardsQty,cart);
        checkLoginState();
    });

    window.addEventListener("load", () => {
        clearFilters(); //clears all filter values
        checkSessionStorage(); //loads the category filter
        getJsonData(urljson); //loads the json data and creates the cards
        updateCartIcon(cartAmount); //updates the amount of products in the cart icon
        checkLoginState();
    });

    document.querySelector("body").addEventListener("click", evt => {
        //SO-1687296 - dom delegation https://javascript.info/event-delegation
        //this makes it easier to add an event listener to all plus and minus icons inside the cards regardless of how many there are
        //grabs all nodes inside the body with the name of I (icons)
        if (evt.target && evt.target.nodeName == "I") {
            //grabs the closest node with class "card", therefore the parent div with class "card"
            let thisProduct = evt.target.closest(".card");
            //grabs the classes of the Icon node
            let classes = evt.target.className.split(" ");
            if (classes) {
                //runs a specific functions depending on the containing class
                for (let i=0; i<classes.length; i++) {
                    if (classes[i] == "incrementQty") {
                    incrementQty(thisProduct, cart);
                    break;
                    } else if (classes[i] == "decrementQty") {
                        decrementQty(thisProduct);
                        break;
                    }
                }
            }
        }
    });

    //this link from the nav menu checks the corresponding category and loads the data based on that filter
    //this way it doesn't need to redirect to a new page 
    document.getElementById("catProductsLink").addEventListener("click", evt => {
        evt.preventDefault();
        selectPetCategoryRadios[0].checked = true;
        closeNavMenu();
        getJsonData(urljson);
        shop.scrollIntoView();
    });

    document.getElementById("dogProductsLink").addEventListener("click", evt => {
        evt.preventDefault();
        selectPetCategoryRadios[1].checked = true;
        closeNavMenu();
        getJsonData(urljson);
        shop.scrollIntoView();
    });

    document.getElementById("applyFiltersBtn").addEventListener("click", () => {
        getJsonData(urljson);
        shop.scrollIntoView();
    });

    document.getElementById("searchByName").addEventListener("click", evt => {
        evt.preventDefault();
        getJsonData(urljson);
        shop.scrollIntoView();
    });

    document.getElementById("clearFiltersBtn").addEventListener("click", clearFilters);

    window.addEventListener("click", evt => {
        //closes the loginModal when clicking outside the login box
        if ( evt.target == loginModal ) {
            evt.preventDefault(); 
            closeModal(loginModal); 
        }
    });

    document.getElementById("closeLoginBtn").addEventListener("click", evt => { 
        evt.preventDefault();
        closeModal(loginModal) 
    });

    document.getElementById("loginBtn").addEventListener("click", evt => {
        evt.preventDefault();
        //removes the classes when opening the modal box
        emailInput.className = "";
        passwordInput.className = "";

        //validates the inputs and set the loginstate to true if the inputs are correct
        if (fakeLoginValidation(emailInput.value, passwordInput.value)) {
            localStorage.setItem("loginState", true);
            closeModal(loginModal);
            Swal.fire('Login successful!', 'Reloading the page...', 'success').then(
                setTimeout( () => { location.reload(); }, 1000 ));
        } else {
            loginState = false;
            localStorage.setItem("loginState", false);
        }
    });

    openLoginModalBtn.addEventListener("click", evt => {
        //checks the loginstate, if it's true then set it to false and show an alert message
        if (checkLoginState()) {
            evt.preventDefault();
            loginState = false;
            localStorage.setItem("loginState", false);
            Swal.fire('Logged out!', 'Reloading the page...', 'info').then(
                setTimeout( () => { location.reload(); }, 1000)
            );
            //if it's false then open the login modal to login
        } else { (checkLoginState() === "false")
            openModal(loginModal);
        }
        checkLoginState();
    });

    document.querySelector("#registerBtn").addEventListener("click", evt => {
        evt.preventDefault();
        //grabs the input elements from the register form
        const 
            email = document.querySelector("#registerEmail"),
            passw1 = document.querySelector("#registerPassword1"),
            passw2 = document.querySelector("#registerPassword2");
        
        //validates the inputs and if they are correct it stores the data in the local storage and shows an alert
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

    //makes it possible to add an animation to the details' content when it opens or closes
    document.querySelector("#summary-filters").addEventListener("click", evt => {
        // since it's not closed yet then it's open
        if (details.hasAttribute("open")) {
            // stop the default behavior (hiding)
            evt.preventDefault();
            // add a class which apply the animation in CSS 
            details.classList.add("closing");
            // continue only after the animation finishes  
            setTimeout(() => { 
                details.removeAttribute("open");
                // close the element 
                details.classList.remove("closing");
            }, 400);
        }
    });
    
})();