// Wait for the DOM to be fully loaded using jQuery
$(document).ready(function() {

    // --- Selectors for existing and new elements (Converted to jQuery variables) ---
    const $studentForm = $('#add-student-form');
    const $tableBody = $('#attendance-table-body');
    const $navLinks = $('.navbar a');
    const $logoutButton = $('#logout-confirm-btn');

    // Personalization selectors
    const $themeToggle = $('#theme-toggle');
    const $colorSwatches = $('.color-swatches .swatch');

    // All cards for fade-in animation
    const $allCards = $('.card');
    
    // Report card value selectors
    const $studentCountEl = $('#student-count');
    const $goodAttendanceEl = $('#good-attendance-count');
    const $highParticipationEl = $('#high-participation-count');

    // NEW: Download and Show Report button selectors
    const $downloadBtn = $('#download-report-btn');
    const $showReportBtn = $('#show-detailed-report-btn');
    const $reportsSection = $('#reports');


    // -------------------------------------------------------------------
    // --- EXERCISE 1: Attendance Processing, Highlighting, and Messages ---
    // -------------------------------------------------------------------

    function processAttendanceData() {
        if (!$tableBody.length) return;

        // Selects only student rows
        const $allRows = $tableBody.find('tr[data-student-id]');

        $allRows.each(function() {
            const $row = $(this);
            // Checkboxes are ordered: S1 to S6 (Attendance) then P1 to P6 (Participation)
            const $checkboxes = $row.find('input[type="checkbox"]');
            
            let absences = 0;
            let participations = 0;
            const totalSessions = 6;
            const totalParticipationChecks = 6;

            // 1. Calculate Absences (S1-S6: first 6 checkboxes)
            for (let i = 0; i < totalSessions; i++) {
                if ($checkboxes.eq(i).length && !$checkboxes.eq(i).prop('checked')) {
                    absences++; // Absent = checkbox unchecked
                }
            }

            // 2. Calculate Participations (P1-P6: next 6 checkboxes)
            for (let i = totalSessions; i < totalSessions + totalParticipationChecks; i++) {
                if ($checkboxes.eq(i).length && $checkboxes.eq(i).prop('checked')) {
                    participations++; // Participated = checkbox checked
                }
            }

            // 3. Update calculated cells
            $row.find('.abs-count').text(absences);
            $row.find('.par-count').text(participations);
            const $messageCell = $row.find('.message');
            
            // 4. Apply highlighting and generate message
            // Reset classes, including the new 'high-participation' class
            $row.removeClass('attendance-green attendance-yellow attendance-red high-participation');
            
            let message = '';
            let participationMessage = '';

            // Set Participation Message
            if (participations >= 4) {
                participationMessage = 'Excellent participation';
                $row.addClass('high-participation'); // Add class for high participation count
            } else if (participations >= 2) {
                 participationMessage = 'Moderate participation';
            } else {
                participationMessage = 'You need to participate more';
            }

            // Set Attendance Status and Color
            if (absences < 3) {
                // Green for fewer than 3 absences
                $row.addClass('attendance-green');
                message = `Good attendance – ${participationMessage}`;
            } else if (absences >= 3 && absences <= 4) {
                // Yellow for 3 to 4 absences
                $row.addClass('attendance-yellow');
                message = `Warning – attendance low – ${participationMessage}`;
            } else { // 5 or more absences
                // Red for 5 or more absences
                $row.addClass('attendance-red');
                message = `Excluded – too many absences – ${participationMessage}`;
            }

            $messageCell.text(message);
        });
        
        // Update the top report cards
        updateReports();
    }


    // --- Function to update report cards (Modified for new metrics and bar chart) ---
    function updateReports() {
        const $allRows = $tableBody.find('tr[data-student-id]');
        const studentCount = $allRows.length;
        
        // 1. Update Total Student Count (Stat Card)
        if ($studentCountEl.length) {
            $studentCountEl.text(studentCount);
        }

        // 2. Calculate New Metrics
        let goodAttendanceCount = 0; // Students with < 3 absences (green rows)
        let highParticipationCount = 0; // Students with >= 4 participations

        $allRows.each(function() {
            const $row = $(this);
            // Count students with Good Attendance (Green row)
            if ($row.hasClass('attendance-green')) {
                goodAttendanceCount++;
            }
            // Count students with High Participation (new class)
            if ($row.hasClass('high-participation')) {
                highParticipationCount++;
            }
        });
        
        // 3. Calculate Percentages
        const goodAttendancePercent = studentCount > 0 ? Math.round((goodAttendanceCount / studentCount) * 100) : 0;
        const highParticipationPercent = studentCount > 0 ? Math.round((highParticipationCount / studentCount) * 100) : 0;

        // 4. Update Report Stats (Stat Cards)
        if ($goodAttendanceEl.length) {
            $goodAttendanceEl.text(goodAttendanceCount);
        }
        
        if ($highParticipationEl.length) {
            $highParticipationEl.text(highParticipationCount);
        }
        
        // 5. Update Bar Chart Statistics (NEW)
        const $totalStudentsFinalEl = $('#total-students-final');
        const $goodAttendanceBarEl = $('#good-attendance-bar');
        const $goodAttendancePercentEl = $('#good-attendance-percent');
        const $goodAttendanceCountBarEl = $('#good-attendance-count-bar');
        const $highParticipationBarEl = $('#high-participation-bar');
        const $highParticipationPercentEl = $('#high-participation-percent');
        const $highParticipationCountBarEl = $('#high-participation-count-bar');

        if ($totalStudentsFinalEl.length) $totalStudentsFinalEl.text(`${studentCount} Students`);
        
        if ($goodAttendanceBarEl.length) $goodAttendanceBarEl.css('width', `${goodAttendancePercent}%`);
        if ($goodAttendancePercentEl.length) $goodAttendancePercentEl.text(`${goodAttendancePercent}%`);
        if ($goodAttendanceCountBarEl.length) $goodAttendanceCountBarEl.text(goodAttendanceCount);

        if ($highParticipationBarEl.length) $highParticipationBarEl.css('width', `${highParticipationPercent}%`);
        if ($highParticipationPercentEl.length) $highParticipationPercentEl.text(`${highParticipationPercent}%`);
        if ($highParticipationCountBarEl.length) $highParticipationCountBarEl.text(highParticipationCount);
    }

    
    // --- Function to download the report (Unchanged logic) ---
    function downloadReport() {
        // ... downloadReport implementation using pure JS (or converted to jQuery, but keeping original file logic where possible) ...
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

    // ... validateField and validateForm functions remain essentially the same, using pure JS DOM methods ...

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
    if ($studentForm.length) {
        $studentForm.on('submit', (event) => {
            event.preventDefault();
            
            const studentIdEl = document.getElementById('student-id');
            const lastNameEl = document.getElementById('last-name');
            const firstNameEl = document.getElementById('first-name');
            const emailEl = document.getElementById('email');

            // --- RUN VALIDATION ---
            if (!validateForm(studentIdEl, lastNameEl, firstNameEl, emailEl)) {
                return;
            }
            
            // Validation passed: Process data and update table
            const studentId = studentIdEl.value;
            const lastName = lastNameEl.value;
            const firstName = firstNameEl.value;
            
            // Create a new table row using jQuery append
            const newRowHtml = `
                <tr data-student-id="${studentId}">
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
                </tr>
            `;
            $tableBody.append(newRowHtml);
            $studentForm[0].reset();
            
            processAttendanceData(); 
        });
        
        // Add live validation feedback on input change/blur for better UX (Pure JS event listeners)
        const inputs = [
            document.getElementById('student-id'),
            document.getElementById('last-name'),
            document.getElementById('first-name'),
            document.getElementById('email')
        ];
        
        inputs.forEach(input => {
            $(input).on('input', () => {
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
     * Interaction 2: Navbar Active Link Highlighting on Scroll (Unchanged, uses pure JS IntersectionObserver)
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
                $navLinks.removeClass('active');
                $(`.navbar a[href="#${id}"]`).addClass('active');
            }
        });
    }, navObserverOptions);
    $('main section[id]').each(function() {
        navObserver.observe(this);
    });

    
    /*
     * Interaction 3: Logout Button (Converted to jQuery)
     */
    if ($logoutButton.length) {
        $logoutButton.on('click', () => {
            console.log('User logged out. (Simulation)');
        });
    }
    
    /*
     * Interaction 4: Theme Toggler (Dark/Light Mode) (Converted to jQuery)
     */
    if ($themeToggle.length) {
        $themeToggle.on('change', () => {
            $('body').toggleClass('dark-mode');
        });
    }
    
    /*
     * Interaction 5: Accent Color Switcher (Converted to jQuery)
     */
    if ($colorSwatches.length) {
        $colorSwatches.on('click', function() {
            $colorSwatches.removeClass('active');
            $(this).addClass('active');
            const color = $(this).data('color');
            $('body').attr('data-theme', color);
        });
    }
    
    /*
     * Interaction 6: Fade-in Cards on Scroll (Unchanged, uses pure JS IntersectionObserver)
     */
    const cardObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 
    };
    const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                $(entry.target).addClass('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, cardObserverOptions);
    $allCards.each(function() {
        cardObserver.observe(this);
    });
    
    
    /*
     * Interaction 7: Update Reports on Checkbox Click (Converted to jQuery delegation)
     */
    if ($tableBody.length) {
        $tableBody.on('change', 'input[type="checkbox"]', () => {
            processAttendanceData(); // Recalculate and recolor the rows
        });
    }
    
    
    /*
     * Interaction 8: Download Report Button (Converted to jQuery)
     */
    if ($downloadBtn.length) {
        $downloadBtn.on('click', () => {
            downloadReport();
        });
    }
    
    /*
     * Interaction 9: Show Detailed Report Button (Converted to jQuery)
     */
    if ($showReportBtn.length) {
        $showReportBtn.on('click', () => {
            if ($reportsSection.length) {
                // Show the reports section
                $reportsSection.show();
                // Scroll to the reports section
                $('html, body').animate({
                    scrollTop: $reportsSection.offset().top
                }, 500);
            }
            updateReports(); 
        });
    }

    // -------------------------------------------------------------------
    // --- NEW JQUERY INTERACTIVITY FOR ATTENDANCE TABLE ---
    // -------------------------------------------------------------------
    
    // 2. Highlight a row when the mouse hovers over it.
    // 3. Remove the highlight when the mouse leaves.
    $tableBody.on('mouseenter', 'tr[data-student-id]', function() {
        $(this).addClass('row-highlight');
    }).on('mouseleave', 'tr[data-student-id]', function() {
        $(this).removeClass('row-highlight');
    });

    // 4. When a row is clicked, display a message box.
    $tableBody.on('click', 'tr[data-student-id]', function() {
        const $row = $(this);
        // Get student details
        const lastName = $row.find('td:nth-child(1)').text();
        const firstName = $row.find('td:nth-child(2)').text();
        // Get the absence count from the cell with class .abs-count
        const absences = $row.find('.abs-count').text();
        
        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        const message = `${fullName} has recorded ${absences} absences.`;
        
        alert(message);
    });


    // --- Initial Run: Calculate and display attendance status on load ---
    processAttendanceData();

});
