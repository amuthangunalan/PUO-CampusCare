// Paste your deployed Google Apps Script Web App URL here.
// Example: const GAS_WEB_APP_URL = "https://script.google.com/macros/s/XXXXX/exec";
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzMg0865F8vu2rkIcqWLeMy58tZr6Xha8thH-K_TcGHmGwcmSc9uhrQ12DWK4qpa_NXDw/exec";

const STORAGE_KEY = "puoCampusCareRequests";

const staffByCategory = {
  "IT Support": "IT Staff",
  "Facility": "Facility Officer",
  "Document": "Admin Office",
  "Counselling": "Counsellor",
  "Lost & Found": "Student Affairs",
  "General": "General Admin"
};

function getStoredRequests() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const sample = [
      {
        requestId: "SRQ001",
        timestamp: new Date().toISOString(),
        studentName: "KURALAMUTHAN A/L GUANALAN",
        registrationNo: "01BCE25F3013",
        phoneNumber: "",
        serviceCategory: "IT Support",
        serviceDetails: "Sample request for demonstration.",
        quantity: "1",
        appointmentDate: new Date().toISOString().split("T")[0],
        contactMethod: "WhatsApp",
        priority: "Normal",
        status: "Pending",
        assignedStaff: "IT Staff",
        remarks: "Demo data"
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
    return sample;
  }
  return JSON.parse(raw);
}

function saveStoredRequests(requests) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

function generateRequestId() {
  const requests = getStoredRequests();
  const nextNumber = requests.length + 1;
  return `SRQ${String(nextNumber).padStart(3, "0")}`;
}

function formToObject(form) {
  const data = new FormData(form);
  const request = Object.fromEntries(data.entries());
  request.requestId = generateRequestId();
  request.timestamp = new Date().toISOString();
  request.status = "Pending";
  request.assignedStaff = staffByCategory[request.serviceCategory] || "General Admin";
  request.remarks = "Submitted successfully";
  return request;
}

async function submitToAppsScript(request) {
  const response = await fetch(GAS_WEB_APP_URL, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "submitRequest", ...request })
  });

  if (!response.ok) {
    throw new Error("Apps Script request failed.");
  }

  return response.json();
}

function submitInDemoMode(request) {
  const requests = getStoredRequests();
  requests.push(request);
  saveStoredRequests(requests);
  return {
    success: true,
    requestId: request.requestId,
    status: request.status,
    message: "Request submitted successfully in demo mode."
  };
}

function updateStats() {
  const requests = getStoredRequests();
  const total = requests.length;
  const pending = requests.filter((request) => request.status === "Pending").length;
  const completed = requests.filter((request) => request.status === "Completed").length;

  document.getElementById("totalRequests").textContent = total;
  document.getElementById("pendingRequests").textContent = pending;
  document.getElementById("completedRequests").textContent = completed;
}

function renderTable() {
  const requests = getStoredRequests();
  const tbody = document.getElementById("requestTable");

  tbody.innerHTML = requests
    .slice()
    .reverse()
    .map((request) => `
      <tr>
        <td>${request.requestId}</td>
        <td>${request.studentName}</td>
        <td>${request.registrationNo}</td>
        <td>${request.serviceCategory}</td>
        <td>${request.priority || "Normal"}</td>
        <td><span class="status-pill">${request.status}</span></td>
        <td>${request.assignedStaff}</td>
      </tr>
    `)
    .join("");
}

function showMessage(elementId, type, html) {
  const element = document.getElementById(elementId);
  element.className = type === "success" ? `${elementId === "formMessage" ? "form-message" : "result-box"} success` : `${elementId === "formMessage" ? "form-message" : "result-box"} error`;
  element.innerHTML = html;
}

async function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const request = formToObject(form);

  try {
    let result;
    if (GAS_WEB_APP_URL.trim()) {
      result = await submitToAppsScript(request);
    } else {
      result = submitInDemoMode(request);
    }

    if (!result.success) {
      throw new Error(result.message || "Submission failed.");
    }

    showMessage(
      "formMessage",
      "success",
      `<strong>Request submitted successfully!</strong><br>Request ID: <b>${result.requestId}</b><br>Status: <b>${result.status || "Pending"}</b>`
    );

    form.reset();
    form.studentName.value = "KURALAMUTHAN A/L GUANALAN";
    form.registrationNo.value = "01BCE25F3013";
    form.quantity.value = "1";
    updateStats();
    renderTable();
  } catch (error) {
    showMessage("formMessage", "error", `<strong>Error:</strong> ${error.message}`);
  }
}

function handleTrackStatus() {
  const requestId = document.getElementById("trackId").value.trim().toUpperCase();
  if (!requestId) {
    showMessage("trackResult", "error", "Please enter a Request ID.");
    return;
  }

  const requests = getStoredRequests();
  const request = requests.find((item) => item.requestId.toUpperCase() === requestId);

  if (!request) {
    showMessage("trackResult", "error", "No request found. Please check your Request ID.");
    return;
  }

  showMessage(
    "trackResult",
    "success",
    `<strong>${request.requestId}</strong><br>
     Category: ${request.serviceCategory}<br>
     Status: <b>${request.status}</b><br>
     Assigned Staff: ${request.assignedStaff}<br>
     Remarks: ${request.remarks || "-"}`
  );
}

function setMinimumDate() {
  const dateInput = document.querySelector('input[name="appointmentDate"]');
  const today = new Date().toISOString().split("T")[0];
  dateInput.min = today;
  dateInput.value = today;
}

function init() {
  setMinimumDate();
  updateStats();
  renderTable();
  document.getElementById("requestForm").addEventListener("submit", handleFormSubmit);
  document.getElementById("trackBtn").addEventListener("click", handleTrackStatus);
}

init();
