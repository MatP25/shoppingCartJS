(function() {
    
    "use strict";

    ////////////////////////////////////////////////////////////////////
    ////////////////------------DOM ELEMENTS------------////////////////
    ////////////////////////////////////////////////////////////////////

    const 
        shop = document.getElementById("shop"),
        cartAmount = document.getElementById("cart-amount"),
        clearCartBtn = document.getElementById("clearCartBtn"),
        cardsQty = document.getElementsByClassName("quantity"),
        main = document.querySelector("main"),
        searchBar = document.getElementById("searchBar"),
        selectCategory = document.getElementById("selectCategory"),
        maxPriceInput = document.getElementById("maxPrice"),
        minPriceInput = document.getElementById("minPrice"),
        applyFiltersBtn = document.getElementById("applyFiltersBtn"),
        toggleFiltersBtn = document.getElementById("toggleFilters"),
        filtersDiv = document.getElementById("filters"),
        clearFiltersBtn = document.getElementById("clearFiltersBtn");

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
        cartAmount.innerHTML = 0;
        for (let i=0;i<cardsQty.length;i++) {
            cardsQty[i].innerHTML = 0;
        }
    }

    const createProducts = (targetElement, dataArray, cartArray) => {
        //map will go over every object in productsData and for each object it will return a new piece of html
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
            addShakeAnimation(thisProd);
            return
        } else if (searchCart.quantity >= 1) {
            searchCart.quantity--;
        }
        
        cart = cart.filter( product => product.quantity > 0);
        updateQty(cardsQty,cart);
        updateCartInLocalStorage();
    }

    const addShakeAnimation = (targetProduct) => {
        //adds shake animation when clicking the decrement btn on an item with quantity = 0;
        targetProduct.className += " shake-horizontal";
        setTimeout( () => { //then remove the animation class when it ends
            targetProduct.classList.remove("shake-horizontal")
        }, 700);
    }

    const updateQty = (elemCollection, cartArray) => {
        for (let i = 0; i < elemCollection.length; i++) {
            const thisCardID = elemCollection[i].id;
            const thisProduct = cartArray.find((product)=> product.id === thisCardID.slice(-10)) || 0;
            elemCollection[i].innerHTML = thisProduct.quantity || 0;
        }
        updateCartIcon(cartAmount);
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

    const nameFilter = (dataArray, filterValue) => {
        //filters product by name
        return dataArray.filter( prod => {
            return prod.name.toLowerCase().includes(filterValue)
        })
    }

    const multipleFilters = (dataArray, categoryValue, maxPrice, minPrice) => {
        let filteredData = dataArray
        .filter( 
            prod => (!categoryValue || prod.subcategory.toLowerCase().includes(categoryValue))
        ).filter( 
            prod => (!minPrice || prod.price >= parseInt(minPrice))
        ).filter( 
            prod => (!maxPrice || prod.price <= parseInt(maxPrice))
        );
        return filteredData
    }

    const clearFilters = () => {
        //clear filter values when reloading the page & using the search function
        maxPriceInput.value = ""; 
        minPriceInput.value = "";
        selectCategory.value = "";
    }

    
    
    const url = "./assets/js/json/dataCats.JSON";
    
    const getJsonData = async (url, hasFilter) => {
        const resp = await fetch(url);
        const data = await resp.json();

        if (!hasFilter) {
            createProducts(shop, data, cart);
        } else {
            const filteredByName = nameFilter(data, searchBar.value.toLowerCase());
            const multiFiltered = multipleFilters(filteredByName, selectCategory.value, maxPriceInput.value, minPriceInput.value);
            createProducts(shop, multiFiltered, cart);
        }
        
    }
    
    ///////////////////////////////////////////////////////////////////
    //////////////------------EVENT LISTENERS------------//////////////
    ///////////////////////////////////////////////////////////////////

    window.addEventListener("storage", () => {
        cart = JSON.parse(localStorage.getItem("data")) || [];
        updateQty(cardsQty,cart);
    });

    window.addEventListener("load", () => {
        clearFilters();
        getJsonData(url, false);
        updateCartIcon(cartAmount);
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
    
    applyFiltersBtn.addEventListener("click", () => {
        getJsonData(url, true);
    });

    clearFiltersBtn.addEventListener("click", clearFilters);

    toggleFiltersBtn.addEventListener("click", evt => {
        evt.preventDefault();
        filtersDiv.className === "hidden" ? 
        filtersDiv.className = "visibleBlock" : 
        filtersDiv.className = "hidden";
    });
})();