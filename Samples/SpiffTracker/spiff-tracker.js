//this is the function to grab the CAs and Managers dropdown
function loadCAS(){
    fetch('https://publicdma.carruslearn.com/api/spiff-ca', {
        headers: {
            "Authorization": 'Token ad4fa4b186b02a2dc85d1caa4eb9f6cb1b98b2c9',
        }
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        const cas = data.SF_USER_NAME
        selectOptions = document.getElementById("ca-name")
        for (i=0; i<cas.length; i++) {
            selectOptions.options[selectOptions.options.length] = new Option(cas[i], cas[i])
        }
    })
    return fetch('https://publicdma.carruslearn.com/api/spiff-managers', {
        headers: {
            "Authorization": 'Token ad4fa4b186b02a2dc85d1caa4eb9f6cb1b98b2c9',
        }
    })
    .then(response => {
        return response.json()
    })
    .then(managers => {
        const managerList = managers.SF_USER_NAME
        console.log(managerList)
        managerSelectOptions = document.getElementById("manager-name")
        for (i=0; i<managerList.length; i++) {
            managerSelectOptions.options[managerSelectOptions.options.length] = new Option(managerList[i], managerList[i])
        }
    })
}

window.onload = loadCAS()

//this function grabs all the input/dropdown values, posts to our API, and inserts that into our Snowflake table
function submitForm(){
    const caName = document.getElementById("ca-name").value
    const recordDate = document.getElementById("record-date").value
    const dimEmployeeId = document.getElementById("dim-employee-id").value
    const managerName = document.getElementById("manager-name").value
    const amount = document.getElementById("amount").value
    const type = document.getElementById("type").value
    const reasonForSpiff = document.getElementById("reason-for-spiff").value
    const validated = document.getElementById("validated").value
    const paid = document.getElementById("paid").value
    console.log(caName, recordDate, dimEmployeeId, managerName, amount, type, reasonForSpiff, validated, paid)    

    let post_data = {
        "DATE": `${recordDate}`,
        "EMPLOYEE_ID": `${dimEmployeeId}`,
        "CA_NAME": `${caName}`,
        "AMOUNT": `${amount}`,
        "TYPE": `${type}`,
        "REASON_FOR_SPIFF": `${reasonForSpiff}`,
        "MANAGER_NAME": `${managerName}`,
        "VALIDATED": `${validated}`,
        "PAID": `${paid}`
    }
    console.log(post_data)


    if (document.forms['spiff-form'].reportValidity()){
        fetch('https://publicdma.carruslearn.com/api/spiff-tracker', {
        method: "POST",
        body: JSON.stringify(post_data),
        headers: {
            "Authorization": 'Token ad4fa4b186b02a2dc85d1caa4eb9f6cb1b98b2c9',
            "Content-type": "application/json; charset=UTF-8"
        }
        
    })
    document.getElementsByClassName("submit-message")[0].style.display = 'block'
    document.forms['spiff-form'].reset()
    
    } else {
        document.getElementsByClassName("error-message")[0].style.display = 'block'
    }

}

// this function populates the DIM Employee ID upon change of CA Name dropdown
function getCAInfo(){
    const caName = document.getElementById("ca-name").value
    console.log(caName)
    fetch('https://publicdma.carruslearn.com/api/spiff-ca', {
        headers: {
            "Authorization": 'Token ad4fa4b186b02a2dc85d1caa4eb9f6cb1b98b2c9',
        }
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        console.log(data)
        const CANames = data.SF_USER_NAME
        const CAIndex = CANames.indexOf(caName)
        const CADim = data.DIMROWID[CAIndex]
        document.getElementById("dim-employee-id").value = CADim

    })
}