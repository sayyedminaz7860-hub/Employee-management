// Employee Management System Logic

// Initial 5 Default Records
const defaultEmployees = [
    { id: "101", name: "Alice Johnson", salary: 75000, gender: "Female" },
    { id: "102", name: "Bob Smith", salary: 62000, gender: "Male" },
    { id: "103", name: "Charlie Brown", salary: 58000, gender: "Male" },
    { id: "104", name: "Diana Prince", salary: 92000, gender: "Female" },
    { id: "105", name: "Evan Wright", salary: 65000, gender: "Other" }
];

// State Management
let employees = JSON.parse(localStorage.getItem('employees')) || defaultEmployees;

// Modal & Form Elements
const employeeModal = new bootstrap.Modal(document.getElementById('employeeModal'));
const employeeForm = document.getElementById('employeeForm');
const employeeList = document.getElementById('employeeList');
const totalCountEl = document.getElementById('totalCount');
const totalSalaryEl = document.getElementById('totalSalary');
const toastEl = document.getElementById('liveToast');
const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastEl);
const toastMessageEl = document.getElementById('toastMessage');

/**
 * Initialize application
 */
function init() {
    renderTable();
    updateSummary();
}

/**
 * Render Employee Table
 */
function renderTable() {
    employeeList.innerHTML = '';
    
    employees.forEach((emp, index) => {
        const row = document.createElement('tr');
        const badgeClass = `badge-gender badge-${emp.gender.toLowerCase()}`;
        
        row.innerHTML = `
            <td class="ps-4 fw-medium text-muted">#${emp.id}</td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="avatar-initial">${emp.name.charAt(0)}</div>
                    <div>
                        <div class="fw-bold">${emp.name}</div>
                    </div>
                </div>
            </td>
            <td class="fw-medium text-primary">$${parseInt(emp.salary).toLocaleString()}</td>
            <td><span class="${badgeClass}">${emp.gender}</span></td>
            <td class="text-end pe-4">
                <button class="btn btn-sm btn-light text-primary me-2" onclick="editEmployee(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-light text-danger" onclick="deleteEmployee(${index})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        employeeList.appendChild(row);
    });
}

/**
 * Update Summary Statistics
 */
function updateSummary() {
    const totalCount = employees.length;
    const totalSalary = employees.reduce((sum, emp) => sum + parseInt(emp.salary), 0);
    
    totalCountEl.textContent = totalCount;
    totalSalaryEl.textContent = `$${totalSalary.toLocaleString()}`;
    
    // Save to LocalStorage
    localStorage.setItem('employees', JSON.stringify(employees));
}

/**
 * Show Toast Notification
 */
function showToast(message, type = 'success') {
    toastEl.classList.remove('toast-success', 'toast-error', 'toast-info');
    toastEl.classList.add(`toast-${type}`);
    toastMessageEl.textContent = message;
    toastBootstrap.show();
}

/**
 * Add / Update Employee
 */
employeeForm.onsubmit = (e) => {
    e.preventDefault();
    
    const id = document.getElementById('empId').value;
    const name = document.getElementById('empName').value;
    const salary = document.getElementById('empSalary').value;
    const gender = document.querySelector('input[name="empGender"]:checked').value;
    const editIndex = parseInt(document.getElementById('editIndex').value);
    
    // Basic Validation
    if (!id || !name || !salary || !gender) {
        showToast("Please fill in all fields", "error");
        return;
    }
    
    const employeeData = { id, name, salary, gender };
    
    if (editIndex === -1) {
        // Add new
        employees.push(employeeData);
        showToast("Employee added successfully!");
    } else {
        // Update existing
        employees[editIndex] = employeeData;
        showToast("Employee updated successfully!");
    }
    
    // Reset Form & Close Modal
    employeeForm.reset();
    document.getElementById('editIndex').value = "-1";
    employeeModal.hide();
    
    // Refresh UI
    renderTable();
    updateSummary();
};

/**
 * Delete Employee
 */
function deleteEmployee(index) {
    if (confirm("Are you sure you want to delete this employee?")) {
        employees.splice(index, 1);
        renderTable();
        updateSummary();
        showToast("Employee removed", "info");
    }
}

/**
 * Edit Employee (Populate Form)
 */
function editEmployee(index) {
    const emp = employees[index];
    
    document.getElementById('empId').value = emp.id;
    document.getElementById('empName').value = emp.name;
    document.getElementById('empSalary').value = emp.salary;
    document.getElementById('editIndex').value = index;
    
    // Set gender radio button
    const genders = document.getElementsByName('empGender');
    for(let g of genders) {
        if(g.value === emp.gender) g.checked = true;
    }
    
    // Change modal title for editing context
    document.getElementById('employeeModalLabel').textContent = "Edit Employee Details";
    employeeModal.show();
}

// Ensure "Add Employee" button resets form to "Add" state
document.getElementById('addBtn').addEventListener('click', () => {
    employeeForm.reset();
    document.getElementById('editIndex').value = "-1";
    document.getElementById('employeeModalLabel').textContent = "Add New Employee";
});

// Run Initializer
init();
