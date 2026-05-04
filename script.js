document.addEventListener('DOMContentLoaded', () => {
    // Navbar & Sidebar Elements
    const navbar = document.querySelector('.navbar');
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebarLinks = document.querySelectorAll('.sidebar-links a');
    const desktopLinks = document.querySelectorAll('.nav-links a');

    // Theme Elements
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const themeIcon = themeToggle.querySelector('i');

    /*
        ========================
        STICKY NAVBAR
        ========================
    */
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Active link highlighting
        let current = '';
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        const allLinks = [...desktopLinks, ...sidebarLinks];
        allLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    /*
        ========================
        MOBILE SIDEBAR LOGIC
        ========================
    */
    const toggleSidebar = () => {
        hamburger.classList.toggle('active');
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
        body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : 'auto';
    };

    hamburger.addEventListener('click', toggleSidebar);
    closeSidebar.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', toggleSidebar);

    // Close sidebar when a link is clicked
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (sidebar.classList.contains('active')) {
                toggleSidebar();
            }
        });
    });

    /*
        ========================
        THEME TOGGLE
        ========================
    */
    // Check for saved theme in localStorage
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        body.classList.remove('dark-theme', 'light-theme');
        body.classList.add(currentTheme);
        if (currentTheme === 'light-theme') {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
        } else {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
        }
    }

    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('light-theme')) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'dark-theme');
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'light-theme');
        }

        // Update Charts for visibility in new theme
        updateChartColors();
    });

    /*
        ========================
        SCROLL ANIMATIONS (Intersection Observer)
        ========================
    */
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Trigger Language Progress Animation
                if (entry.target.classList.contains('languages-container')) {
                    animateProgressBars(entry.target);
                }

                // If the element has charts, initialize them
                if (entry.target.id === 'skills-dashboard') {
                    initCharts();
                }
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));
    
    // Also observe the dashboard specifically for charts if reveal isn't on the container
    const dashboard = document.getElementById('skills-dashboard');
    if (dashboard) revealObserver.observe(dashboard);

    function animateProgressBars(container) {
        const progressBars = container.querySelectorAll('.progress');
        progressBars.forEach(bar => {
            const width = bar.getAttribute('data-width');
            setTimeout(() => {
                bar.style.width = width;
            }, 200);
        });
    }

    /*
        ========================
        SKILLS DASHBOARD (Chart.js)
        ========================
    */
    let chartsInitialized = false;
    let myCharts = [];

    function updateChartColors() {
        if (!chartsInitialized) return;
        
        const textColor = getComputedStyle(document.body).getPropertyValue('--text-color').trim();
        
        myCharts.forEach(chart => {
            // Update scales
            if (chart.options.scales) {
                if (chart.options.scales.x && chart.options.scales.x.ticks) {
                    chart.options.scales.x.ticks.color = textColor;
                }
                if (chart.options.scales.y && chart.options.scales.y.ticks) {
                    chart.options.scales.y.ticks.color = textColor;
                }
            }
            // Update legend
            if (chart.options.plugins && chart.options.plugins.legend && chart.options.plugins.legend.labels) {
                chart.options.plugins.legend.labels.color = textColor;
            }
            chart.update();
        });
    }

    function initCharts() {
        if (chartsInitialized) return;
        chartsInitialized = true;

        const ctxSap = document.getElementById('sapChart').getContext('2d');
        const ctxDist = document.getElementById('distributionChart').getContext('2d');
        const ctxTools = document.getElementById('toolsChart').getContext('2d');
        const ctxTicket = document.getElementById('ticketChart').getContext('2d');
        const ctxExp = document.getElementById('experienceChart').getContext('2d');

        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
        const textColor = getComputedStyle(document.body).getPropertyValue('--text-color').trim();

        // SAP MM Skills Bar Chart
        myCharts.push(new Chart(ctxSap, {
            type: 'bar',
            data: {
                labels: ['MM Config', 'S/4HANA', 'Data Migration', 'Procurement', 'Integration'],
                datasets: [{
                    label: 'Proficiency %',
                    data: [95, 90, 85, 90, 80],
                    backgroundColor: primaryColor,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, max: 100, ticks: { color: textColor } },
                    x: { ticks: { color: textColor } }
                }
            }
        }));

        // Domain Distribution Doughnut
        myCharts.push(new Chart(ctxDist, {
            type: 'doughnut',
            data: {
                labels: ['SAP MM', 'Digital Marketing', 'Data Analysis', 'Support'],
                datasets: [{
                    data: [50, 20, 15, 15],
                    backgroundColor: [
                        primaryColor,
                        '#4ecdc4',
                        '#45b7d1',
                        '#ff9f43'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom', labels: { color: textColor } }
                }
            }
        }));

        // Tools & Marketing Horizontal Bar
        myCharts.push(new Chart(ctxTools, {
            type: 'bar',
            indexAxis: 'y',
            data: {
                labels: ['JIRA', 'LSMW/LTMC', 'SEO/SEM', 'Social Media', 'MS Office'],
                datasets: [{
                    label: 'Level',
                    data: [90, 85, 75, 80, 95],
                    backgroundColor: '#4ecdc4',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    x: { beginAtZero: true, max: 100, ticks: { color: textColor } },
                    y: { ticks: { color: textColor } }
                }
            }
        }));

        // Ticket Handling Chart (New)
        myCharts.push(new Chart(ctxTicket, {
            type: 'line',
            data: {
                labels: ['FY 2023-24', 'FY 2024-25', 'FY 2025-26'],
                datasets: [{
                    label: 'Tickets Handled',
                    data: [8500, 10200, 11922],
                    borderColor: primaryColor,
                    backgroundColor: 'rgba(255, 90, 95, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: primaryColor
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { color: textColor } },
                    x: { ticks: { color: textColor } }
                }
            }
        }));

        // Experience Distribution Chart (New)
        myCharts.push(new Chart(ctxExp, {
            type: 'pie',
            data: {
                labels: ['Customer/Vendor Related', 'Material (MDM)'],
                datasets: [{
                    data: [90, 10],
                    backgroundColor: [primaryColor, '#4ecdc4'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom', labels: { color: textColor } }
                }
            }
        }));
    }

    /*
        ========================
        SCROLL TO TOP BUTTON
    */
    const scrollTop = document.getElementById('scrollTop');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollTop.classList.add('show');
        } else {
            scrollTop.classList.remove('show');
        }
    });

    scrollTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    /*
        ========================
        CONTACT FORM HANDLING (Formspree)
        ========================
    */
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    // Formspree Endpoint - IMPORTANT: Replace 'YOUR_FORMSPREE_ID' with your actual Formspree ID
    const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORMSPREE_ID";

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            if (!name || !email || !message) {
                showToast('Warning', 'Please fill in all fields.', 'error');
                return;
            }

            // Button Loading State
            const submitBtn = contactForm.querySelector('button');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            
            showStatus('Sending message...', '');

            // Formspree sending logic using fetch
            fetch(FORMSPREE_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    message: message
                })
            })
            .then(response => {
                if (response.ok) {
                    showToast('Success', 'Thank you! Your message has been sent successfully.', 'success');
                    contactForm.reset();
                    showStatus('', ''); // Clear status text
                } else {
                    response.json().then(data => {
                        if (Object.hasOwn(data, 'errors')) {
                            showToast('Error', data["errors"].map(error => error["message"]).join(", "), 'error');
                        } else {
                            showToast('Error', 'Oops! There was a problem submitting your form', 'error');
                        }
                        showStatus('Failed to send message.', 'error');
                    });
                }
            })
            .catch(error => {
                console.error('Formspree Error:', error);
                showToast('Error', 'Failed to send message. Please try again later.', 'error');
                showStatus('Failed to send message.', 'error');
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            });
        });
    }

    function showStatus(message, type) {
        if (!formStatus) return;
        formStatus.textContent = message;
        formStatus.className = 'form-status ' + type;
    }

    /*
        ========================
        TOASTER SYSTEM
        ========================
    */
    function showToast(title, message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle');
        
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <div class="toast-content">
                <span class="toast-title">${title}</span>
                <span class="toast-message">${message}</span>
            </div>
            <div class="toast-progress"></div>
        `;

        container.appendChild(toast);

        // Animate In
        setTimeout(() => {
            toast.classList.add('active');
        }, 10);

        // Remove after 5 seconds
        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, 5000);
    }
});
