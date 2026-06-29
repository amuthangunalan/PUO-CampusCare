# PUO CampusCare

**Student:** KURALAMUTHAN A/L GUANALAN  
**Registration No.:** 01BCE25F3013  
**Course:** BETX0323 Software Engineering  
**Mini Project:** Topic 5, 6 and 8 - Requirement Analysis, Modelling & Design, Software Testing

PUO CampusCare is a web-based student service request and appointment system for Polytechnic Ungku Omar students. The system allows students to submit campus service requests, receive a unique Request ID, and track request status. Admin/staff can view, filter, and update request information using Google Sheets as the database.

## Project Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript, GitHub Pages / Google Sites embed |
| Backend | Google Apps Script Web App |
| Database | Google Sheets |
| Testing | Manual test cases |
| Development Model | Prototyping Model |

## Main Features

- Student dashboard with service overview
- Campus service category cards
- Submit Request form
- Auto-generated Request ID such as `SRQ001`
- Status tracker using Request ID
- Admin dashboard preview
- Google Apps Script backend connection
- Google Sheets database structure
- Manual testing evidence and improvement list

## Folder Structure

```text
PUO-CampusCare-GitHub/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── google-apps-script/
│   ├── Code.gs
│   ├── appsscript.json
│   ├── DATABASE_SCHEMA.md
│   └── DEPLOYMENT_GUIDE.md
├── test-cases/
│   └── TEST_PLAN.md
├── docs/
│   └── Amuthan_F3013_Report.docx
├── .gitignore
├── LICENSE
└── README.md
```

## How to Run Locally

1. Open the `frontend` folder.
2. Double-click `index.html`.
3. Test the student request form and status tracker.

The frontend can run in demo mode using browser local storage. To connect it to the real Google Sheets database, deploy the Apps Script web app and paste the deployment URL into `frontend/app.js`:

```js
const GAS_WEB_APP_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
```

## How the System Works

1. Student opens the PUO CampusCare website.
2. Student views available campus services.
3. Student submits a service request form.
4. Google Apps Script receives the request data.
5. Request data is stored in Google Sheets.
6. The system generates a Request ID.
7. Student can track the request using the Request ID.
8. Staff/admin updates request status in the database.

## Suggested GitHub Repository Name

```text
PUO-CampusCare
```

## Important Notes

- This is an educational prototype.
- Login, payment gateway, production security, and full admin authentication are not included.
- For final demonstration, use Google Sites or GitHub Pages as frontend and Google Apps Script as backend.

## Author

KURALAMUTHAN A/L GUANALAN  
01BCE25F3013
