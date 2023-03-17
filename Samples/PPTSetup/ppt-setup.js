function checkbox() {
    if($('.default-logic').not(":checked")){
        $(".logic-form").css("display", "block");
    }
    if ($('.default-logic').is(":checked")){
        $(".logic-form").css("display", "none");
    }
    else {

    }
        
}

function submitForm() {
    const partnerCompletionThreshold = document.getElementById("partner-completion-threshold").value
    const assignmentPassingScore = document.getElementById("assignment-passing-score").value
    const finalExamPassingScore = document.getElementById("final-passing-score").value
    const revenueShareMargin = document.getElementById("revenue-share-margin").value
    const psm = document.getElementById("psm").value


    console.log(partnerCompletionThreshold, assignmentPassingScore, finalExamPassingScore, revenueShareMargin, psm)
}

function getPartnerInfo(){
    fetch('http://localhost:8000/api/ppt', {
        headers: {
            "Authorization": 'Token 03a2b7e6e6c37b0b80f224b81b32c06554428823',
        }
    })
    .then(response => {
        return response.json()
    })
    .then(data => {
        const psmList = data.PSM
        console.log(psmList)

        if (psmList.includes("DMA")){
            document.getElementById("test").innerHTML = 'weeeee'
        }
    })
}

window.onload = getPartnerInfo()

$(document).ready(function () {
    tableau.extensions.initializeAsync().then(function () {
      fetchFilters();

      // Add button handlers for clearing filters.
      $('#clear').click(clearAllFilters);
    }, function (err) {
      // Something went wrong in initialization.
      console.log('Error while Initializing: ' + err.toString());
    });
});

function fetchFilters () {
    // While performing async task, show loading message to user.
    $('#loading').addClass('show');

    // Whenever we restore the filters table, remove all save handling functions,
    // since we add them back later in this function.
    unregisterHandlerFunctions.forEach(function (unregisterHandlerFunction) {
      unregisterHandlerFunction();
    });

    // Since filter info is attached to the worksheet, we will perform
    // one async call per worksheet to get every filter used in this
    // dashboard.  This demonstrates the use of Promise.all to combine
    // promises together and wait for each of them to resolve.
    const filterFetchPromises = [];

    // List of all filters in a dashboard.
    const dashboardfilters = [];

    // To get filter info, first get the dashboard.
    const dashboard = tableau.extensions.dashboardContent.dashboard;

    // Then loop through each worksheet and get its filters, save promise for later.
    dashboard.worksheets.forEach(function (worksheet) {
      filterFetchPromises.push(worksheet.getFiltersAsync());

      // Add filter event to each worksheet.  AddEventListener returns a function that will
      // remove the event listener when called.
      const unregisterHandlerFunction = worksheet.addEventListener(tableau.TableauEventType.FilterChanged, filterChangedHandler);
      unregisterHandlerFunctions.push(unregisterHandlerFunction);
    });

    // Now, we call every filter fetch promise, and wait for all the results
    // to finish before displaying the results to the user.
    Promise.all(filterFetchPromises).then(function (fetchResults) {
      fetchResults.forEach(function (filtersForWorksheet) {
        filtersForWorksheet.forEach(function (filter) {
          dashboardfilters.push(filter);
        });
      });

      buildFiltersTable(dashboardfilters);
    });
  }