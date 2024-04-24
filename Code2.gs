// Code.gs

// Fonction pour générer les notes par matière
function generateGradesBySubjectAvecNote(selectedSubject) {
  var ss = SpreadsheetApp.openById(
    "13TW5Hm8UyZnnEN1jLwxtHP7KAUmd0UJIwgxXGa04dYE"
  );
  var sheets = ss.getSheets(); // Obtenez toutes les feuilles de calcul
  var gradesBySubject = {};
  var subjectSelectOptions = "";

  // Parcourez chaque feuille de calcul
  sheets.forEach(function (sheet) {
    var sheetName = sheet.getName();
    // Vérifiez si le nom de la feuille se termine par "_notes"
    if (sheetName.slice(-6) === "_notes") {
      var lastRow = sheet.getLastRow();
      var startRow = 2; // Commencer à partir de la deuxième ligne
      var lastColumn = sheet.getLastColumn();

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
          var valid = grade >= 12 ? "V" : "NV";
          gradesBySubject[subject].push({
            studentId: studentId,
            studentName: studentName,
            grade: grade,
            valid: valid,
          });
        }
      }
    }
  });

  var filteredOutput = "";

  for (var subject in gradesBySubject) {
    if (selectedSubject === "" || subject === selectedSubject) {
      filteredOutput +=
        "<div style='text-align: center;'><h2>" + subject + "</h2></div>";
      filteredOutput += "<div class='table'>";
      filteredOutput += "<div class='row header'>";
      filteredOutput +=
        "<div class='cell' style='width: 25%;'>Student ID</div>";
      filteredOutput +=
        "<div class='cell' style='width: 25%;'>Student Name</div>";
      filteredOutput += "<div class='cell' style='width: 25%;'>Grade</div>";
      filteredOutput +=
        "<div class='cell' style='width: 25%;'>Validation</div>";
      filteredOutput += "</div>";
      for (var i = 0; i < gradesBySubject[subject].length; i++) {
        filteredOutput += "<div class='row'>";
        filteredOutput +=
          "<div class='cell' style='width: 25%;'>" +
          gradesBySubject[subject][i].studentId +
          "</div>";
        filteredOutput +=
          "<div class='cell' style='width: 25%;'>" +
          gradesBySubject[subject][i].studentName +
          "</div>";
        filteredOutput +=
          "<div class='cell' style='width: 25%;'>" +
          gradesBySubject[subject][i].grade +
          "</div>";
        filteredOutput +=
          "<div class='cell' style='width: 25%;'>" +
          gradesBySubject[subject][i].valid +
          "</div>";
        filteredOutput += "</div>";
      }
      filteredOutput += "</div>"; // Closing table div
    }
  }

  return filteredOutput;
}

// Fonction pour générer les options de matière
function generateSubjectOptions() {
  var ss = SpreadsheetApp.openById(
    "13TW5Hm8UyZnnEN1jLwxtHP7KAUmd0UJIwgxXGa04dYE"
  );
  var sheets = ss.getSheets(); // Obtenez toutes les feuilles de calcul
  var options = "<option value=''>Tous les sujets</option>";

  sheets.forEach(function (sheet) {
    var sheetName = sheet.getName();
    // Vérifiez si le nom de la feuille se termine par "_notes"
    if (sheetName.slice(-6) === "_notes") {
      var startColumn = 6;
      var lastColumn = sheet.getLastColumn();
      for (var col = startColumn; col <= lastColumn; col++) {
        var subject = sheet.getRange(1, col).getValue();
        options +=
          "<option value='" +
          subject.replace(/\s/g, "") +
          "'>" +
          subject +
          "</option>";
      }
    }
  });

  return options;
}

///////////////////////////////

// Code.gs
function generateGradesBySubjectAvecNoteforOneStudentRole(selectedSubject) {
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
      var valid = "";
      if (grade >= 12) {
        valid = "V";
      } else {
        valid = "NV";
      }
      gradesBySubject[subject].push({
        studentId: studentId,
        studentName: studentName,
        grade: grade,
        valid: valid,
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
        "<div class='cell' style='width: 25%;'>Student ID</div>";
      filteredOutput +=
        "<div class='cell' style='width: 25%;'>Student Name</div>";
      filteredOutput += "<div class='cell' style='width: 25%;'>Grade</div>";
      filteredOutput +=
        "<div class='cell' style='width: 25%;'>validation</div>";

      filteredOutput += "</div>";
      for (var i = 0; i < gradesBySubject[subject].length; i++) {
        filteredOutput += "<div class='row'>";
        filteredOutput +=
          "<div class='cell' style='width: 25%;'>" +
          gradesBySubject[subject][i].studentId +
          "</div>";
        filteredOutput +=
          "<div class='cell' style='width: 25%;'>" +
          gradesBySubject[subject][i].studentName +
          "</div>";
        filteredOutput +=
          "<div class='cell' style='width: 25%;'>" +
          gradesBySubject[subject][i].grade +
          "</div>";
        filteredOutput +=
          "<div class='cell' style='width: 25%;'>" +
          gradesBySubject[subject][i].valid +
          "</div>";

        filteredOutput += "</div>";
      }
      filteredOutput += "</div>"; // Closing table div
    }
  }

  return filteredOutput;
}

function generateSubjectOptionsforOneStudentRole() {
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
