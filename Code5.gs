function afficher(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log(ss);
  var notesname = name + "_notes";
  var sheet = ss.getSheetByName(notesname);
  Logger.log(sheet);
  var data = sheet.getDataRange().getValues();
  Logger.log(data);

  var headerRow = data[0];
  var emailIndex = headerRow.indexOf("email");
  var resultLinks = [];

  // Proceed from 'email' column onwards, assuming these are modules
  headerRow.slice(emailIndex + 1).forEach(function (column, index) {
    var realIndex = emailIndex + 1 + index;
    var moduleName = column;
    var newSheetName = moduleName + " Results";
    var newSheet = ss.insertSheet(newSheetName);
    newSheet.appendRow([
      "apoL_a01_code",
      "apoL_a02_nom",
      "apoL_a03_prenom",
      "apoL_a04_naissance",
      "email",
      "Affichage",
    ]);

    // Populate and export to PDF, then delete the sheet
    data.slice(1).forEach(function (row) {
      var studentInfo = [row[0], row[1], row[2], row[3], row[4]];
      var grade = row[realIndex];
      var affichage = grade > 10 ? "V" : "NV";
      newSheet.appendRow(studentInfo.concat([affichage]));
    });

    var pdfFile = exportSheetToPDF(newSheet, moduleName);
    ss.deleteSheet(newSheet);
    resultLinks.push({ moduleName: moduleName, url: pdfFile.getUrl() });
  });

  return resultLinks;
}

function exportSheetToPDF(sheet, moduleName) {
  var url = SpreadsheetApp.getActiveSpreadsheet()
    .getUrl()
    .replace("edit", "export");
  var options =
    "?exportFormat=pdf&format=pdf&size=letter&portrait=true&fitw=true&sheetnames=false&printtitle=false&pagenumbers=false&gridlines=false&fzr=false&gid=" +
    sheet.getSheetId();
  var token = ScriptApp.getOAuthToken();
  var response = UrlFetchApp.fetch(url + options, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  var blob = response.getBlob();
  var folder = DriveApp.getFolderById("1NXHLQYmJZoWA0_NeYBSUiiAT9V7lR3bB");
  var pdfFile = folder.createFile(blob).setName(moduleName + ".pdf");
  return pdfFile;
}

function createClassroom(courseName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var loginSheet = ss.getSheetByName("login");
  var filieresSheet = ss.getSheetByName("filieres");

  if (!filieresSheet) {
    // Create the 'filieres' sheet if it does not exist
    filieresSheet = ss.insertSheet("filieres");
    filieresSheet.appendRow(["ID", "Course Name", "Classroom ID"]); // Header row
  }

  var data = loginSheet.getDataRange().getValues();

  var studentEmails = [];
  var teacherEmails = [];

  // Read data and classify emails based on role
  data.forEach(function (row) {
    var email = row[0];
    var role = row[2].split("_")[0]; // Splitting the role and taking the first part
    var filiere = row[2].split("_")[1];
    if (role === "student") {
      studentEmails.push(email);
      Logger.log("Student assigned: " + filiere + " " + email);
    } else if (role === "admin") {
      teacherEmails.push(email);
      Logger.log("Teacher assigned: " + filiere + " " + email);
    }
  });

  // Create the course
  var course = {
    name: courseName,
    ownerId: "me",
    courseState: "PROVISIONED",
  };

  try {
    var newCourse = Classroom.Courses.create(course);
    sendInvitations(newCourse.id, studentEmails, "STUDENT");
    sendInvitations(newCourse.id, teacherEmails, "TEACHER");

    // Incremental ID logic
    var lastRow = filieresSheet.getLastRow();
    var nextId =
      lastRow > 0 ? filieresSheet.getRange(lastRow, 1).getValue() + 1 : 1;

    // Append new course data to 'filieres' sheet
    filieresSheet.appendRow([nextId, courseName, newCourse.id]);

    return "Course created successfully with ID: " + newCourse.id;
  } catch (error) {
    return "Failed to create course: " + error.message;
  }
}

function sendInvitations(courseId, emails, role) {
  emails.forEach(function (email) {
    var invitation = {
      userId: email,
      courseId: courseId,
      role: role,
    };
    try {
      Logger.log("Inivted" + email);
      Classroom.Invitations.create(invitation);
    } catch (error) {
      Logger.log(
        "Failed to send invitation to " +
          role.toLowerCase() +
          ": " +
          email +
          ", Error: " +
          error.message
      );
    }
  });
}

// Function to send invitations
function sendInvitation(courseId, role, userEmail) {
  var invitation = {
    userId: userEmail,
    courseId: courseId,
    role: role,
  };

  try {
    var response = Classroom.Invitations.create(invitation);
    Logger.log("Invitation sent: " + response.id);
  } catch (error) {
    Logger.log("Failed to send invitation: " + error.message);
  }
}

function getFiliereData() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const filiereSheet = spreadsheet.getSheetByName("Filieres");
  if (!filiereSheet) {
    console.error('Sheet "Filieres" not found.');
    return []; // Return an empty array if the sheet is not found
  }

  // Ensure there are data rows before fetching data
  const lastRow = filiereSheet.getLastRow();
  if (lastRow < 2) {
    return []; // Return an empty array if there are no data rows
  }

  // Retrieves all data from rows 2 to the last row, columns 1 to 3 (Id, Filiere Name, Classroom ID)
  const data = filiereSheet.getRange(2, 1, lastRow - 1, 3).getValues();
  return data; // Returns an array of arrays, each containing [Id, Filiere Name, Classroom ID]
}

function createAndFillSheet() {
  // Create a new Google Sheets file
  var newSheet = SpreadsheetApp.create("My New Sheet");

  // Get the URL of the new Google Sheets file
  var sheetUrl = newSheet.getUrl();

  // Log the URL
  Logger.log("URL of the new Sheet: " + sheetUrl);

  // Get the first sheet in the new Google Sheets file
  var sheet = newSheet.getSheets()[0];

  // Define some sample data
  var data = [
    ["Name", "Age", "Email"],
    ["John Doe", 35, "john.doe@example.com"],
    ["Jane Smith", 28, "jane.smith@example.com"],
  ];

  // Fill the sheet with the sample data
  sheet.getRange(1, 1, data.length, data[0].length).setValues(data);

  // Protect the entire sheet
  var protection = sheet.protect().setDescription("Sample protected sheet");

  // Ensure the current user is an editor before removing others.
  protection.removeEditors(protection.getEditors());

  // If the user's edit permission comes from a group, the script will throw an exception upon removing the group.
  if (protection.canDomainEdit()) {
    protection.setDomainEdit(false);
  }
}

function affichageClassroom(courseId, classname) {
  var links = afficher(classname); // Fetch all module PDF links
  var announcementText = "Check out the module results:\n";
  links.forEach(function (link) {
    announcementText += link.moduleName + ": " + link.url + "\n";
  });

  var announcement = {
    text: announcementText,
    assigneeMode: "ALL_STUDENTS",
    state: "PUBLISHED",
  };

  try {
    Classroom.Courses.Announcements.create(announcement, courseId);
    return "Announcement posted successfully.";
  } catch (e) {
    return "Failed to post announcement: " + e.message;
  }
}

function listCourses() {
  try {
    const response = Classroom.Courses.list();
    const courses = response.courses;

    if (!courses || courses.length === 0) {
      console.log("No courses found.");
      return;
    }

    // Print the course names and IDs of the available courses.
    for (const course of courses) {
      console.log("%s (%s)", course.name, course.id);
    }
  } catch (err) {
    console.log("Failed with error %s", err.message);
  }
}
