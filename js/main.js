// Since main.js is included in all (1) html files, will register the service worker here
// Making sure service workers are supported, then registering it
// Use this cmd to develop on localhost: start chrome --unsafely-treat-insecure-origin-as-secure=http://127.0.0.1:5500/
if('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('../sw_cached_site.js')
            .then(reg => console.log('Service worker registered'))
            .catch(err => console.log(`Service worker: error: ${err}`)) // Example of using a template string
    })
}



// Select2 as a jQuery function, call on any jQuery selector when initializing Select2
// $(document).ready(function() {
//     $('.county-selection-dropdown').select2({
//         placeholder: "Select a county",
//         width: 'resolve' // Overriding the default width
//     });
// });




// Adding the date picker to the input field and setting the current date/options
$('#sampling-date').datepicker('setDate', new Date());
$('#sampling-date').datepicker({
    format: 'mm/dd/yyyy',
    todayBtn: 'linked',
    todayHighlight: true
});





// Saving form info to a text file. Clicks the generated download link automatically
// TODO: refactor, add functionality for all data, properly format it as well

var textFile = null;
makeTextFile = function (text) {
    var data = new Blob([text], {type: 'application/octet-stream'}); // Try using application/octet-stream MIME type to keep iOS from showing in new tab. Might cause issues? text/plain

    // If replacing a previously generated file, need to manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
        window.URL.revokeObjectURL(textFile);
    }
    textFile = window.URL.createObjectURL(data);
    return textFile;
}


var downloadButton = document.getElementById('download-data-button');
var sample_point = document.getElementById('sample-point-id');

downloadButton.addEventListener('click', function () {
    var dlLink = document.createElement('a');
    // var dlBtn2 = document.getElementById('download-button-container'); // Manually showing link too
    // document.body.insertBefore(dlLink, dlBtn2);
    dlLink.setAttribute('download', 'form_data.txt');
    dlLink.href = makeTextFile(sample_point.value);
    document.body.appendChild(dlLink);

    // Wait for link to be added to the document
    window.requestAnimationFrame(function () {
        var event = new MouseEvent('click');
        dlLink.dispatchEvent(event);
        // document.body.removeChild(dlLink);
        });
    
}, false);



// // Testing out saving with filesaver
// var dlButton2 = document.getElementById('dl-data-btn-filesaver');
// dlButton2.addEventListener('click', function () {
//     var sample_point_2 = document.getElementById('sample-point-id');
//     console.log(sample_point_2.value);
//     var blob = new Blob([sample_point_2.value], {type: 'text/plain;charset=utf-8'});
//     saveAs(blob, "hello world.txt")
// });

    


// Testing out data persisting on localstorage. This is done because iOS resets the page when you leave the window, and also in case the user exist the page or hits the back button or some such nonsense
// TODO: switch from localstorage to indexeddb. Currently this is a very long and tedious hack, but for this version of the PWA will work fine. If the app will switch to React/React Native, this will be obsolete anyway.

function exitFunction(e) {
    console.log('Leaving page!'); // Testing that the function excutes on leaving the page
    // var selectedCounty2 = $('.county-selection-dropdown').val(); // Should allow the variable to be defined outside of the prior function
    // let sample_point = document.getElementById('sample-point-id');
    var sample_data = {
        pointID: '',
        sampleDate: '',
        investigators: '',
        projectSite: '',
        applicantOwner: '',
        latitude: '',
        longitude: '',
    };
    sample_data.pointID = $('#sample-point-id').val();
    sample_data.sampleDate = $('#sampling-date').val();
    sample_data.investigators = $('#investigators').val();
    sample_data.projectSite = $('#project-site').val();
    sample_data.applicantOwner = $('#applicant-owner').val();
    sample_data.latitude = $('#latitude').val();
    sample_data.longitude = $('#longitude').val();

    window.localStorage.setItem('sampleData', JSON.stringify(sample_data)); // Have to convert arrays or objects to strings
    
}

function pageLoadFunction(e) {
    var load_sample_data = JSON.parse(window.localStorage.getItem('sampleData'));
    console.log('Loaded sample data: ', load_sample_data);
    $('#sample-point-id').val(load_sample_data.pointID);
    $('#sampling-date').val(load_sample_data.sampleDate);
    $('#investigators').val(load_sample_data.investigators);
    $('#project-site').val(load_sample_data.projectSite);
    $('#applicant-owner').val(load_sample_data.applicantOwner);
    $('#latitude').val(load_sample_data.latitude);
    $('#longitude').val(load_sample_data.longitude);
}


// TESTING OUT LOCALSTORAGE SAVE ON IOS
if ('onpagehide' in window) {
    window.addEventListener('pagehide', exitFunction, false);
} else {
    window.addEventListener('unload', exitFunction, false);
}

window.addEventListener('pageshow', pageLoadFunction, false);
// window.addEventListener('load', pageLoadFunction, false);



// https://www.igvita.com/2015/11/20/dont-lose-user-and-app-state-use-page-visibility/
var pageVisibility = document.visibilityState;

document.addEventListener('visibilitychange', function() {
  // fires when user switches tabs, apps, goes to homescreen, etc.
    if (document.visibilityState == 'hidden') {exitFunction}

    // fires when app transitions from prerender, user returns to the app / tab.
    if (document.visibilityState == 'visible') {pageLoadFunction}
});

