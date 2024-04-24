let MySheets = SpreadsheetApp.getActiveSpreadsheet();
let LoginSheet = MySheets.getSheetByName("login");

function doGet(e) {
  var output;
  var sess = getSession();

  if (sess.loggedIn) {
    var page;
    if (e && e.parameter && e.parameter.page) {
      page = e.parameter.page;
    } else {
      page = "main";
    }

    if (sess.role.startsWith("etudiant")) {
      if (page.startsWith("etudiant")) {
        page = "main";
      }
    } else if (sess.role.startsWith("admin")) {
      if (!page.startsWith("admin")) {
        page = "abdo";
      }
    } else if (sess.role.startsWith("etudiant_isic1")) {
      if (!page.startsWith("etudiant_isic1")) {
        page = "main2";
      }
    } else if (sess.role.startsWith("prof")) {
      if (!page.startsWith("prof")) {
        if (
          !page.startsWith("Dashboard") &&
          !page.startsWith("ReclamationForm")
        ) {
          page = "ReclamationForm";
        } else if (page.startsWith("ReclamationForm")) {
          page = "Dashboard";
        }
      }
    }

    output = HtmlService.createTemplateFromFile(page);
  } else {
    output = HtmlService.createTemplateFromFile("login");
  }

  return output.evaluate();
}

//permet garder email pour l afficher
function getUserInfo() {
  var sess = getSession();
  var userInfo = {
    user: sess.user, // Assuming you have stored the user information in the session
    password: sess.password, // Assuming you have stored the password information in the session
    role: sess.role,
  };
  return userInfo;
}
////

function myURL() {
  return ScriptApp.getService().getUrl();
}
function setSession(session) {
  var sId = Session.getTemporaryActiveUserKey();
  var uProp = PropertiesService.getUserProperties();
  uProp.setProperty(sId, JSON.stringify(session));
}
function getSession() {
  var sId = Session.getTemporaryActiveUserKey();
  var uProp = PropertiesService.getUserProperties();
  var sData = uProp.getProperty(sId);
  return sData ? JSON.parse(sData) : { loggedIn: false };
}

//////////////////////adding role
function loginUser(pUID, pPassword) {
  if (loginCheck(pUID, pPassword)) {
    var sess = getSession();
    sess.loggedIn = true;
    sess.user = pUID;
    sess.password = pPassword;

    var userRole = getUserRoleFromSheet(pUID);
    sess.role = userRole; // Stocker le rôle dans la session
    setSession(sess);
    return "success";
  } else {
    return "failure";
  }
}

function getUserRoleFromSheet(email) {
  var role = ""; // Initialiser le rôle à une chaîne vide
  var sheet = SpreadsheetApp.openById(
    "13TW5Hm8UyZnnEN1jLwxtHP7KAUmd0UJIwgxXGa04dYE"
  ).getSheetByName("login");
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] == email) {
      role = values[i][2];
      Logger.log("role " + role);
      break;
    }
  }
  Logger.log("role " + role);
  return role;
}

///////////////////////////
function logoutUser() {
  var sess = getSession();
  sess.loggedIn = false;
  setSession(sess);
}
function loginCheck(pUID, pPassword) {
  if (!pUID || !pPassword) {
    return false; // Return false if either pUID or pPassword is null
  }

  let LoginPass = false;
  let ReturnData = LoginSheet.getRange("A:A")
    .createTextFinder(pUID)
    .matchEntireCell(true)
    .findAll();

  ReturnData.forEach(function (range) {
    let StartRow = range.getRow();
    let TmpPass = LoginSheet.getRange(StartRow, 2).getValue();
    if (TmpPass == pPassword) {
      LoginPass = true;
    }
  });

  return LoginPass;
}

function OpenPage(PageName) {
  return HtmlService.createHtmlOutputFromFile(PageName).getContent();
}
function UserRegister(pUID, pPassword, pName) {
  let RetMsg = "";
  let ReturnData = LoginSheet.getRange("A:A")
    .createTextFinder(pUID)
    .matchEntireCell(true)
    .findAll();
  let StartRow = 0;
  ReturnData.forEach(function (range) {
    StartRow = range.getRow();
  });

  if (StartRow > 0) {
    RetMsg = "danger, User Already Exists";
  } else {
    LoginSheet.appendRow([pUID, pPassword, pName]);
    RetMsg = "success, User Successfully Registered";
  }

  return RetMsg;
}

/////
function includeHeader() {
  //05
  return HtmlService.createTemplateFromFile("header.html")
    .evaluate()
    .getContent();
}
function includeHeader2() {
  //05
  return HtmlService.createTemplateFromFile("header2.html")
    .evaluate()
    .getContent();
}
function includeHeaderAdmin() {
  //05
  return HtmlService.createTemplateFromFile("header3.html")
    .evaluate()
    .getContent();
}
function includeHeaderProf() {
  //05
  return HtmlService.createTemplateFromFile("headerprof.html")
    .evaluate()
    .getContent();
}

function myURL() {
  //06
  return ScriptApp.getService().getUrl();
}

////////////////////////les notes liste ..

// Code.gs
function generateGradesBySubject(selectedSubject) {
  var ss = SpreadsheetApp.openById(
    "13TW5Hm8UyZnnEN1jLwxtHP7KAUmd0UJIwgxXGa04dYE"
  );
  ////////:
  var etudiant = getSession().role; // Supposons que getSession().user renvoie "etudiant_xxxx"
  var partieVariable = etudiant.split("_")[1]; // Cela divisera la chaîne en un tableau en utilisant le caractère "_" comme séparateur et prendra la deuxième partie du tableau
  Logger.log(partieVariable); // Cela affichera "xxxx" dans les journaux
  var namesheeet = partieVariable + "_notes";
  Logger.log(namesheeet);
  ///////
  var sheet = ss.getSheetByName(namesheeet);
  var lastRow = sheet.getLastRow();
  var startRow = 2; // Commencer à partir de la deuxième ligne
  var lastColumn = sheet.getLastColumn();
  var gradesBySubject = {};
  var subjectSelectOptions = "";

  for (var col = 1; col <= lastColumn; col++) {
    var subject = sheet.getRange(1, col).getValue();
    gradesBySubject[subject] = [];
    subjectSelectOptions +=
      "<option value='" +
      subject.replace(/\s/g, "") +
      "'>" +
      subject +
      "</option>";
    for (var row = startRow; row <= lastRow; row++) {
      var studentId = sheet.getRange(row, 1).getValue();
      var studentName = sheet.getRange(row, 2).getValue();
      var grade = sheet.getRange(row, col).getValue();
      if (grade >= 12) {
        grade = "V";
      } else {
        grade = "NV";
      }
      gradesBySubject[subject].push({
        studentId: studentId,
        studentName: studentName,
        grade: grade,
      });
    }
  }

  var filteredOutput = "";

  for (var subject in gradesBySubject) {
    if (selectedSubject === "" || subject === selectedSubject) {
      filteredOutput +=
        "<div style='text-align: center;'><h2>" + subject + "</h2></div>";
      filteredOutput += "<div class='table'>";
      filteredOutput += "<div class='row header'>";
      filteredOutput +=
        "<div class='cell' style='width: 33.3%;'>Student ID</div>";
      filteredOutput +=
        "<div class='cell' style='width: 33.3%;'>Student Name</div>";
      filteredOutput += "<div class='cell' style='width: 33.3%;'>Grade</div>";
      filteredOutput += "</div>";
      for (var i = 0; i < gradesBySubject[subject].length; i++) {
        filteredOutput += "<div class='row'>";
        filteredOutput +=
          "<div class='cell' style='width: 33.3%;'>" +
          gradesBySubject[subject][i].studentId +
          "</div>";
        filteredOutput +=
          "<div class='cell' style='width: 33.3%;'>" +
          gradesBySubject[subject][i].studentName +
          "</div>";
        filteredOutput +=
          "<div class='cell' style='width: 33.3%;'>" +
          gradesBySubject[subject][i].grade +
          "</div>";
        filteredOutput += "</div>";
      }
      filteredOutput += "</div>"; // Closing table div
    }
  }

  return filteredOutput;
}

function generateSubjectOptions() {
  var ss = SpreadsheetApp.openById(
    "13TW5Hm8UyZnnEN1jLwxtHP7KAUmd0UJIwgxXGa04dYE"
  );
  ////////:
  var etudiant = getSession().role; // Supposons que getSession().user renvoie "etudiant_xxxx"
  var partieVariable = etudiant.split("_")[1]; // Cela divisera la chaîne en un tableau en utilisant le caractère "_" comme séparateur et prendra la deuxième partie du tableau
  Logger.log(partieVariable); // Cela affichera "xxxx" dans les journaux
  var namesheeet = partieVariable + "_notes";
  Logger.log(namesheeet);
  ///////
  var sheet = ss.getSheetByName(namesheeet);
  var startColumn = 6;
  var lastColumn = sheet.getLastColumn();
  var options = "<option value=''>Tous les sujets</option>";

  for (var col = startColumn; col <= lastColumn; col++) {
    var subject = sheet.getRange(1, col).getValue();
    options +=
      "<option value='" +
      subject.replace(/\s/g, "") +
      "'>" +
      subject +
      "</option>";
  }

  return options;
}

//page d information
function displayAllData() {
  var ss = SpreadsheetApp.openById(
    "13TW5Hm8UyZnnEN1jLwxtHP7KAUmd0UJIwgxXGa04dYE"
  ); // Remplacez par l'ID de votre feuille de calcul

  ////////:
  var etudiant = getSession().role; // Supposons que getSession().user renvoie "etudiant_xxxx"
  var partieVariable = etudiant.split("_")[1]; // Cela divisera la chaîne en un tableau en utilisant le caractère "_" comme séparateur et prendra la deuxième partie du tableau
  Logger.log(partieVariable); // Cela affichera "xxxx" dans les journaux
  var namesheeet = partieVariable + "_notes";
  Logger.log(namesheeet);
  ///////

  var sheet = ss.getSheetByName(namesheeet);
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();
  var data = sheet.getRange(1, 1, lastRow, lastColumn).getValues(); // Récupère toutes les données de la feuille
  var user = getSession().user; // Récupère l'utilisateur actuel à partir de la session

  // Chercher la ligne où l'utilisateur se trouve dans la colonne E
  var userRow = -1; // Initialisation à -1 pour le cas où l'utilisateur n'est pas trouvé
  for (var row = 1; row < lastRow; row++) {
    if (data[row][4] === user) {
      // Colonne E est indexée à partir de 4 (0-based index)
      userRow = row;
      break; // Sortir de la boucle dès que l'utilisateur est trouvé
    }
  }

  if (userRow !== -1) {
    var testtext = "<div class='container'>";
    var maxLength = 0;

    // Trouver la longueur maximale des clés pour aligner les colonnes
    for (var i = 0; i < 5; i++) {
      maxLength = Math.max(maxLength, data[0][i].length);
    }

    for (var i = 0; i < 5; i++) {
      testtext += "<div class='row'>";
      testtext +=
        "<div class='col-6'>" +
        padRight(data[0][i] + ":", maxLength + 4) +
        "</div>"; // Première colonne avec le label

      // Vérifier si la valeur est une date
      if (isDate(data[userRow][i])) {
        // Formater la date au format "dd/mm/yyyy"
        var formattedDate = formatDate(data[userRow][i]);
        testtext += "<div class='col-6'>" + formattedDate + "</div>"; // Deuxième colonne avec la valeur formatée
      } else {
        testtext += "<div class='col-6'>" + data[userRow][i] + "</div>"; // Deuxième colonne avec la valeur
      }

      testtext += "</div>"; // Fermeture de la ligne
    }
    testtext += "</div>";

    // Fonction pour vérifier si une valeur est une date
    function isDate(value) {
      return new Date(value) !== "Invalid Date" && !isNaN(new Date(value));
    }

    // Fonction pour formater une date au format "dd/mm/yyyy"
    function formatDate(date) {
      var formattedDate = new Date(date).toLocaleDateString("fr-FR");
      return formattedDate;
    }

    // Fonction pour aligner une chaîne à droite avec des espaces
    function padRight(string, length) {
      return string + " ".repeat(length - string.length);
    }

    var tableHTML = testtext;

    tableHTML += "<table >";

    tableHTML += "<tr>";
    tableHTML += "<th>Matière</th>";
    tableHTML += "<th>Note</th>";
    tableHTML += "<th>Validation</th>";
    tableHTML += "</tr>";

    for (var i = 5; i < lastColumn; i++) {
      tableHTML += "<tr>";

      var matiere = data[0][i];
      var note = data[userRow][i];
      var validation = "";

      if (parseInt(note) < 12) {
        validation = "<td style='color: red;'>NV</td>";
      } else {
        validation = "<td style='color: green;'>V</td>";
      }

      tableHTML += "<td>" + matiere + "</td>";
      tableHTML += "<td>" + note + "</td>";
      tableHTML += validation;
      tableHTML += "</tr>";
    }

    tableHTML += "</table>"; // Fin du tableau HTML

    return tableHTML;
  } else {
    return "L'utilisateur n'a pas été trouvé dans les données.";
  }
}
