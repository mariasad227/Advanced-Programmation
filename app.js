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


    // --- Function to update report cards ---
    function updateReports() {
        const allRows = tableBody.getElementsByTagName('tr');
        const studentCount = allRows.length;
        
        // 1. Update Student Count
        if (studentCountEl) {
            studentCountEl.textContent = studentCount;
        }

        // 2. Calculate Attendance and Flags
        let presentCount = 0;
        let absentCount = 0;
        
        for (const row of allRows) {
            const presentCheckbox = row.querySelector('input[type="checkbox"]');
            
            if (presentCheckbox && presentCheckbox.checked) {
                presentCount++;
            } else if (presentCheckbox) {
                absentCount++;
            }
        }

        // 3. Update Overall Attendance
        if (attendanceStatEl) {
            if (studentCount > 0) {
                const attendancePercent = Math.round((presentCount / studentCount) * 100);
                attendanceStatEl.textContent = `${attendancePercent}%`;
            } else {
                attendanceStatEl.textContent = 'N/A';
            }
        }

        // 4. Update Flags
        if (flagsStatEl) {
            flagsStatEl.textContent = absentCount;
        }
    }

    
    // --- NEW: Function to download the report ---
    function downloadReport() {
        const table = document.querySelector('#attendance-list table');
        let csv = [];

        // 1. Get Headers
        const headers = [];
        table.querySelectorAll('thead th').forEach(th => {
            // Add quotes to handle any commas
            headers.push(`"${th.innerText.trim()}"`);
        });
        csv.push(headers.join(','));

        // 2. Get Body Rows
        table.querySelectorAll('tbody tr').forEach(row => {
            const rowData = [];
            
            // Get cells (td) in the current row
            row.querySelectorAll('td').forEach(cell => {
                let cellText = cell.innerText.trim();
                
                // Special handling for checkboxes
                const checkbox = cell.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    // Use "Yes" or "No" for clarity in the report
                    cellText = checkbox.checked ? "Yes" : "No";
                }
                
                // Add quotes to the data
                rowData.push(`"${cellText}"`);
            });
            csv.push(rowData.join(','));
        });

        // 3. Join all rows with a newline character
        const csvContent = csv.join('\n');

        // 4. Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.href = url;
        link.setAttribute('download', 'attendance_report.csv');
        
        // Append to DOM, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }


    /* * Interaction 1: Add New Student Form Submission
     */
    if (studentForm) {
        studentForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const studentId = document.getElementById('student-id').value;
            const lastName = document.getElementById('last-name').value;
            const firstName = document.getElementById('first-name').value;
            
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${studentId}</td>
                <td>${lastName.toUpperCase()}</td>
                <td>${firstName}</td>
                <td>Advanced Web Prog.</td>
                <td>${new Date().toISOString().split('T')[0]}</td>
                <td><input type="checkbox"></td>
                <td><input type="checkbox"></td>
            `;
            tableBody.appendChild(newRow);
            studentForm.reset();
            updateReports(); 
        });
    }


    /*
     * Interaction 2: Navbar Active Link Highlighting on Scroll
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
     * Interaction 3: Logout Button
     */
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            alert('You have been logged out. (Simulation)');
        });
    }
    
    /*
     * Interaction 4: Theme Toggler (Dark/Light Mode)
     */
    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode');
        });
    }
    
    /*
     * Interaction 5: Accent Color Switcher
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
     * Interaction 6: Fade-in Cards on Scroll
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
     * Interaction 7: Update Reports on Checkbox Click
     */
    if (tableBody) {
        tableBody.addEventListener('change', (event) => {
            if (event.target.type === 'checkbox') {
                updateReports();
            }
        });
    }
    
    
    /*
     * NEW: Interaction 8: Download Report Button
     */
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            downloadReport();
        });
    }
    

    // --- Initial Run ---
    updateReports();

});