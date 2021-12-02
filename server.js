// server.js
// libraries and frameworks
const express = require("express");
const app = express();
const multer = require('multer');
const fs = require('fs');
const admin = require('firebase-admin');

// file upload storage variables
var f_storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
     },
    filename: function (req, file, cb) {
        cb(null , file.originalname);
    }
});
const upload = multer({ storage: f_storage })
const upload_location = './uploads';

// parser for FormData POST
const post_parse = multer();

// make all the files in 'public' available
app.use(express.static("public"));
app.use(express.static("public/IOWA-Logo_EPS-PNG"));
//app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// firebase admin setup
const serviceAccount = require('./private/senior-design-radsadundergrads-firebase-adminsdk-vvxy6-25a0c339c7.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true })

// admin pages
app.use(express.static("admin"));

app.get('/request_hunt_list', function (req, res) {

  db.collection('ScavengerHunts').get().then((snapshot) => {
    arr_of_hunts = []
    snapshot.forEach((doc) => {
      arr_of_hunts.push(doc.id);
    });

    console.log("[LOG] RECEIVED REQUEST - /request_hunt_list");
    console.log(arr_of_hunts);
    res.send(JSON.stringify(arr_of_hunts));
  });
  
});


// Gets Clue List for Specific Scavenger Hunt
app.get('/request_hunt_specific', function (req, res) {
  console.log("[LOG] RECEIVED REQUEST - /request_hunt_specific");
  let specific_hunt = req.query.name;
  let collectionRef = db.collection('ScavengerHunts');
  let documentRef = collectionRef.doc(specific_hunt);
  documentRef.get().then(documentSnapshot => {
    if (documentSnapshot.exists) {
      console.log(specific_hunt +" CLUES")
      clues = documentSnapshot.data()['clues_list']
      console.log(clues)
      res.send(JSON.stringify(clues));
    }
  }, err => {
    console.log(`Encountered error: ${err}`);
  });
  
});

// listen for requests
const listener = app.listen(process.env.PORT || 80, () => {
  console.log("[LOG] App is listening on port " + listener.address().port);
});


app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});



// send currently available asset filenames to admin client
app.get('/request_assets', function (req, res) {
  var csv_string = '';
  
  console.log("[LOG] RECEIVED REQUEST - /request_assets");

  fs.readdir(upload_location, (err, files) => {
    files.forEach(file => {
      csv_string = csv_string + ',' + file;
    });
    console.log("[LOG] ASSETS - " + JSON.stringify(files));
    res.send(JSON.stringify(files));}
  );
  
});
// send currently available marker filenames to admin client
app.get('/request_markers', function (req, res) {
  const marker_location = "./public/markers";
  var csv_string = '';
  
  console.log("[LOG] RECEIVED REQUEST - /request_markers");

  fs.readdir(marker_location, (err, files) => {
    files.forEach(file => {
      csv_string = csv_string + ',' + file;
    });
    console.log("[LOG] MARKERS - " + JSON.stringify(files));
    res.send(JSON.stringify(files));}
  );
  
});

// deletes a specified hunt
app.get('/delete_hunt', function (req, res) {
  let specific_hunt = req.query.name;
  console.log("Deleting " + specific_hunt);
  let collectionRef = db.collection('ScavengerHunts');
  collectionRef.doc(specific_hunt).delete();
});

// file upload post
app.post('/upload_file', upload.array('up_files', 100), (req, res) => {
  console.log("[LOG] RECEIVED REQUEST - FILE UPLOAD");
  try {
    console.log("[LOG] FILE UPLOAD - SUCCESS");
  }catch(err) {
    console.log("[LOG] FILE UPLOAD - FAILED");
  }
});

// send requested scav hunt save to firebase
app.post('/save_hunt', post_parse.none(), (req, res) => {
  console.log("[LOG] RECEIVED POST - HUNT UPDATE : ");

  console.log(req.body);

  hunt_name = req.body['hunt_name'];
  texts = req.body['text'];
  markers = req.body['marker'];
  imgs = req.body['img'];

  hunt_clues = [];

  for (let i = 0; i < texts.length; i++)
  {
    var current_clue = {};

    // if the hunt only has 1 clue, make sure to not add indexes of string
    if (Object.prototype.toString.call(texts) === '[object String]') {
      current_clue["clue"] = {}
      current_clue["clue"]["img"] = imgs;
      current_clue["clue"]["marker"] = markers;
      current_clue["clue"]["text"] = texts;
      hunt_clues.push(current_clue);
      break;
    }

    current_clue["clue"] = {}
    current_clue["clue"]["img"] = imgs[i];
    current_clue["clue"]["marker"] = markers[i];
    current_clue["clue"]["text"] = texts[i];
    hunt_clues.push(current_clue);
  }

  let new_hunt = {};
  new_hunt["ConnectID"] = "undefined";
  new_hunt["Creator"] = "hogan@hogan.com";
  new_hunt["clues_list"] = hunt_clues;

  db.collection('ScavengerHunts').doc(hunt_name).set(new_hunt);

  res.end();

});