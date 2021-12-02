var html_options;
var html_options_markers;
var clue_num = 0;

var dropdown_select;
var dropdown_select_markers;

let valid_filetypes = {} // PNG, png, JPG, jpeg, gltf, mind
valid_filetypes["png"] = true;
valid_filetypes["jpg"] = true;
valid_filetypes["jpeg"] = true;
valid_filetypes["gltf"] = true;
valid_filetypes["mind"] = true;

// clue dragging (jquery)
$(function(){$("#clues").sortable();});

// fun trash can svg
let trash_can = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"#BD472A\" class=\"bi bi-trash float-end\" viewBox=\"0 0 16 16\" onclick=\"subClue(this.parentNode)\"><style>svg{cursor:pointer;}</style><path d=\"M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z\"/><path fill-rule=\"evenodd\" d=\"M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z\"/></svg>"

function addClue()
{
  clue_num ++;
  var container = document.createElement("div");
  container.className = "ui-state-default shadow-lg p-3 mb-5 bg-white rounded";
  container.id = "clue_div" + String(clue_num);
  container.draggable = "true";
  container.innerHTML = trash_can + "<label>Clue: </label><input class=\"form-control form-control-sm\" type=\"text\" name=\"clue_text\" id=\"clue_input\" /><label>Select Marker:</label><div id=\"marker\">" + dropdown_select_markers + "</div><label> New Marker:</label><input onchange=\"swapUploadTypeMarker(this.parentNode)\" type=\"checkbox\" id=\"cbox\"><div id=\"asset\">" + current_asset_choice + "</div><label> New Asset:</label><input onchange=\"swapUploadTypeAsset(this.parentNode)\" type=\"checkbox\" id=\"cbox\">";
  document.getElementById('clues').appendChild(container);
}
function subClue(element_to_remove)
{
  clue_num --;
  element_to_remove.remove();
}
function swapUploadTypeMarker(element)
{
  if (element.querySelector("#marker_select") != null)
  {
    element.querySelector("#marker").innerHTML = "<input id=\"selectFileButton\" type=\"file\" name=\"up_files\" multiple/>";
  }
  else
  {
    element.querySelector("#marker").innerHTML = dropdown_select_markers;
  }
}
function swapUploadTypeAsset(element)
{
  if (element.querySelector("#asset_select") != null)
  {
    element.querySelector("#asset").innerHTML = "<label id=\"selectFileLabel\">Select File(s):</label><input id=\"selectFileButton\" type=\"file\" name=\"up_files\" multiple/>";
  }
  else
  {
    element.querySelector("#asset").innerHTML = dropdown_select;
  }
}

function saveHunt()
{
  var orig_form_data = new FormData(document.querySelector('form'));
  form_data = new FormData(), file_data = new FormData();

  // add hunt name to start of FormData
  var hunt_name = document.getElementById("hunt_name_input").value;
  form_data.append("hunt_name", hunt_name);
  
  // parse form and add data to new FormData object
  for (var item of orig_form_data.entries()) {
    if (item[0] == 'clue_text'){
      form_data.append("text", item[1]);
    } else if (item[0] == 'markers') {
      form_data.append("marker", item[1]);
    } else {
      if (Object.prototype.toString.call(item[1]) == "[object File]"){
        if (!(item[1].name.split(".").at(-1).toLowerCase() in valid_filetypes)) {
          alert("File uploads must be of types: PNG, png, JPG, jpeg, gltf, mind");
          return;
        }
        form_data.append("img", item[1].name);
        file_data.append('up_files', item[1]);
      } else {
        form_data.append("img", item[1]);
      }
    }
  }
  
  // POST url's
  var host = location.hostname;
  var url_files = 'http://' + host + '/upload_file';
  var url_hunt = 'http://' + host + '/save_hunt';
  
  
  const XML_req_hunt = new XMLHttpRequest();

  // POST file upload
  if (file_data.entries().next().value != undefined) {
    const XML_req_file = new XMLHttpRequest();
    // successful data submission
    XML_req_file.addEventListener('load', function( event ) {
      alert('Files uploaded');
    });
    // error
    XML_req_file.addEventListener(' error', function( event ) {
      alert('Something went wrong. Files not saved');
    });
    // set up POST request
    var host = location.hostname;
    var url = url_files;
    XML_req_file.open('POST', url);
    // Send FormData object
    XML_req_file.send(file_data);
  }

  // POST scav hunt details
  // successful data submission
  XML_req_hunt.addEventListener('load', function( event ) {
    alert('Hunt saved');
    window.location.replace('http://' + host + '/landing_page.html');
  });
  // error
  XML_req_hunt.addEventListener(' error', function( event ) {
    alert('Something went wrong. Hunt not saved');
  });
  // set up POST request
  var host = location.hostname;
  var url = url_hunt;
  XML_req_hunt.open('POST', url);
  // Send FormData object
  XML_req_hunt.send(form_data);
  
}

// TODO: notify user if GET failed (when catch err is thrown)
function getAssets()
{
  // makes GET requests to populate drop down menus
  var host = location.hostname;


  var url = 'http://' + host + '/request_markers';
  // http get request
  var xmlHttpMarker = new XMLHttpRequest();
  xmlHttpMarker.onreadystatechange = function() {
      if (xmlHttpMarker.readyState == 4 && xmlHttpMarker.status == 200)
          try {
            var result_arr = JSON.parse(xmlHttpMarker.responseText);

            if (result_arr){
              for (const asset of Object.keys(result_arr)){
                html_options_markers = html_options_markers + '<option value=\"' + result_arr[asset] + '\">' + result_arr[asset] + '</option>';
              }

              dropdown_select_markers = "<select class=\"form-control form-control-sm\" name=\"markers\" id=\"marker_select\">" + html_options_markers + "</select>";
            }
          } catch (err) {
            // throw an error
          }
  }
  xmlHttpMarker.open("GET", url, true);
  xmlHttpMarker.send(null);


  var url = 'http://' + host + '/request_assets';
  // http get request
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
          try {
            var result_arr = JSON.parse(xmlHttp.responseText);

            if (result_arr){
              for (const asset of Object.keys(result_arr)){
                html_options = html_options + '<option value=\"' + result_arr[asset] + '\">' + result_arr[asset] + '</option>';
              }
            }
  
            // add first clue(s) for user
            dropdown_select = "<label> Select Asset: </label><select class=\"form-control form-control-sm\" name=\"assets\" id=\"asset_select\">" + html_options + "</select>";
            current_asset_choice = dropdown_select;
            
            let decoded_cookie = decodeURIComponent(document.cookie);

            if (!(decoded_cookie === ""))
            {
              let cookie_arr = decoded_cookie.split(";");
              let cookie_huntname = "edit_hunt_name=";
              let cookie_huntname_to_use = "";
              let cookie_to_use = "";
              let cookie_name = " edit_hunt="; // TODO: look at this, the cookie gets saved with a space at the start. This is a bandaid

              for (var i = 0; i < cookie_arr.length; i++)
              {
                if (cookie_arr[i].substring(0, cookie_name.length) == cookie_name)
                {
                  cookie_to_use = cookie_arr[i].substring(cookie_name.length, cookie_arr[i].length);
                } else if (cookie_arr[i].substring(0, cookie_huntname.length) == cookie_huntname)
                {
                  cookie_huntname_to_use = cookie_arr[i].substring(cookie_huntname.length, cookie_arr[i].length);
                  document.getElementById("hunt_name_input").value = cookie_huntname_to_use;
                }

                if ((cookie_huntname_to_use != "") && (cookie_to_use != "")) { break; }
              }

              result_arr = JSON.parse(cookie_to_use);

              for (const clue of Object.keys(result_arr)){
                addClue_editMode(result_arr[clue]["clue"]["text"], result_arr[clue]["clue"]["marker"], result_arr[clue]["clue"]["img"]);
              };
              document.cookie = cookie_name + cookie_to_use + ";expires=Tue, 14 Aug 1945 12:00:00 UTC";
              document.cookie = cookie_huntname + cookie_huntname_to_use + ";expires=Tue, 14 Aug 1945 12:00:00 UTC";
            } else
            {
              addClue();
            }
            
          } catch (err) {
            // throw an error
          }
  }
  xmlHttp.open("GET", url, true);
  xmlHttp.send(null);

}


function addClue_editMode(clue, marker, asset)
{
  clue_num ++;
  var container = document.createElement("div");
  container.className = "ui-state-default shadow-lg p-3 mb-5 bg-white rounded";
  container.id = "clue_div" + String(clue_num);
  container.draggable = "true";
  container.innerHTML = trash_can + "<label>Clue: </label><input class=\"form-control form-control-sm\" type=\"text\" name=\"clue_text\" id=\"clue_input\" /><label>Select Marker:</label><div id=\"marker\">" + dropdown_select_markers + "</div><label> New Marker:</label><input onchange=\"swapUploadTypeMarker(this.parentNode)\" type=\"checkbox\" id=\"cbox\"><div id=\"asset\">" + current_asset_choice + "</div><label> New Asset:</label><input onchange=\"swapUploadTypeAsset(this.parentNode)\" type=\"checkbox\" id=\"cbox\">";
  container.querySelector("#clue_input").value = clue;
  container.querySelector("#marker_select").value = marker;
  container.querySelector("#asset_select").value = asset;
  document.getElementById('clues').appendChild(container);
}