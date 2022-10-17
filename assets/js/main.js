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
        filtersDiv = document.getElementById("filters"),
        emailInput = document.getElementById("loginEmail"),
        passwordInput = document.getElementById("loginPassword"),
        selectPetCategoryRadios = document.querySelectorAll("input[name='petCategory'");

    //get the data from the local storage, if the local storage is empty set it as an empty array
    let cart = JSON.parse(localStorage.getItem("data")) || [];

    //JSON DATA
    const urljson = "./assets/js/json/data.JSON";

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

    const updateCartInLocalStorage = () => { localStorage.setItem("data", JSON.stringify(cart)); }

    const createProducts = (targetElement, dataArray, cartArray) => {
        //map will go over every object in the data array and for each object it will return a new piece of html
        return (targetElement.innerHTML = dataArray.map( 
            (element) => {
            // object deconstructing
            let {id, name, price, details, category, subcategory, imgSrc} = element;
            //search the cart, if there are zero products return an empty array
            //then assign the product's quantity retrieved from the array to the quantity value inside the card, if the array is empty searchCart.quantity will be undefined then let the value be 0
            let searchCart = cartArray.find ( product => product.id === ("product" + id)) || [];

            return `<div id="product${id}" class="card">
            <img src=${imgSrc} alt="">
                <div class="card__details">
                    <h3>${name}</h3>
                    <p>Category: ${category} - ${subcategory}</p>
                    <div class="card__price">
                        <p>$${price}</p>
                        <div class="card__buttons">
                            <i class="bi bi-dash decrementQty"></i>
                            <span id="qtyIDproduct${id}" class="quantity">${searchCart.quantity === undefined ? 0 : searchCart.quantity}</span>
                            <i class="bi bi-plus incrementQty"></i>
                        </div>
                    </div>
                </div>
            </div>`
        }).join("")) //remove the commas that separate the objects in the array by creating a single string with every element concatenated
    }

    const incrementQty = (thisProd, cartArray) => {
        //receives an obj as parameter, assign selectedProduct to the object's id
        const selectedProduct = thisProd.id;
        //search for the object inside the cart which has an id = the id of the selected product, if no elements are found the find method returns undefined
        const searchCart = cartArray.find( el => el.id === selectedProduct );
        //if the find method returns undefined the object does not exist in the cart, therefore add it to the cart
        if (searchCart === undefined) {
            cartArray.push( { id: selectedProduct, quantity: 1 } );
        //if the find method did not return undefined the object already exists in the cart, so increase the quantity of that object by 1
        } else {
            searchCart.quantity += 1;
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
        //adds animation class to a target element, if removeClassAfter is true it removes the class after a set timeout so the animation can be run again
        targetElement.className += ` ${animationClass}`;

        if (removeClassAfter) {
            setTimeout( () => { //remove the animation class when it ends
                targetElement.classList.remove(animationClass)
            }, timeout);
        }
    }

    const updateQty = (elemCollection, cartArray) => {
        for (let i = 0; i < elemCollection.length; i++) {

            const thisCardID = elemCollection[i].id;

            const thisProduct = cartArray.find( (product) => product.id === thisCardID.slice(-10)) || 0;

            elemCollection[i].innerHTML = thisProduct.quantity || 0;
        }
        updateCartIcon(cartAmount);
    }

    //calculates the sum of values in an array, used for calculating the total number of products in the cart
    const calcAmount = (arr, keyName) => arr.map( (obj) => obj[keyName]).reduce( (a,b) => a + b, 0);
    
    const updateCartIcon = (targetElement) => {
        //updates the cart icon's product counter
        targetElement.innerHTML = calcAmount(cart, "quantity");
    }

    //filters product by name
    const nameFilter = (dataArray, filterValue) => {
        return dataArray.filter( prod => prod.name.toLowerCase().includes(filterValue) )
    }

    const multipleFilters = (dataArray, categoryValue, subcategoryValue, maxPrice, minPrice) => {
        
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

    const getJsonData = async (url) => {

        shop.innerHTML = "<div class='loader'></div> <p class='centered'>Loading...</p>";

        try {
            const resp = await fetch(url);
            const data = await resp.json();
    
            const sortedData = sortArray(data);
    
            const filteredByName = nameFilter(sortedData, searchBar.value.toLowerCase());
            const filteredData = multipleFilters(
                        filteredByName, 
                        getRadioValue(), 
                        selectSubCategory.value, 
                        maxPriceInput.value, 
                        minPriceInput.value);
                
            createProducts(shop, filteredData, cart);
            updateTitle();

        } catch(error) {
            shop.innerHTML = "<div class='loadingError'><p> There was an error retrieving the data, please try reloading the page </p></div>";
            console.error(error);
        } finally {
            shop.scrollIntoView();
        }
        
    }
    
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

    const updateTitle = () => {
        const title = document.getElementById("productsTitle");
        const foundQty = shop.children.length;

        if (!foundQty) {
            title.innerHTML = "Sorry... No matching products were found."
        } else {
            if (!getRadioValue()) {
                title.innerHTML = `Showing ${foundQty} products for Dogs & Cats`;
            } else {
                title.innerHTML = `Showing ${foundQty} ${getRadioValue().toLowerCase().slice(0,3)} products`;
            }
        }
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

    const closeNavMenu = () => {
        document.getElementById("page-nav-toggle").checked = false;
    }

    const checkSessionStorage = () => {
        let filterFromSession = sessionStorage.getItem("filter");
        if (filterFromSession === "cats") {
            selectPetCategoryRadios[0].checked = true;
        } else if (filterFromSession === "dogs") {
            selectPetCategoryRadios[1].checked = true;
        }
        sessionStorage.clear();
    }
    ///////////////////////////////////////////////////////////////////
    //////////////------------EVENT LISTENERS------------//////////////
    ///////////////////////////////////////////////////////////////////

    window.addEventListener("storage", () => {
        cart = JSON.parse(localStorage.getItem("data")) || [];
        updateQty(cardsQty,cart);
        checkLoginState();
    });

    window.addEventListener("load", () => {
        clearFilters();
        checkSessionStorage();
        getJsonData(urljson);
        updateCartIcon(cartAmount);
        updateTitle();
        checkLoginState();
    });

    document.querySelector("body").addEventListener("click", evt => {
        //SO-1687296 - dom delegation https://javascript.info/event-delegation
        if (evt.target && evt.target.nodeName == "I") {
            let thisProduct = evt.target.closest(".card");
            let classes = evt.target.className.split(" ");
            if (classes) {
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

    document.getElementById("catProductsLink").addEventListener("click", evt => {
        evt.preventDefault();
        selectPetCategoryRadios[0].checked = true;
        closeNavMenu();
        getJsonData(urljson);
    });

    document.getElementById("dogProductsLink").addEventListener("click", evt => {
        evt.preventDefault();
        selectPetCategoryRadios[1].checked = true;
        closeNavMenu();
        getJsonData(urljson);
    });

    document.getElementById("applyFiltersBtn").addEventListener("click", () => {
        getJsonData(urljson);
    });

    document.getElementById("searchByName").addEventListener("click", evt => {
        evt.preventDefault();
        getJsonData(urljson);
    });

    document.getElementById("clearFiltersBtn").addEventListener("click", clearFilters);

    document.getElementById("toggleFilters").addEventListener("click", evt => {
        evt.preventDefault();
        filtersDiv.style.display === "none" ?
        filtersDiv.style.display = "block" : 
        filtersDiv.style.display = "none";
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
                setTimeout( () => { location.reload(); }, 1000 ));
        } else {
            localStorage.setItem("loginState", false);
        }
    });

    openLoginModalBtn.addEventListener("click", evt => {
        
        if (checkLoginState() === "true") {
            evt.preventDefault();
            localStorage.setItem("loginState", false);
            Swal.fire('Logged out!', 'Reloading the page...', 'info').then(
                setTimeout( () => { location.reload(); }, 1000)
            );
        } else { (checkLoginState() === "false")
            openModal();
        }
        checkLoginState();
    });

})();