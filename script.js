document.addEventListener('DOMContentLoaded', () => {
    const checklistForm = document.getElementById('checklistForm');
    const checkboxes = checklistForm.querySelectorAll('input[type="checkbox"]:not([disabled])'); // Only count actionable checkboxes
    const completionMessage = document.getElementById('completionMessage');
    const certificateSection = document.getElementById('certificateSection');
    const completionDateEl = document.getElementById('completionDate');
    const savePdfButton = document.getElementById('savePdfButton');
    const submitToSheetButton = document.getElementById('submitToSheetButton');
    const teacherNameInput = document.getElementById('teacherName');
    const campusNameInput = document.getElementById('campusName');
    const googleSheetStatus = document.getElementById('googleSheetStatus');

    // Function to check if all actionable checkboxes are checked
    function checkAllTasksCompleted() {
        for (let i = 0; i < checkboxes.length; i++) {
            if (!checkboxes[i].checked) {
                return false;
            }
        }
        return true;
    }

    // Event listener for checkbox changes
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (checkAllTasksCompleted()) {
                // Trigger confetti
                if (typeof confetti === 'function') {
                    confetti({
                        particleCount: 200,
                        spread: 90,
                        origin: { y: 0.6 }
                    });
                }
                completionMessage.classList.remove('hidden');
                certificateSection.classList.remove('hidden');
                completionDateEl.textContent = new Date().toLocaleDateString();
            } else {
                completionMessage.classList.add('hidden');
                certificateSection.classList.add('hidden');
            }
        });
    });

    // Save as PDF button
    savePdfButton.addEventListener('click', () => {
        // Temporarily set input values for printing if they are empty
        // (browsers might not print placeholder text)
        const teacherNameVal = teacherNameInput.value || teacherNameInput.placeholder;
        const campusNameVal = campusNameInput.value || campusNameInput.placeholder;

        // Create temporary elements to hold the values for printing
        const tempTeacherName = document.createElement('p');
        tempTeacherName.textContent = `Teacher's Name: ${teacherNameVal}`;
        tempTeacherName.style.textAlign = 'center';

        const tempCampusName = document.createElement('p');
        tempCampusName.textContent = `Campus Name: ${campusNameVal}`;
        tempCampusName.style.textAlign = 'center';

        // Hide inputs and show temp elements for printing
        teacherNameInput.style.display = 'none';
        campusNameInput.style.display = 'none';
        
        // Find a good place to insert them - e.g., before the date
        const dateElement = document.getElementById('completionDate').parentElement;
        dateElement.before(tempCampusName); // campus first, then teacher
        dateElement.before(tempTeacherName);

        window.print();

        // Restore inputs after printing
        teacherNameInput.style.display = 'block';
        campusNameInput.style.display = 'block';
        tempTeacherName.remove();
        tempCampusName.remove();
    });

    // Submit to Google Sheet button
    submitToSheetButton.addEventListener('click', () => {
        const teacherName = teacherNameInput.value.trim();
        const campusName = campusNameInput.value.trim();

        if (!teacherName || !campusName) {
            googleSheetStatus.textContent = 'Please enter your name and campus name.';
            googleSheetStatus.style.color = 'red';
            return;
        }

        googleSheetStatus.textContent = 'Submitting...';
        googleSheetStatus.style.color = 'orange';

        const data = {
            teacherName: teacherName,
            campusName: campusName,
            completionDate: new Date().toLocaleDateString()
        };

        // IMPORTANT: Replace with your actual Google Apps Script Web App URL
        const googleAppsScriptUrl = 'https://script.google.com/macros/s/AKfycbzx3iSspMl-Bc0_5GiKd2G4GdxowLUMqnpiZtGJSfThXhV5v_oBlyH7ovwbC2gaUTRm/exec';

        if (googleAppsScriptUrl === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
            googleSheetStatus.textContent = 'Google Apps Script URL not configured.';
            googleSheetStatus.style.color = 'red';
            console.error("Google Apps Script URL is not configured in script.js");
            alert("Developer Note: Google Apps Script URL needs to be set up in script.js.");
            return;
        }

        fetch(googleAppsScriptUrl, {
            method: 'POST',
            mode: 'no-cors', // Important for simple POST requests to Apps Script from client-side if not handling preflight
            // For 'cors' mode, your Apps Script needs to handle OPTIONS requests and set CORS headers.
            // Or, you can use 'application/json' and parse it in Apps Script with e.postData.contents
            body: JSON.stringify(data), // Send as JSON
            headers: {
                'Content-Type': 'application/json' // Set content type for Apps Script to parse easily
            }
        })
        .then(response => {
            // Note: 'no-cors' mode means you won't be able to read the response directly here.
            // You'll need to trust that the data was sent or check your Google Sheet.
            // If you need a proper response, you must implement CORS correctly on your Apps Script.
            googleSheetStatus.textContent = 'Data submitted successfully to Google Sheet! (Check the sheet to confirm)';
            googleSheetStatus.style.color = 'green';
            console.log('Submission attempt finished. Due to no-cors, response details are not available here. Check your Google Sheet.');
        })
        .catch(error => {
            googleSheetStatus.textContent = 'Error submitting data. See console for details.';
            googleSheetStatus.style.color = 'red';
            console.error('Error submitting to Google Sheet:', error);
        });
    });
});