// (function () {
//     $(document).ready(function () {
//         // initialize the Tableau Extension function
//         tableau.extensions.initializeAsync().then(function () {
//             // get all parameter from the dashboard
//             tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(function (parameters) {
//                 parameters.forEach(function (p) {
//                     // if a parameter changes, run the function "buttonClick"
//                     p.addEventListener(tableau.TableauEventType.ParameterChanged, onParameterChange)
//                 })
//             })
//         })
//     })

//     function onParameterChange(parameterChangeEvent) {
//         parameterChangeEvent.getParameterAsync().then(function (param) {
//                 document.getElementById("title").innerHTML = param.name
//         })
        
//     }

// })();

function loadCAS(){
    fetch('http://localhost:8000/api/spiff-ca', {
        headers: {
            "Authorization": 'Token 03a2b7e6e6c37b0b80f224b81b32c06554428823',
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
    return fetch('http://localhost:8000/api/spiff-managers', {
        headers: {
            "Authorization": 'Token 03a2b7e6e6c37b0b80f224b81b32c06554428823',
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

    fetch('http://localhost:8000/api/spiff-tracker', {
        method: "POST",
        body: JSON.stringify(post_data),
        headers: {
            "Authorization": 'Token 03a2b7e6e6c37b0b80f224b81b32c06554428823',
            "Content-type": "application/json; charset=UTF-8"
        }
    })

    // location.reload()
}

function getCAInfo(){
    const caName = document.getElementById("ca-name").value
    console.log(caName)
    fetch('http://localhost:8000/api/spiff-ca', {
        headers: {
            "Authorization": 'Token 03a2b7e6e6c37b0b80f224b81b32c06554428823',
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
    // return fetch('http://localhost:8000/api/spiff-managers', {
    //     headers: {
    //         "Authorization": 'Token 03a2b7e6e6c37b0b80f224b81b32c06554428823',
    //     }
    // })
    // .then(response => {
    //     return response.json()
    // })
    // .then(managers => {
    //     console.log(managers)
    //     let manager = managers.SF_USER_NAME[0]
    //     document.getElementById("manager-name").value = manager
    // })
}

function getInfo(){
    const recordDateValue = document.getElementById("record-date").value
    const amount = document.getElementById('amount').value
    console.log(recordDateValue, amount)
}