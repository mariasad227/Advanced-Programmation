// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // --- Selectors for existing and new elements ---
    const studentForm = document.getElementById('add-student-form');
    const tableBody = document.getElementById('attendance-table-body');
    const navLinks = document.querySelectorAll('.navbar a');
    const logoutButton = document.getElementById('logout-confirm-btn');

    // Personalization selectors
    const themeToggle = document.getElementById('theme-toggle');
    const colorSwatches = document.querySelectorAll('.color-swatches .swatch');

    // All cards for fade-in animation
    const allCards = document.querySelectorAll('.card');
    
    // Report card value selectors
    const studentCountEl = document.getElementById('student-count');
    const attendanceStatEl = document.getElementById('attendance-stat');
    const flagsStatEl = document.getElementById('flags-stat');
    
    // NEW: Download button selector
    const downloadBtn = document.getElementById('download-report-btn');


    // -------------------------------------------------------------------
    // --- EXERCISE 1: Attendance Processing, Highlighting, and Messages ---
    // -------------------------------------------------------------------

    function processAttendanceData() {
        if (!tableBody) return;

        // Selects only student rows
        const allRows = tableBody.querySelectorAll('tr[data-student-id]');

        allRows.forEach(row => {
            // Checkboxes are ordered: S1 to S6 (Attendance) then P1 to P6 (Participation)
            const checkboxes = row.querySelectorAll('input[type="checkbox"]');
            
            let absences = 0;
            let participations = 0;
            const totalSessions = 6;
            const totalParticipationChecks = 6;

            // 1. Calculate Absences (S1-S6: first 6 checkboxes)
            for (let i = 0; i < totalSessions; i++) {
                if (checkboxes[i] && !checkboxes[i].checked) {
                    absences++; // Absent = checkbox unchecked
                }
            }

            // 2. Calculate Participations (P1-P6: next 6 checkboxes)
            for (let i = totalSessions; i < totalSessions + totalParticipationChecks; i++) {
                if (checkboxes[i] && checkboxes[i].checked) {
                    participations++; // Participated = checkbox checked
                }
            }

            // 3. Update calculated cells
            row.querySelector('.abs-count').textContent = absences;
            row.querySelector('.par-count').textContent = participations;
            const messageCell = row.querySelector('.message');
            
            // 4. Apply highlighting and generate message
            row.classList.remove('attendance-green', 'attendance-yellow', 'attendance-red');
            
            let message = '';
            let participationMessage = '';

            // Set Participation Message
            if (participations >= 4) {
                participationMessage = 'Excellent participation';
            } else if (participations >= 2) {
                 participationMessage = 'Moderate participation';
            } else {
                participationMessage = 'You need to participate more';
            }

            // Set Attendance Status and Color
            if (absences < 3) {
                // Green for fewer than 3 absences
                row.classList.add('attendance-green');
                message = `Good attendance – ${participationMessage}`;
            } else if (absences >= 3 && absences <= 4) {
                // Yellow for 3 to 4 absences
                row.classList.add('attendance-yellow');
                message = `Warning – attendance low – ${participationMessage}`;
            } else { // 5 or more absences
                // Red for 5 or more absences
                row.classList.add('attendance-red');
                message = `Excluded – too many absences – ${participationMessage}`;
            }

            messageCell.textContent = message;
        });
        
        // Update the top report cards
        updateReports();
    }


    // --- Function to update report cards (Adapted for new table structure) ---
    function updateReports() {
        const allRows = tableBody.querySelectorAll('tr[data-student-id]');
        const studentCount = allRows.length;
        
        // 1. Update Student Count
        if (studentCountEl) {
            studentCountEl.textContent = studentCount;
        }

        // 2. Calculate Flags (Excluded status) and Overall Attendance
        let flagsCount = 0;
        let totalAbsences = 0;
        const totalPossibleSessions = 6;
        
        for (const row of allRows) {
            // Check for the 'Excluded' status (red row)
            if (row.classList.contains('attendance-red')) {
                flagsCount++;
            }
            // Sum up total absences from the calculated cell
            const absCountEl = row.querySelector('.abs-count');
            if (absCountEl) {
                totalAbsences += parseInt(absCountEl.textContent) || 0;
            }
        }

        // 3. Update Overall Attendance
        const totalPossibleAttendance = studentCount * totalPossibleSessions;
        const totalPresent = totalPossibleAttendance - totalAbsences;
        
        if (attendanceStatEl) {
            if (totalPossibleAttendance > 0) {
                const attendancePercent = Math.round((totalPresent / totalPossibleAttendance) * 100);
                attendanceStatEl.textContent = `${attendancePercent}%`;
            } else {
                attendanceStatEl.textContent = 'N/A';
            }
        }

        // 4. Update Flags
        if (flagsStatEl) {
            flagsStatEl.textContent = flagsCount;
        }
    }

    
    // --- NEW: Function to download the report (Adapted for new table structure) ---
    function downloadReport() {
        const table = document.querySelector('#attendance-list table');
        let csv = [];

        // Manually define Headers to match the summary table structure
        const headers = [
            "Last Name", "First Name",
            "S1", "S2", "S3", "S4", "S5", "S6",
            "P1", "P2", "P3", "P4", "P5", "P6",
            "Absences Count", "Participation Count", "Status Message"
        ];
        csv.push(headers.map(h => `"${h}"`).join(','));

        // Get Body Rows (17 columns expected)
        table.querySelectorAll('tbody tr').forEach(row => {
            const rowData = [];
            
            row.querySelectorAll('td').forEach(cell => {
                let cellText = cell.innerText.trim();
                
                // Special handling for checkboxes
                const checkbox = cell.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    // Use "Checked" or "Unchecked" for clarity in the report
                    cellText = checkbox.checked ? "Checked" : "Unchecked";
                }
                
                rowData.push(`"${cellText}"`);
            });
            csv.push(rowData.join(','));
        });

        const csvContent = csv.join('\n');

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.href = url;
        link.setAttribute('download', 'attendance_summary_report.csv');
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // ----------------------------------------------------
    // --- EXERCISE 2: Form Validation Helper Functions ---
    // ----------------------------------------------------

    /**
     * Validates a single input field against a regex and displays an error message.
     * @returns {boolean} True if valid, false otherwise.
     */
    function validateField(inputElement, regex, errorMessage) {
        const value = inputElement.value.trim();
        const errorElementId = inputElement.id + '-error';
        let errorElement = document.getElementById(errorElementId);
        
        // Find or create the error element (should be directly after the input in the DOM)
        if (!errorElement) {
            errorElement = document.createElement('p');
            errorElement.id = errorElementId;
            errorElement.className = 'error-message';
            inputElement.parentNode.appendChild(errorElement);
        }
        
        // Remove previous status
        errorElement.classList.remove('visible');
        inputElement.classList.remove('error');

        // Check 1: Empty check
        if (value === '') {
            errorElement.textContent = 'This field is required.';
            errorElement.classList.add('visible');
            inputElement.classList.add('error');
            return false;
        }

        // Check 2: Regex check
        if (!regex.test(value)) {
            errorElement.textContent = errorMessage;
            errorElement.classList.add('visible');
            inputElement.classList.add('error');
            return false;
        }
        
        // Validation successful
        return true;
    }

    /**
     * Runs all validation checks for the Add Student form.
     * @returns {boolean} True if the entire form is valid.
     */
    function validateForm(studentIdEl, lastNameEl, firstNameEl, emailEl) {
        // Validation rules:
        // ID: Numbers only (and not empty)
        const isIdValid = validateField(studentIdEl, /^\d+$/, 'Student ID must contain only numbers.');
        // Names: Letters and spaces only (and not empty)
        const isLastNameValid = validateField(lastNameEl, /^[a-zA-Z\s]+$/, 'Last Name must contain only letters.');
        const isFirstNameValid = validateField(firstNameEl, /^[a-zA-Z\s]+$/, 'First Name must contain only letters.');
        // Email: Basic valid format (name@example.com) (and not empty)
        const isEmailValid = validateField(emailEl, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email format (e.g., name@example.com).');
        
        // Ensure all checks run even if the first one fails, so all error messages appear.
        return isIdValid && isLastNameValid && isFirstNameValid && isEmailValid;
    }

    
    /* * Interaction 1: Add New Student Form Submission (Updated with Validation)
     */
    if (studentForm) {
        studentForm.addEventListener('submit', (event) => {
            event.preventDefault();
            
            const studentIdEl = document.getElementById('student-id');
            const lastNameEl = document.getElementById('last-name');
            const firstNameEl = document.getElementById('first-name');
            const emailEl = document.getElementById('email');

            // --- RUN VALIDATION ---
            if (!validateForm(studentIdEl, lastNameEl, firstNameEl, emailEl)) {
                // Validation failed. The error messages are already displayed.
                return;
            }
            
            // Validation passed: Process data and update table
            const studentId = studentIdEl.value;
            const lastName = lastNameEl.value;
            const firstName = firstNameEl.value;
            
            // Create a new table row with 12 unchecked boxes and the calculated columns
            const newRow = document.createElement('tr');
            newRow.setAttribute('data-student-id', studentId);
            newRow.innerHTML = `
                <td>${lastName.toUpperCase()}</td>
                <td>${firstName}</td>
                <td><input type="checkbox"></td>
                <td><input type="checkbox"></td>
                <td><input type="checkbox"></td>
                <td><input type="checkbox"></td>
                <td><input type="checkbox"></td>
                <td><input type="checkbox"></td>
                <td><input type="checkbox"></td>
                <td><input type="checkbox"></td>
                <td><input type="checkbox"></td>
                <td><input type="checkbox"></td>
                <td><input type="checkbox"></td>
                <td><input type="checkbox"></td>
                <td class="abs-count"></td>
                <td class="par-count"></td>
                <td class="message"></td>
            `;
            tableBody.appendChild(newRow);
            studentForm.reset();
            
            // Run processing for the new row and update reports
            processAttendanceData(); 
        });
        
        // Add live validation feedback on input change/blur for better UX
        const inputs = [
            document.getElementById('student-id'),
            document.getElementById('last-name'),
            document.getElementById('first-name'),
            document.getElementById('email')
        ];
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                if (input.id === 'student-id') {
                    validateField(input, /^\d+$/, 'Student ID must contain only numbers.');
                } else if (input.id === 'last-name' || input.id === 'first-name') {
                    validateField(input, /^[a-zA-Z\s]+$/, 'Name must contain only letters.');
                } else if (input.id === 'email') {
                    validateField(input, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email format.');
                }
            });
        });
    }


    /*
     * Interaction 2: Navbar Active Link Highlighting on Scroll (Unchanged)
     */
    const navObserverOptions = {
        root: null, 
        rootMargin: '0px',
        threshold: 0.6 
    };
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                });
                const activeLink = document.querySelector(`.navbar a[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, navObserverOptions);
    document.querySelectorAll('main section[id]').forEach(section => {
        navObserver.observe(section);
    });

    
    /*
     * Interaction 3: Logout Button (Unchanged)
     */
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            console.log('User logged out. (Simulation)');
        });
    }
    
    /*
     * Interaction 4: Theme Toggler (Dark/Light Mode) (Unchanged)
     */
    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode');
        });
    }
    
    /*
     * Interaction 5: Accent Color Switcher (Unchanged)
     */
    if (colorSwatches) {
        colorSwatches.forEach(swatch => {
            swatch.addEventListener('click', () => {
                colorSwatches.forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                const color = swatch.dataset.color;
                document.body.setAttribute('data-theme', color);
            });
        });
    }
    
    /*
     * Interaction 6: Fade-in Cards on Scroll (Unchanged)
     */
    const cardObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 
    };
    const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, cardObserverOptions);
    allCards.forEach(card => {
        cardObserver.observe(card);
    });
    
    
    /*
     * Interaction 7: Update Reports on Checkbox Click (Updated to call processAttendanceData)
     */
    if (tableBody) {
        tableBody.addEventListener('change', (event) => {
            if (event.target.type === 'checkbox') {
                processAttendanceData(); // Recalculate and recolor the rows
            }
        });
    }
    
    
    /*
     * NEW: Interaction 8: Download Report Button (Logic adapted for new table)
     */
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            downloadReport();
        });
    }
    

    // --- Initial Run: Calculate and display attendance status on load ---
    processAttendanceData();

});
