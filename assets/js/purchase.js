(function () {

    const 
        purchaseDetailsContainer = document.getElementById("successfulPurchase"),
        purchaseDetailsUL = document.getElementById("purchaseDetails"),
        clientDetailsUL = document.getElementById("clientDetails"),
        noProductsDiv = document.getElementById("noProducts"),
        downloadPDFbtn = document.getElementById("downloadBtn");

    //retrieves the user and purchase information from the local storage
    let purchaseInformation = JSON.parse(localStorage.getItem("purchaseInfo")) || [];
    let userInformation = JSON.parse(localStorage.getItem("userInfo")) || {};

    //calculates the sum of values in an array (used for calculating the total number of products in the cart)
    const calcTotal = (arr, keyName) => arr.map( (obj) => obj[keyName]).reduce( (a,b) => a + b, 0).toFixed(2);

    //creates and returns the html for the purchase information based on the data retrieved from the local storage
    const orderDetails = () => {
            let purchaseDetailsHTML = (purchaseInformation.map( (product) => {
                let {name, price, qty, subtotal} = product;
                return `<li>
                            <p>Product: ${name.slice(0,75)}...</p>
                            <p>Price:  $${price}</p>
                            <p>Quantity: ${qty}</p>
                            <p>Subtotal: $${subtotal.toFixed(2)}</p>
                        </li>`
                        
            }).join("") + `<h4>Total: $${calcTotal(purchaseInformation, "subtotal")}</h4>
            <h5>Date: ${new Date()}</h5>`); 
            
            return purchaseDetailsHTML;
    }
    
    //creates and returns the html for the user information based on the data retrieved from the local storage
    const clientDetails = () => {
        let  {fname, lname, email, address1, address2, city, state, zipCode, phoneNum, paymentOption} = userInformation;

        let clientDetailsHTML = `
            <li> <p> Name: ${fname} ${lname} </p> </li>
            <li> <p> Email: ${email} </p> </li>
            <li> <p> Address: ${(address2 ? (address1 + ", " + address2) : address1)} </p> </li>
            <li> <p> City/State: ${city}, ${state} </p> </li>
            <li> <p> Zip Code: ${zipCode} </p> </li>
            <li> <p> Phone Number: ${phoneNum} </p> </li>
            <li> <p> Zip Code: ${paymentOption} </p> </li>
        `;
        
        return clientDetailsHTML
    }

    //runs a function that creates a new pdf file based on the html inside an element passed as parameter
    downloadPDFbtn.addEventListener("click", () => {
        //creates a new jspdf object
        const doc = new jspdf.jsPDF();
        //set the content of the jspdf object
        doc.html(
            //pass an html element to "screenshot" its content
            purchaseDetailsContainer,
                {
                    callback: function(doc) {
                        doc.save("receipt.pdf")
                    },
                    autoPaging: 'text',
                    margin: [10,0,15,0],
                    x: 15,
                    y: 0,
                    width: 220,
                    windowWidth: 1200
                }  
            )
    });

    
    window.addEventListener("load", () => {
        //upon loading the document checks if there is data stored in the localstorage from a purchase
        if (purchaseInformation.length !== 0) {
            //if the localstorage is not empty create the html with the purchase information
            purchaseDetailsContainer.style.display = "inline-block";
            downloadPDFbtn.style.display = "inline-block";
            purchaseDetailsUL.innerHTML = orderDetails();
            clientDetailsUL.innerHTML = clientDetails();
        } else {
            //else show a different container
            noProductsDiv.style.display = "block";
        }
        //clear the localstorage after creating the html
        setTimeout( () => {
            localStorage.clear();
        }, 0); 
    });

})();

