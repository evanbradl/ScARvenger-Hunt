// fun trash can svg
let trash_can = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"#BD472A\" class=\"bi bi-trash float-end\" viewBox=\"0 0 16 16\" onclick=\"delete_hunt(this.parentNode)\"><style>svg{cursor:pointer;}</style><path d=\"M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z\"/><path fill-rule=\"evenodd\" d=\"M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z\"/></svg>"

document.addEventListener("DOMContentLoaded", function() {
  populate_hunts();
});
function populate_hunts() {
  // clear previous cards
  document.getElementById('hunt_cards').innerHTML = "";

  // makes GET requests to populate drop down menus
  var host = location.hostname;
  var url = 'http://' + host + '/request_hunt_list';
  // http get request
  var xmlHttpMarker = new XMLHttpRequest();
  xmlHttpMarker.onreadystatechange = function() {
      if (xmlHttpMarker.readyState == 4 && xmlHttpMarker.status == 200)
          try {
            var result_arr = JSON.parse(xmlHttpMarker.responseText);

            if (result_arr){
              for (const hunt of Object.keys(result_arr)){
                // Add tile to HTML
                var container = document.createElement("div");
                container.className = "card shadow-lg m-3 p-3 rounded";
                container.id = "hunt_card";
                container.style.cssText = "width: 12rem;";
                container.innerHTML = "<div class=\"mb-3\">" + trash_can + "<p id=\"hunt_name\">" + result_arr[hunt] + "</p></div><a id=\"edit_button\" onclick=\"edit_hunt(this.parentNode)\" class=\"btn btn-dark\">Edit Hunt</a>";
                document.getElementById('hunt_cards').appendChild(container);
              };
            }
          } catch (err) {
            // throw an error
          }
  }
  xmlHttpMarker.open("GET", url, true);
  xmlHttpMarker.send(null);
}

function edit_hunt(parent_element) {
  console.log("hey we called edit_hunt!");
  // makes GET requests to populate drop down menus
  var host = location.hostname;
  var hunt_name = parent_element.querySelector("#hunt_name").innerHTML;
  var url = 'http://' + host + '/request_hunt_specific?name=' + hunt_name;
  // http get request
  var xmlHttpMarker = new XMLHttpRequest();
  xmlHttpMarker.onreadystatechange = function() {
      if (xmlHttpMarker.readyState == 4 && xmlHttpMarker.status == 200)
          try {
            if (xmlHttpMarker.responseText){
              document.cookie = "edit_hunt_name=" + hunt_name + ";";
              document.cookie = "edit_hunt=" + xmlHttpMarker.responseText + ";";
              window.location.href = "http://" + host + "/hunt_wizard.html";
            }
          } catch (err) {
            // throw an error
          }
  }
  xmlHttpMarker.open("GET", url, true);
  xmlHttpMarker.send(null);
}

function delete_hunt(parent_element) {
  var host = location.hostname;
  var hunt_name = parent_element.querySelector("#hunt_name").innerHTML;
  var url = 'http://' + host + '/delete_hunt?name=' + hunt_name;

  const XML_req = new XMLHttpRequest();
  // successful data submission
  XML_req.addEventListener('load', function( event ) {
    alert(hunt_name + ' deleted');
  });
  // error
  XML_req.addEventListener(' error', function( event ) {
    alert('Something went wrong.');
  });
  // set up request
  XML_req.open('GET', url);
  // Send
  XML_req.send(null);

  populate_hunts();
}