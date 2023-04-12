(function () {
  const unregisterHandlerFunctions = [];

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

      populatePartnerName(dashboardfilters);
    });
  }

  // This is a handling function that is called anytime a filter is changed in Tableau.
  function filterChangedHandler (filterEvent) {
    // Just reconstruct the filters table whenever a filter changes.
    // This could be optimized to add/remove only the different filters.
    fetchFilters();
  }

  // Constructs UI that displays all the dataSources in this dashboard
  // given a mapping from dataSourceId to dataSource objects.
  function populatePartnerName (filters) {

    filters.forEach(function (filter) {

      const valueStr = getFilterValues(filter);

      if (valueStr.length > 2 ){
        document.getElementById("title").innerHTML = valueStr
        fetch('https://publicdma.carruslearn.com/api/ppt_dim', {
        headers: {
            "Authorization": 'Token ad4fa4b186b02a2dc85d1caa4eb9f6cb1b98b2c9',
        }
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            console.log(data)
            const partnerNames = data.PARTNER_NAME
            const partnerIndex = partnerNames.indexOf(valueStr)
            const partnerDIM = data.DIMROWID[partnerIndex]
            document.getElementById("partner-dim").value = partnerDIM

        })
        return fetch('https://publicdma.carruslearn.com/api/ppt', {
        headers: {
            "Authorization": 'Token ad4fa4b186b02a2dc85d1caa4eb9f6cb1b98b2c9',
        }
        })
        .then(response => {
            return response.json()
        })
        .then(data => {
            console.log(data.DIM_PARTNER_ID)
            // get list of DIM of partners that exist in our PPT database
            const dimList = data.DIM_PARTNER_ID
            //grab selected partner DIM from extension
            const selectedPartnerDim = document.getElementById("partner-dim").value
            //grab index of DIM that exists in our DB so we can pull other related info about this partner
            const indexOfDim = dimList.indexOf(selectedPartnerDim)
            //grab values from databse using index
            const partnerCompletionThreshold = data.PARTNER_COMPLETION_THRESHOLD[indexOfDim]
            const quizAssignmentPassingScore = data.QUIZ_ASSIGNMENT_PASSING_SCORE[indexOfDim]
            const finalPassingScore = data.FINAL_EXAM_PASSING_SCORE[indexOfDim]
            const revShareMargin = data.REVENUE_SHARE_MARGIN[indexOfDim]
            //if selected partner in Tableau's DIM already exists in our PPT database, populate the rest of the form with already existing logic
            if (dimList.includes(selectedPartnerDim)){
              document.getElementById("data-exists").innerHTML = "Values for this partner already exist in Database. See values below."
              document.getElementById("partner-completion-threshold").value = partnerCompletionThreshold
              document.getElementById("assignment-passing-score").value = quizAssignmentPassingScore
              document.getElementById("final-passing-score").value = finalPassingScore
              document.getElementById("revenue-share-margin").value = revShareMargin
            } else{
              document.getElementById("data-exists").innerHTML = ""
              document.getElementById("partner-completion-threshold").value = "1.00"
              document.getElementById("assignment-passing-score").value = "1.00"
              document.getElementById("final-passing-score").value = "1.00"
              document.getElementById("revenue-share-margin").value = "1.00"
            }
            // const dim_partner = data.DIM_PARTNER_ID
            // if (dim_partner.includes(339)){
            //   document.getElementById("test").innerHTML = partnerDIM
            // }
        })
      }
      
    });

    updateUIState(Object.keys(filters).length > 0);
  }
  

  // This returns a string representation of the values a filter is set to.
  // Depending on the type of filter, this string will take a different form.
  function getFilterValues (filter) {
    var filterValues = '';

    switch (filter.filterType) {
      case 'categorical':
        filter.appliedValues.forEach(function (value) {
          filterValues += value.formattedValue + ', ';
        });
        break;
      case 'range':
        // A range filter can have a min and/or a max.
        if (filter.minValue) {
          filterValues += 'min: ' + filter.minValue.formattedValue + ', ';
        }

        if (filter.maxValue) {
          filterValues += 'max: ' + filter.maxValue.formattedValue + ', ';
        }
        break;
      case 'relative-date':
        filterValues += 'Period: ' + filter.periodType + ', ';
        filterValues += 'RangeN: ' + filter.rangeN + ', ';
        filterValues += 'Range Type: ' + filter.rangeType + ', ';
        break;
      default:
    }

    // Cut off the trailing ", "
    return filterValues.slice(0, -2);
  }

  // This function removes all filters from a dashboard.
  function clearAllFilters () {
    // While performing async task, show loading message to user.
    $('#title').addClass('hidden');

    const dashboard = tableau.extensions.dashboardContent.dashboard;

    dashboard.worksheets.forEach(function (worksheet) {
      worksheet.getFiltersAsync().then(function (filtersForWorksheet) {
        const filterClearPromises = [];

        filtersForWorksheet.forEach(function (filter) {
          filterClearPromises.push(worksheet.clearFilterAsync(filter.fieldName));
        });

        // Same pattern as in fetchFilters, wait until all promises have finished
        // before updating the UI state.
        Promise.allSettled(filterClearPromises).then(function () {
          updateUIState(false);
        });
      });
    });
  }

  // This helper updates the UI depending on whether or not there are filters
  // that exist in the dashboard.  Accepts a boolean.
  function updateUIState (filtersExist) {
    $('#loading').addClass('hidden');
    if (filtersExist) {
      $('#filtersTable').removeClass('hidden').addClass('show');
      $('#noFiltersWarning').removeClass('show').addClass('hidden');
    } else {
      $('#noFiltersWarning').removeClass('hidden').addClass('show');
      $('#filtersTable').removeClass('show').addClass('hidden');
    }
  }

  
})();


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

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}

// console.log(formatDate(Date()));

function submitForm() {
  
  if($('.default-logic').is(":checked") === false){
      let partnerCompletionThreshold = document.getElementById("partner-completion-threshold").value
      let assignmentPassingScore = document.getElementById("assignment-passing-score").value
      let finalExamPassingScore = document.getElementById("final-passing-score").value
      let revenueShareMargin = document.getElementById("revenue-share-margin").value
      let psm = document.getElementById("ppt-psm").value
      let setupDate = formatDate(Date())
      let dim = document.getElementById("partner-dim").value

      console.log(partnerCompletionThreshold, assignmentPassingScore, finalExamPassingScore, revenueShareMargin, psm, dim)

      let post_data = {
        "PARTNER_COMPLETION_THRESHOLD": `${partnerCompletionThreshold}`,
        "QUIZ_ASSIGNMENT_PASSING_SCORE": `${assignmentPassingScore}`,
        "FINAL_EXAM_PASSING_SCORE": `${finalExamPassingScore}`,
        "REVENUE_SHARE_MARGIN": `${revenueShareMargin}`,
        "PSM": `${psm}`,
        "SETUP_DATE": `${setupDate}`,
        "DIM_PARTNER_ID": `${dim}`,
      }
      console.log(post_data)


      fetch('https://publicdma.carruslearn.com/api/ppt', {
      method: "POST",
      body: JSON.stringify(post_data),
      headers: {
          "Authorization": 'Token ad4fa4b186b02a2dc85d1caa4eb9f6cb1b98b2c9',
          "Content-type": "application/json; charset=UTF-8"
      }
      })

      document.getElementsByClassName("submit-message")[0].style.display = 'block'
      setTimeout(function(){
        window.location.reload();
     }, 2000);
    }
  else if ($('.default-logic').is(":checked")){
    let partnerCompletionThreshold = 1
    let assignmentPassingScore = 1
    let finalExamPassingScore = 1
    let revenueShareMargin = 1
    let psm = document.getElementById("ppt-psm").value
    let setupDate = formatDate(Date())
    let dim = document.getElementById("partner-dim").value

    console.log(partnerCompletionThreshold, assignmentPassingScore, finalExamPassingScore, revenueShareMargin, psm, dim)

    let post_data = {
      "PARTNER_COMPLETION_THRESHOLD": `${partnerCompletionThreshold}`,
      "QUIZ_ASSIGNMENT_PASSING_SCORE": `${assignmentPassingScore}`,
      "FINAL_EXAM_PASSING_SCORE": `${finalExamPassingScore}`,
      "REVENUE_SHARE_MARGIN": `${revenueShareMargin}`,
      "PSM": `${psm}`,
      "SETUP_DATE": `${setupDate}`,
      "DIM_PARTNER_ID": `${dim}`,
    }
    console.log(post_data)


    fetch('https://publicdma.carruslearn.com/api/ppt', {
    method: "POST",
    body: JSON.stringify(post_data),
    headers: {
        "Authorization": 'Token ad4fa4b186b02a2dc85d1caa4eb9f6cb1b98b2c9',
        "Content-type": "application/json; charset=UTF-8"
    }
    
    })

    document.getElementsByClassName("submit-message")[0].style.display = 'block'
    setTimeout(function(){
        window.location.reload();
     }, 2000);
  }
  else {
    console.log('huh')
  }
  
}

function loadPartnerPSM(){
  fetch('https://publicdma.carruslearn.com/api/ppt_psm', {
      headers: {
          "Authorization": 'Token ad4fa4b186b02a2dc85d1caa4eb9f6cb1b98b2c9',
      }
  })
  .then(response => {
      return response.json();
  })
  .then(data => {
      const partnerPSM = data.SF_USER_NAME
      selectOptions = document.getElementById("ppt-psm")
      for (i=0; i<partnerPSM.length; i++) {
          selectOptions.options[selectOptions.options.length] = new Option(partnerPSM[i], partnerPSM[i])
      }
  })
}

function checkIfDIMExistsInDB (){
  fetch('https://publicdma.carruslearn.com/api/ppt', {
        headers: {
            "Authorization": 'Token ad4fa4b186b02a2dc85d1caa4eb9f6cb1b98b2c9',
        }
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        console.log(data)
    })
}

window.onload = loadPartnerPSM(), checkIfDIMExistsInDB()

