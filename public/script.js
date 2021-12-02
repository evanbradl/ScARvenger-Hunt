function getHuntList()
{
  // makes GET request to populate drop down menu
  var host = location.hostname;
  var url = 'http://' + host + '/request_hunt_list';
  
  // http get request
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
          try {
            var result_arr = JSON.parse(xmlHttp.responseText);
          } catch (err) {
            // throw an error
           console.log(err);
          }    
          let huntList = [];
          for (const hunt in result_arr){
            let description = 'Welcome to the ' +result_arr[hunt]+ ' hunt!'
            html_options = createHTMLHomeBtn(result_arr[hunt], description, hunt);
            var container = document.createElement("div");
            container.innerHTML = html_options;
            document.getElementById('hunt_list').appendChild(container);
            huntList.push(result_arr[hunt]);
          }
          localStorage.huntList = JSON.stringify(huntList);
          localStorage.complete = "false"
          
  }
  xmlHttp.open("GET", url, true);
  xmlHttp.send(null);

}

function getClueList()
{
  var host = location.hostname;
  var hunt_request = localStorage.currentHunt;
  hunt_request = encodeURI(hunt_request);
  var url = 'http://' + host + '/request_hunt_specific?name='+hunt_request;
  
  // http get request
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
          try {
            var result_arr = JSON.parse(xmlHttp.responseText);
            localStorage.clueList = JSON.stringify(result_arr);
            localStorage.numClues = result_arr.length;
            localStorage.clueActive = 0
            var found = new Array(result_arr.length).fill(false);
            localStorage.cluesFound = JSON.stringify(found);
          } catch (err) {
            // throw an error
           console.log(err);
          }
          
  }
  xmlHttp.open("GET", url, true);
  xmlHttp.send(null);
  document.getElementById('hunt-name').innerHTML = localStorage.currentHunt;
}

function getLocalClueList()
{
  

  clues = JSON.parse(localStorage.clueList || "{}");
  num = localStorage.numClues;
  display = localStorage.clueActive
  text = clues[display]["clue"]["text"]
  display = Number(display) + 1
  clueNumStr = (display).toString().replace(/^0+/, '');
  document.getElementById('hunt-name').innerHTML = localStorage.currentHunt;
  document.getElementById('clue-header').innerHTML = "Clue #" + clueNumStr;
  document.getElementById('clue-text').innerHTML = text;

  //create nav bar
  let numClues = localStorage.numClues;
  numClues = parseInt(numClues);
  for (let i = 0; i < numClues; i++) {
    html_options = createHTMLNavBar(i+1);
    var container = document.createElement('li');
    container.innerHTML = html_options;
    document.getElementById('clue-list').appendChild(container);
  }

  // Change color of completed clues in nav bar
  var found = JSON.parse(localStorage.cluesFound || "{}");
  var foundLength = found.length;
  var numFound = 0
  for (var i = 0; i < foundLength; i++) {
    if (found[i]) {
      document.getElementById("clue"+(i+1)).style.color = "green";
      numFound++;
    }
  }

  // Setting progress bar
  var percentFound = Math.ceil((numFound/foundLength)*100)
  document.getElementById("progress-bar").style.width = percentFound+"%";
}


function changeToClue(number)
{
  number = number - 1
  if ((number >= 0) && (number < localStorage.numClues)) {
    localStorage.clueActive = number
  }
  if (number >= localStorage.numClues) {
    var next = findNextClueNotCompleted();
    localStorage.clueActive = next;
  }
}

function updateScanPage()
{
  // UPDATES SCAN PAGE FROM FIRESTORE, JPG, PNG, JPEG and GLTF are supported file types
  clues = JSON.parse(localStorage.clueList || "{}");
  display = localStorage.clueActive
  marker = clues[display]["clue"]["marker"]
  img = clues[display]["clue"]["img"]
  img_path = '../../img/nothing.png'
  img3d_path = '../../img/nothing.png'
  filetype = img.split('.').pop();
  
  marker_path = "imageTargetSrc: ../../markers/"+ marker +";"
  if (filetype == "png" || filetype == "jpg" || filetype == "jpeg") {
    img_path = '../../img/' + img
  } else if (filetype == "gltf") {
    img3d_path = '../../img/' + img
  }

  document.querySelector('#display').setAttribute('src', img_path)
  document.querySelector('#avatarModel').setAttribute('src', img3d_path)
  
  document.querySelector('#marker').outerHTML = document.querySelector('#marker').outerHTML
  document.querySelector('#marker').setAttribute('mindar-image', marker_path)

  // EVENT LISTENER FOR WHEN TARGET IS FOUND, CLUESFOUND ARRAY WILL BE UPDATED BASED ON CURRENT CLUE
  const exampleTarget = document.querySelector('#example-target');
  exampleTarget.addEventListener("targetFound", event => {
    var found = JSON.parse(localStorage.cluesFound || "{}");
    found[display] = true;
    localStorage.cluesFound = JSON.stringify(found);
    document.getElementById("next-btn").disabled = false;
  });

}

function loadFinishPage()
{
  document.getElementById('completed-btn').addEventListener('click', function() {
    var hawkid = document.getElementById('hawkid-txt').value;
    if (hawkid.length < 1) {
      alert('Blank entries not allowed');
    }
    else {
    var hashed = hawkid.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
    //  Confirming user has completed all clues
    var check = localStorage.complete 

    if (JSON.parse(check) === true) {
      localStorage.hashedID = hashed;
    } else {
      localStorage.hashedID = "NOT COMPLETED"
    }
    window.location.href = "finish-code.html";
  }
    return true;
  });
}

function loadIDPage()
{
  document.getElementById('display-code').innerText = localStorage.hashedID;
}

function nextClue() 
{
  let current = localStorage.clueActive;
  current = parseInt(current);
  current += 2
  changeToClue(current);
  if (localStorage.clueActive<0){
    localStorage.complete = "true";
    window.location.href = "finish.html";
  } else {
  window.location.href = "clue.html";
  }
}

function backToClue() 
{
  let current = localStorage.clueActive;
  current = parseInt(current);
  current += 1
  changeToClue(current);
  //location.reload();
  window.location.href = "clue.html";
}

function setHunt(num)
{
  num = parseInt(num);
  let hunts = JSON.parse(localStorage.huntList || "{}");
  let name = hunts[num];
  localStorage.currentHunt = name;
  window.location.href = "./hunt/home.html";
}

function createHTMLHomeBtn(huntName, description, huntNumber)
{
  huntNumber = huntNumber.toString();
  
  var html_options = '<div class="card"> <div class="card-header" id="heading'+ huntNumber +'"> <h2 class="mb-0"> <button class="btn collapsed" type="button" data-toggle="collapse" data-target="#collapse'+ huntNumber +'" aria-expanded="false" aria-controls="collapse'+ huntNumber +'"> '+ huntName +' </button> </h2> </div> <div id="collapse'+ huntNumber +'" class="collapse" aria-labelledby="heading'+ huntNumber +'" data-parent="#accordionExample"> <div class="card-body"> <p>'+description+'</p> <button type="button" onclick="setHunt(' + huntNumber + ')" class="btn btn-warning">Begin</button> </div> </div> </div>'
  return html_options
}

function createHTMLNavBar(num)
{
  let html_options = '<li class="nav-item"> <a class="nav-link" id="clue'+num+'" onclick="changeToClue('+num+')" href="clue.html">Clue '+num+'</a> </li>';
  return html_options;
}

// RETURNS INDEX OF EARLIEST CLUE NOT FOUND OR -1 IF ALL CLUES FOUND
function findNextClueNotCompleted()
{
  var found = JSON.parse(localStorage.cluesFound || "{}");
  var foundLength = found.length;
  for (var i = 0; i < foundLength; i++) {
    if (found[i] == false) {
      return i;
    }
  }
  return -1;
}


  