function getDataFromSheet(sheetName) {
  var sheets = SpreadsheetApp.openById(
    "1Jl8sbjUkZ6xG58M_YQ0xGF9sV4S0CRA1nQN--HSJkVc"
  ).getSheets();
  var allData = [];

  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    if (sheetName && sheet.getName() !== sheetName) {
      continue; // Skip this sheet if a specific sheet name is provided and it doesn't match
    }
    var lastRow = sheet.getLastRow();
    var range = sheet.getRange("B1:B" + lastRow); // Assuming professor's email is in column B
    var values = range.getValues();

    // Find the index of the row where the professor's email is located
    var professorEmailRowIndex = values.findIndex(
      (row) => row[0] === getSession().user
    );

    // Check if professor's email is found
    if (professorEmailRowIndex !== -1) {
      var dataRange = sheet.getRange("A1:H" + professorEmailRowIndex);
      var dataValues = dataRange.getValues();
      allData = allData.concat(dataValues);
    }
  }

  return JSON.stringify(allData);
}

function getDataFromAllSheets() {
  return getDataFromSheet(null); // Pass null to indicate that we want data from all sheets
}

function submitGradeProblem(
  sheetName,
  problemDescription,
  commonProblem,
  adminName
) {
  // Log the problem report with admin name
  console.log(
    "Hello " +
      adminName +
      ", a problem was reported on sheet " +
      sheetName +
      ": " +
      problemDescription +
      " (" +
      commonProblem +
      ")"
  );
}

function getStatistics() {
  var sheets = SpreadsheetApp.openById(
    "1Jl8sbjUkZ6xG58M_YQ0xGF9sV4S0CRA1nQN--HSJkVc"
  ).getSheets();
  var allMarks = [];

  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    var lastRow = sheet.getLastRow();
    var range = sheet.getRange("E2:E" + lastRow); // Assuming marks are in column E
    var values = range.getValues();

    for (var j = 0; j < values.length; j++) {
      var mark = parseFloat(values[j][0]);
      if (!isNaN(mark)) {
        // Check if it's a valid number
        allMarks.push(mark);
      }
    }
  }

  if (allMarks.length > 0) {
    var highestMark = Math.max(...allMarks);
    var lowestMark = Math.min(...allMarks);
    var meanMark =
      allMarks.reduce((acc, curr) => acc + curr, 0) / allMarks.length;
  } else {
    var highestMark = 0;
    var lowestMark = 0;
    var meanMark = 0;
  }

  return {
    highestMark: highestMark.toFixed(2),
    lowestMark: lowestMark.toFixed(2),
    meanMark: meanMark.toFixed(2),
  };
}

///////////////////////////
function getSheetNameById(sheetId) {
  var sheets = SpreadsheetApp.openById(
    "1Jl8sbjUkZ6xG58M_YQ0xGF9sV4S0CRA1nQN--HSJkVc"
  ).getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === sheetId) {
      return sheets[i].getName();
    }
  }
  return null; // Return null if sheet with given ID is not found
}

// function doGet() {
//   var htmlOutput = HtmlService.createHtmlOutputFromFile('ReclamationForm')
//       .setTitle('Reclamation Form');
//   return htmlOutput;
// }

function getSheetNames() {
  var email = getSession().user;
  var spreadsheet = SpreadsheetApp.openById(
    "1Jl8sbjUkZ6xG58M_YQ0xGF9sV4S0CRA1nQN--HSJkVc"
  );
  var sheets = spreadsheet.getSheets();
  var sheetNames = sheets
    .filter(function (sheet) {
      var range = sheet.getRange("B:B");
      var values = range.getValues();
      for (var i = 0; i < values.length; i++) {
        if (values[i][0] === email) {
          return true;
        }
      }
      return false;
    })
    .map(function (sheet) {
      return sheet.getName();
    });
  Logger.log(sheetNames);
  return sheetNames; // Convert sheet names to JSON format
}

function sendReclamation(form) {
  var adminSheetId = "1vNDTxCmOLRBACZrFG13ziiM5-JDKOrif1LhB3aKR6gU";
  var adminSheet = SpreadsheetApp.openById(adminSheetId).getSheets()[0];

  var adminName = adminSheet
    .getRange(2, 1, adminSheet.getLastRow() - 1)
    .getValues()
    .flat();
  var adminEmail = adminSheet
    .getRange(2, 2, adminSheet.getLastRow() - 1)
    .getValues()
    .flat();
  var adminIndex = adminName.indexOf(form.admin);
  var adminEmailAddress = adminEmail[adminIndex];

  var sheetName = form.firstInput;
  var commonProblemText = form.commonProblems; // Get the selected problem directly from the form

  var emailCheck = SpreadsheetApp.openById(
    "1Jl8sbjUkZ6xG58M_YQ0xGF9sV4S0CRA1nQN--HSJkVc"
  )
    .getSheetByName(sheetName)
    .getRange("B38")
    .getValue();
  Logger.log("Email in B38: " + emailCheck);

  var reclamationInfo = {
    firstInput: sheetName,
    commonProblem: commonProblemText, // Assign the selected problem from the form
    problemDescription: form.problemDescription,
    adminEmail: adminEmailAddress,
    adminName: form.admin, // Added adminName to the reclamationInfo object
  };

  // Construct email subject
  var subject =
    "Problème de Saisie des Notes - Feuille: " + reclamationInfo.firstInput;

  // Construct email body
  var message =
    "Bonjour " +
    reclamationInfo.adminName +
    ",\n\n" +
    'Je vous écris pour signaler un problème rencontré lors de la saisie des notes dans la feuille de calcul "' +
    reclamationInfo.firstInput +
    '".\n\n' +
    "Description du Problème:\n" +
    reclamationInfo.problemDescription +
    "\n\n" +
    "Problème Commun Sélectionné:\n" +
    reclamationInfo.commonProblem +
    "\n\n" +
    "Je vous remercie de votre attention à ce sujet et de votre aide pour le résoudre.\n\n" +
    "Cordialement,\n" +
    "Votre Nom"; // Replace 'Votre Nom' with your actual name

  // Send email
  GmailApp.sendEmail(reclamationInfo.adminEmail, subject, message);

  // Clear form inputs
  form.firstInput.value = "";
  form.commonProblems.value = "";
  form.problemDescription.value = "";
  form.admin.value = "";
}

function getAdminNames() {
  var adminSheetId = "1vNDTxCmOLRBACZrFG13ziiM5-JDKOrif1LhB3aKR6gU";
  var adminSheet = SpreadsheetApp.openById(adminSheetId).getSheets()[0];
  var adminNames = adminSheet
    .getRange(2, 1, adminSheet.getLastRow() - 1, 1)
    .getValues()
    .flat();
  Logger.log(adminNames);
  return adminNames;
}

// Function to send an email
// Function to send an email
// Function to get the email address from the first row (ignoring the header) in column E
// Function to get email addresses from all sheets ending with "_notes"
function getEmailAddress() {
  var spreadsheet = SpreadsheetApp.openById(
    "13TW5Hm8UyZnnEN1jLwxtHP7KAUmd0UJIwgxXGa04dYE"
  );
  var sheets = spreadsheet.getSheets(); // Get all sheets in the spreadsheet

  var emailAddresses = [];

  // Loop through each sheet
  sheets.forEach(function (sheet) {
    // Check if sheet name ends with "_notes"
    if (sheet.getName().endsWith("_notes")) {
      var data = sheet.getRange(2, 5).getValue(); // Assuming the email address is in column E, starting from the second row (ignoring the header)
      emailAddresses.push(data); // Add email address to the array
    }
  });

  Logger.log(emailAddresses);
  return emailAddresses;
}

// Function to send emails to all email addresses in a specific column of sheets ending with "_notes"
function sendEmail() {
  var spreadsheet = SpreadsheetApp.openById(
    "13TW5Hm8UyZnnEN1jLwxtHP7KAUmd0UJIwgxXGa04dYE"
  );
  var sheets = spreadsheet.getSheets(); // Get all sheets in the spreadsheet

  // Loop through each sheet
  sheets.forEach(function (sheet) {
    // Check if sheet name ends with "_notes"
    if (sheet.getName().endsWith("_notes")) {
      var data = sheet.getRange(2, 5, 3, 1).getValues(); // Assuming the email addresses are in column E, starting from the second row (ignoring the header)

      // Loop through each email address and send an email
      data.forEach(function (row) {
        var email = row[0]; // Assuming email addresses are in the first column of the range
        // Check if email address is not empty and is a valid email address
        Logger.log(email);
        if (email && /\S+@\S+\.\S+/.test(email)) {
          var subject = "vos notes sont disponibles"; // Replace with your subject
          var body = "vos notes sont disponibles "; // Replace with your body content

          GmailApp.sendEmail(email, subject, body);
        }
      });
    }
  });
}

// Function to handle button click
function handleButtonClick() {
  var email = getEmailAddress(); // Get the email address
  sendEmail(email, "mise a jour de notes", "nouvelle mise a jour de notes"); // Send the email
}
