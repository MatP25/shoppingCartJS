(function(){

    "use strict";

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

    //only letters, allows diacritics
    const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(([\'\,\.\- ][a-zA-ZÀ-ÿ\u00f1\u00d1 ])?[a-zA-ZÀ-ÿ\u00f1\u00d1]*)*$/;
    //only alphanumeric, allows diacritics
    const addressRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(([\'\,\.\- ][0-9a-zA-ZÀ-ÿ\u00f1\u00d1 ])?[a-zA-ZÀ-ÿ\u00f1\u00d10-9]*)*$/;
    //only digits any length
    const onlyDigitRegex = /^\d+$/;
    //only digits, length: 4 to 8
    const zipCodeRegex = /^\d{4,8}$/;
    //only digits, length: 6 to 14
    const phoneRegex = /^\d{6,14}$/;
    //only 3 digits
    const CCsecurityRegex = /^\d{3}$/;
    //only digits, length: 13 to 16
    const CCRegex = /^\d{13,16}$/;

    const formErrors = [
        "INVALID NAME. It may not contain any numbers or special characters (must be between 1 and 20 characters long).",
        "INVALID ADDRESS. It may not contain any special characters (must be between 1 and 30 characters long).",
        "INVALID CITY or STATE NAME. It may not contain any numbers or special characters (must be between 1 and 30 characters long).",
        "INVALID ZIP CODE. It may not contain any letters or special characters (must be between 4 and 8 characters long)",
        "INVALID PHONE NUMBER. It may not contain any letters or special characters (must be between 6 and 18 characters long)",
        "INVALID EMAIL ADDRESS. Please verify that it matches the correct format: user@domain. It may not contain any blank spaces.",
        "INVALID CREDIT CARD NUMBER. It may not contain any letters or special characters (must be between 13 and 16 characters long)",
        "INVALID CREDIT CARD SECURITY NUMBER. It may not contain any letters or special characters (must be 3 characters long)"
    ]

    const iterateFormElements = () => {

        let errors = 0;

        for (let node of form.elements) {
            if (node.nodeName !== "FIELDSET" && node.type !== "radio") {
                if (!validateInput(node).status) {
                    errors++;
                    document.getElementById(`err-${node.id}`).innerHTML = `${formErrors[validateInput(node).errorCode]}`;
                } else {
                    document.getElementById(`err-${node.id}`).innerHTML = "";
                }
            }
        }
        console.log(errors)

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
        const thisValue = formElement.value;
        const checkStringLength = (str,min,max) => str.length < max && str.length > min;

        switch (thisInputID) {
            case "fname": 
            case "lname": 
                return {
                    status: ( nameRegex.test(thisValue) && checkStringLength(thisValue,1,20) ),
                    errorCode: 0
                    }; 
            case "streetAdd1": 
            case "streetAdd2": 
                return {
                    status: ( addressRegex.test(thisValue) && checkStringLength(thisValue,1,30) ),
                    errorCode: 1
                    };
            case "city": 
            case "state":  
                return {
                    status: ( nameRegex.test(thisValue) && checkStringLength(thisValue,1,30) ),
                    errorCode: 2
                    };
            case "zipCode": 
                return {
                    status: ( zipCodeRegex.test(thisValue) ),
                    errorCode: 3
                    };
            case "phoneNumber": 
                return {
                    status: ( phoneRegex.test(thisValue) ),
                    errorCode: 4
                    };
            case "emailAddress":
                return {
                    status: ( validateEmail(thisValue) ),
                    errorCode: 5
                    };
            case "ccNumber": 
                return {
                    status: ( CCRegex.test(thisValue) ),
                    errorCode: 6
                    };
            case "ccCode": 
                return {
                    status: ( CCsecurityRegex.test(thisValue) ),
                    errorCode: 7
                    };
            default: console.log("There was an error"); break;
        }

    }
    
    iterateFormElements();
})()