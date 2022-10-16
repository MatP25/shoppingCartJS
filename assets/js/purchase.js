(function () {

    const 
        purchaseDetailsContainer = document.getElementById("successfulPurchase"),
        purchaseDetailsUL = document.getElementById("purchaseDetails"),
        clientDetailsUL = document.getElementById("clientDetails"),
        noProductsDiv = document.getElementById("noProducts"),
        downloadPDFbtn = document.getElementById("downloadBtn");

    let purchaseInformation = JSON.parse(localStorage.getItem("purchaseInfo")) || [];
    let userInformation = JSON.parse(localStorage.getItem("userInfo")) || {};

    const calcTotal = (arr, keyName) => arr.map( (obj) => obj[keyName]).reduce( (a,b) => a + b, 0).toFixed(2);

    const orderDetails = () => {
    
            let purchaseDetailsHTML = (purchaseInformation.map( (product) => {
                let {name, price, qty, subtotal} = product;
                return `<li>
                            <p>Product: ${name.slice(0,75)}...</p>
                            <p>Price:  $${price}</p>
                            <p>Quantity: ${qty}</p>
                            <p>Subtotal: $${subtotal}</p>
                        </li>`
                        
            }).join("") + `<h4>Total: $${calcTotal(purchaseInformation, "subtotal")}</h4>`); 
            
            return purchaseDetailsHTML;
    }
    
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

    downloadPDFbtn.addEventListener("click", () => {

        const doc = new jspdf.jsPDF();

        doc.html(
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

        if (purchaseInformation.length !== 0) {
            purchaseDetailsContainer.style.display = "inline-block";
            downloadPDFbtn.style.display = "inline-block";
            purchaseDetailsUL.innerHTML = orderDetails();
            clientDetailsUL.innerHTML = clientDetails();
        } else {
            noProductsDiv.style.display = "block";
        }

        setTimeout( () => {
            localStorage.clear();
        }, 0); 

    });

})();

