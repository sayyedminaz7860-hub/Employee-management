/**
 * EmpManager Professional Logic v2.0
 * Features: Search, Sort, Pagination, Export, Dark Mode, Advanced Validation
 */

// Initial Default Records with enhanced fields
const defaultEmployees = [
    { id: "EMP-101", name: "Alice Johnson", role: "UI Designer", email: "alice@company.com", salary: 75000, gender: "Female" },
    { id: "EMP-102", name: "Bob Smith", role: "Backend Developer", email: "bob@company.com", salary: 62000, gender: "Male" },
    { id: "EMP-103", name: "Charlie Brown", role: "DevOps Engineer", email: "charlie@company.com", salary: 58000, gender: "Male" },
    { id: "EMP-104", name: "Diana Prince", role: "Product Manager", email: "diana@company.com", salary: 92000, gender: "Female" },
    { id: "EMP-105", name: "Evan Wright", role: "Security Analyst", email: "evan@company.com", salary: 65000, gender: "Other" },
    { id: "EMP-106", name: "Frank Miller", role: "Frontend Lead", email: "frank@company.com", salary: 88000, gender: "Male" },
    { id: "EMP-107", name: "Grace Hopper", role: "Data Scientist", email: "grace@company.com", salary: 95000, gender: "Female" },
];

// App State
let employees = JSON.parse(localStorage.getItem('employees')) || defaultEmployees;
let filteredData = [...employees];
let currentPage = 1;
const itemsPerPage = 5;
let sortKey = 'id';
let sortOrder = 'asc'; // 'asc' or 'desc'
let deleteIndex = -1;

// DOM Elements
const employeeModal = new bootstrap.Modal(document.getElementById('employeeModal'));
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
const employeeForm = document.getElementById('employeeForm');
const employeeList = document.getElementById('employeeList');
const searchInput = document.getElementById('searchInput');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const toastBootstrap = bootstrap.Toast.getOrCreateInstance(document.getElementById('liveToast'));

/**
 * Initialization
 */
function init() {
    // Set Theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Event Listeners
    searchInput.addEventListener('input', handleSearch);
    themeToggle.addEventListener('click', toggleTheme);
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);
    document.getElementById('confirmDeleteBtn').addEventListener('click', executeDelete);
    
    document.getElementById('addBtn').addEventListener('click', () => {
        employeeForm.reset();
        document.getElementById('editIndex').value = "-1";
        document.getElementById('employeeModalLabel').textContent = "Add New Employee";
        document.getElementById('empId').readOnly = false;
    });

    renderUI();
}

/**
 * Main Render Function
 */
function renderUI() {
    applyFiltersAndSort();
    renderTable();
    renderPagination();
    updateSummary();
}

/**
 * Filter and Sort logic
 */
function applyFiltersAndSort() {
    const term = searchInput.value.toLowerCase();
    
    // Search filter
    filteredData = employees.filter(emp => 
        emp.name.toLowerCase().includes(term) || 
        emp.id.toLowerCase().includes(term) || 
        emp.role.toLowerCase().includes(term) ||
        emp.email.toLowerCase().includes(term)
    );

    // Sorting
    filteredData.sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Render Employee Table
 */
function renderTable() {
    employeeList.innerHTML = '';
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filteredData.slice(start, end);

    if (pageData.length === 0) {
        employeeList.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-muted">No employees found matching your criteria.</td></tr>`;
        return;
    }

    pageData.forEach((emp) => {
        const globalIndex = employees.findIndex(e => e.id === emp.id);
        const badgeClass = `badge-gender badge-${emp.gender.toLowerCase()}`;
        
        const row = document.createElement('tr');
        row.className = 'animate-fade-in';
        row.innerHTML = `
            <td class="ps-4 fw-medium text-muted small">${emp.id}</td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="avatar-initial me-3">${emp.name.charAt(0)}</div>
                    <div>
                        <div class="fw-bold">${emp.name}</div>
                        <div class="text-muted small">${emp.email}</div>
                    </div>
                </div>
            </td>
            <td><span class="text-muted small fw-medium">${emp.role}</span></td>
            <td class="fw-bold text-primary">$${parseInt(emp.salary).toLocaleString()}</td>
            <td><span class="${badgeClass}">${emp.gender}</span></td>
            <td class="text-end pe-4">
                <button class="btn btn-sm btn-light text-primary me-1" onclick="editEmployee('${emp.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-light text-danger" onclick="confirmDelete('${emp.id}')" title="Delete">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        employeeList.appendChild(row);
    });

    // Update "Showing entries..."
    document.getElementById('showingEntries').textContent = 
        `Showing ${filteredData.length > 0 ? start + 1 : 0} to ${Math.min(end, filteredData.length)} of ${filteredData.length} entries`;
}

/**
 * Render Pagination Controls
 */
function renderPagination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    if (totalPages <= 1) return;

    // Previous
    pagination.innerHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})"><i class="fas fa-chevron-left"></i></a>
        </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += `
            <li class="page-item ${currentPage === i ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>
        `;
    }

    // Next
    pagination.innerHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})"><i class="fas fa-chevron-right"></i></a>
        </li>
    `;
}

/**
 * Update Summary Statistics
 */
function updateSummary() {
    const totalCount = employees.length;
    const totalSalary = employees.reduce((sum, emp) => sum + parseInt(emp.salary), 0);
    const avgSalary = totalCount > 0 ? Math.round(totalSalary / totalCount) : 0;
    
    document.getElementById('totalCount').textContent = totalCount;
    document.getElementById('totalSalary').textContent = `$${totalSalary.toLocaleString()}`;
    document.getElementById('avgSalary').textContent = `$${avgSalary.toLocaleString()}`;
    
    localStorage.setItem('employees', JSON.stringify(employees));
}

/**
 * User Actions
 */
window.changePage = (page) => {
    currentPage = page;
    renderUI();
};

window.sortData = (key) => {
    if (sortKey === key) {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        sortKey = key;
        sortOrder = 'asc';
    }
    renderUI();
};

function handleSearch() {
    currentPage = 1;
    renderUI();
}

employeeForm.onsubmit = (e) => {
    e.preventDefault();
    
    const id = document.getElementById('empId').value.trim();
    const name = document.getElementById('empName').value.trim();
    const salary = document.getElementById('empSalary').value;
    const email = document.getElementById('empEmail').value.trim();
    const role = document.getElementById('empRole').value.trim();
    const gender = document.querySelector('input[name="empGender"]:checked').value;
    const editIndex = parseInt(document.getElementById('editIndex').value);

    // Validation
    if (editIndex === -1 && employees.some(e => e.id === id)) {
        showToast("Employee ID already exists", "error");
        return;
    }

    const employeeData = { id, name, salary, email, role, gender };
    
    if (editIndex === -1) {
        employees.push(employeeData);
        showToast("Employee added successfully!");
    } else {
        employees[editIndex] = employeeData;
        showToast("Employee details updated!");
    }
    
    employeeModal.hide();
    renderUI();
};

window.editEmployee = (id) => {
    const index = employees.findIndex(e => e.id === id);
    const emp = employees[index];
    
    document.getElementById('empId').value = emp.id;
    document.getElementById('empId').readOnly = true;
    document.getElementById('empName').value = emp.name;
    document.getElementById('empSalary').value = emp.salary;
    document.getElementById('empEmail').value = emp.email;
    document.getElementById('empRole').value = emp.role;
    document.getElementById('editIndex').value = index;
    
    const genders = document.getElementsByName('empGender');
    for(let g of genders) {
        if(g.value === emp.gender) g.checked = true;
    }
    
    document.getElementById('employeeModalLabel').textContent = "Update Profile";
    employeeModal.show();
};

window.confirmDelete = (id) => {
    deleteIndex = employees.findIndex(e => e.id === id);
    deleteModal.show();
};

function executeDelete() {
    if (deleteIndex > -1) {
        employees.splice(deleteIndex, 1);
        deleteModal.hide();
        renderUI();
        showToast("Employee record deleted", "info");
        deleteIndex = -1;
    }
}

/**
 * Utility: CSV Export
 */
function exportToCSV() {
    if (employees.length === 0) return;
    
    const headers = ["ID", "Name", "Role", "Email", "Salary", "Gender"];
    const rows = employees.map(e => [e.id, e.name, e.role, e.email, e.salary, e.gender]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n"
        + rows.map(r => r.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Employee_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Report downloaded", "success");
}

/**
 * Utility: Theme Toggle
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

/**
 * Utility: Toasts
 */
function showToast(message, type = 'success') {
    const toastMessage = document.getElementById('toastMessage');
    const toastEl = document.getElementById('liveToast');
    
    toastEl.className = `toast align-items-center border-0 toast-${type}`;
    
    let icon = '<i class="fas fa-check-circle me-3"></i>';
    if (type === 'error') icon = '<i class="fas fa-times-circle me-3"></i>';
    if (type === 'info') icon = '<i class="fas fa-info-circle me-3"></i>';
    
    toastMessage.innerHTML = `${icon} <div>${message}</div>`;
    toastBootstrap.show();
}

// Start the App
init();
