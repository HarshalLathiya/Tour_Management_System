# TourSync - Activity Diagrams

This document contains activity diagrams for the main workflows in the Tour Management System.

---

## 1. Authentication Flow

```
mermaid
flowchart TD
    Start([User Starts]) --> RegisterOrLogin{Register or Login?}

    RegisterOrLogin -->|Register| RegisterPage[Open Registration Page]
    RegisterPage --> FillRegister[Fill Registration Form]
    FillRegister --> SubmitRegister[Submit Registration]
    SubmitRegister --> ValidateRegister{Validation Passed?}
    ValidateRegister -->|No| ShowRegisterError[Show Error Message]
    ShowRegisterError --> FillRegister
    ValidateRegister -->|Yes| CreateUser[Create User in Database]
    CreateUser --> SendVerification[Send Email Verification]
    SendVerification --> EmailVerified{Email Verified?}
    EmailVerified -->|No| WaitVerify[Wait for Verification]
    WaitVerify --> EmailVerified
    EmailVerified -->|Yes| RedirectLogin[Redirect to Login]

    RegisterOrLogin -->|Login| LoginPage[Open Login Page]
    LoginPage --> FillLogin[Fill Login Form]
    FillLogin --> SubmitLogin[Submit Login]
    SubmitLogin --> ValidateLogin{Credentials Valid?}
    ValidateLogin -->|No| ShowLoginError[Show Error Message]
    ShowLoginError --> FillLogin
    ValidateLogin -->|Yes| GenerateTokens[Generate JWT Tokens]
    GenerateTokens --> StoreTokens[Store Tokens]
    StoreTokens --> AccessDashboard[Access Dashboard]

    AccessDashboard --> End([Authenticated User])
```

---

## 2. Tour Management Flow (Admin)

```
mermaid
flowchart TD
    Start([Admin Starts]) --> ViewTours[View All Tours]
    ViewTours --> CreateNew{Admin wants to create tour?}

    CreateNew -->|Yes| OpenCreate[Open Create Tour Page]
    OpenCreate --> FillTourDetails[Fill Tour Details]
    FillTourDetails --> SubmitTour[Submit Tour Data]
    SubmitTour --> ValidateTour{Validation Passed?}
    ValidateTour -->|No| TourError[Show Validation Error]
    TourError --> FillTourDetails
    ValidateTour -->|Yes| SaveTour[Save Tour to Database]
    SaveTour --> TourCreated[Tour Created Successfully]
    TourCreated --> ViewTours

    CreateNew -->|No| SelectTour{Select Existing Tour?}
    SelectTour -->|Yes| ViewTourDetails[View Tour Details]
    ViewTourDetails --> UpdateOrDelete{Update or Delete?}

    UpdateOrDelete -->|Update| EditTour[Edit Tour Details]
    EditTour --> SubmitUpdate[Submit Updates]
    SubmitUpdate --> ValidateUpdate{Validation Passed?}
    ValidateUpdate -->|No| UpdateError[Show Error]
    UpdateError --> EditTour
    ValidateUpdate -->|Yes| UpdateTourDB[Update Tour in DB]
    UpdateTourDB --> TourUpdated[Tour Updated]
    TourUpdated --> ViewTourDetails

    UpdateOrDelete -->|Delete| ConfirmDelete[Confirm Delete]
    ConfirmDelete --> DeleteTourDB[Delete Tour from DB]
    DeleteTourDB --> TourDeleted[Tour Deleted]
    TourDeleted --> ViewTours

    SelectTour -->|No| AssignLeaderOption{Assign Leader?}
    AssignLeaderOption -->|Yes| SelectLeader[Select Leader]
    SelectLeader --> AssignToTour[Assign Leader to Tour]
    AssignToTour --> SaveAssignment[Save Assignment]
    SaveAssignment --> LeaderAssigned[Leader Assigned]
    LeaderAssigned --> ViewTourDetails

    AssignLeaderOption -->|No| End1([End])
```

---

## 3. Tour Participant Flow

```
mermaid
flowchart TD
    Start([Participant Starts]) --> ViewAvailableTours[View Available Tours]
    ViewAvailableTours --> SelectTour{Select a Tour?}

    SelectTour -->|Yes| ViewTourInfo[View Tour Information]
    ViewTourInfo --> JoinTour{Join Tour?}

    JoinTour -->|Yes| RegisterParticipant[Register as Participant]
    RegisterParticipant --> DBCheck{Check if Already Registered?}
    DBCheck -->|Yes| AlreadyJoined[Show Already Joined Message]
    DBCheck -->|No| SaveParticipant[Save Participant to DB]
    SaveParticipant --> JoinSuccess[Successfully Joined]
    JoinSuccess --> ViewMyTours[View My Tours]

    JoinTour -->|No| BackToTours[Back to Tours List]
    BackToTours --> ViewAvailableTours

    SelectTour -->|No| End([End])

    AlreadyJoined --> ViewMyTours
```

---

## 4. Attendance Check-in Flow

```
mermaid
flowchart TD
    Start([User Starts]) --> OpenAttendance[Open Attendance Page]
    OpenAttendance --> SelectTour[Select Tour]
    SelectTour --> ViewAttendanceList[View Attendance List]
    ViewAttendanceList --> Action{Choose Action?}

    Action -->|Self Check-in| CheckinPage[Open Check-in Page]
    CheckinPage --> GetLocation[Get Current Location]
    GetLocation --> CheckGeofence{Check within Tour Geofence?}
    CheckGeofence -->|No| OutsideGeofence[Show Outside Area Error]
    OutsideGeofence --> GetLocation

    CheckGeofence -->|Yes| SubmitCheckin[Submit Check-in]
    SubmitCheckin --> SaveAttendance[Save Attendance Record]
    SaveAttendance --> CheckinSuccess[Check-in Successful]
    CheckinSuccess --> ViewAttendanceList

    Action -->|View History| ViewHistory[View Attendance History]
    ViewHistory --> DisplayHistory[Display Records]
    DisplayHistory --> ViewAttendanceList

    Action -->|Leader Verify| LeaderVerify[Leader Verifies Attendance]
    LeaderVerify --> SelectRecord[Select Record to Verify]
    SelectRecord --> MarkVerified[Mark as Verified]
    MarkVerified --> UpdateVerify[Update in Database]
    UpdateVerify --> VerifySuccess[Verification Complete]
    VerifySuccess --> ViewAttendanceList
```

---

## 5. Incident & Safety Flow

```
mermaid
flowchart TD
    Start([User/Admin Starts]) --> SafetyDashboard[Open Safety Dashboard]
    SafetyDashboard --> ViewIncidents[View All Incidents]
    ViewIncidents --> ReportNew{Report New Incident?}

    ReportNew -->|Yes| SelectIncidentType[Select Incident Type]
    SelectIncidentType --> TypeChoice{Choose Type?}

    TypeChoice -->|SOS Emergency| SOSOneClick[SOS Button - One Click]
    SOSOneClick --> CreateSOS[Create SOS Incident]
    CreateSOS --> NotifyAdmins[Notify All Admins/Guides]
    NotifyAdmins --> SOSCreated[SOS Created]
    SOSCreated --> ViewIncidents

    TypeChoice -->|Health Issue| HealthForm[Fill Health Issue Form]
    HealthForm --> SubmitHealth[Submit Health Report]
    SubmitHealth --> CreateHealth[Create Health Incident]
    CreateHealth --> NotifyHealth[Notify Admins/Guides]
    NotifyHealth --> HealthCreated[Health Incident Created]
    HealthCreated --> ViewIncidents

    TypeChoice -->|General Incident| GeneralForm[Fill General Incident Form]
    GeneralForm --> SubmitGeneral[Submit Incident Details]
    SubmitGeneral --> CreateGeneral[Create General Incident]
    CreateGeneral --> IncidentCreated[Incident Created]
    IncidentCreated --> ViewIncidents

    ReportNew -->|No| ManageExisting{Manage Existing Incident?}
    ManageExisting -->|Yes| SelectIncident[Select Incident]
    SelectIncident --> UpdateStatus{Update Status?}

    UpdateStatus -->|Respond| MarkResponding[Mark as Responding]
    MarkResponding --> UpdateRespondDB[Update in DB]
    UpdateRespondDB --> RespondSuccess[Response Recorded]
    RespondSuccess --> SelectIncident

    UpdateStatus -->|Resolve| AddResolution[Add Resolution Notes]
    AddResolution --> MarkResolved[Mark as Resolved]
    MarkResolved --> UpdateResolveDB[Update in DB]
    UpdateResolveDB --> ResolveSuccess[Incident Resolved]
    ResolveSuccess --> SelectIncident

    UpdateStatus -->|Delete| ConfirmDelete[Confirm Delete]
    ConfirmDelete --> DeleteIncidentDB[Delete from DB]
    DeleteIncidentDB --> IncidentDeleted[Incident Deleted]
    IncidentDeleted --> ViewIncidents

    ManageExisting -->|No| End([End])
```

---

## 6. Budget Management Flow

```
mermaid
flowchart TD
    Start([User Starts]) --> OpenBudget[Open Budget Management]
    OpenBudget --> ViewBudgets[View All Budgets]
    ViewBudgets --> Action{Choose Action?}

    Action -->|Create Budget| CreateBudgetPage[Open Create Budget Page]
    CreateBudgetPage --> FillBudget[Fill Budget Details]
    FillBudget --> SubmitBudget[Submit Budget]
    SubmitBudget --> CheckExists{Check if Budget Exists?}
    CheckExists -->|Yes| BudgetExists[Show Budget Exists Error]
    BudgetExists --> FillBudget
    CheckExists -->|No| SaveBudget[Save Budget to DB]
    SaveBudget --> BudgetCreated[Budget Created]
    BudgetCreated --> CreateAuditLog[Create Audit Log]
    CreateAuditLog --> ViewBudgets

    Action -->|View Details| ViewBudgetDetails[View Budget Details]
    ViewBudgetDetails --> DisplayBudget[Display Budget Info]
    DisplayBudget --> AddExpense{Add Expense?}

    AddExpense -->|Yes| AddExpenseForm[Add Expense Form]
    AddExpenseForm --> SubmitExpense[Submit Expense]
    SubmitExpense --> UpdateSpent[Update Spent Amount]
    UpdateSpent --> UpdateDB[Update Database]
    UpdateDB --> ExpenseAdded[Expense Added]
    ExpenseAdded --> CreateExpenseLog[Create Audit Log]
    CreateExpenseLog --> DisplayBudget

    AddExpense -->|No| BackToBudgets[Back to Budget List]
    BackToBudgets --> ViewBudgets

    Action -->|Edit Budget| EditBudget[Edit Budget]
    EditBudget --> ModifyBudget[Modify Budget Details]
    ModifyBudget --> SubmitBudgetEdit[Submit Changes]
    SubmitBudgetEdit --> UpdateBudgetDB[Update in DB]
    UpdateBudgetDB --> BudgetUpdated[Budget Updated]
    BudgetUpdated --> CreateUpdateLog[Create Audit Log]
    CreateUpdateLog --> ViewBudgets

    Action -->|Delete Budget| ConfirmBudgetDelete[Confirm Delete]
    ConfirmBudgetDelete --> DeleteBudgetDB[Delete from DB]
    DeleteBudgetDB --> BudgetDeleted[Budget Deleted]
    BudgetDeleted --> CreateDeleteLog[Create Audit Log]
    CreateDeleteLog --> ViewBudgets
```

---

## 7. Announcement Management Flow

```
mermaid
flowchart TD
    Start([Admin/Guide Starts]) --> OpenAnnouncements[Open Announcements]
    OpenAnnouncements --> ViewAnnouncements[View All Announcements]
    ViewAnnouncements --> Action{Choose Action?}

    Action -->|Create| CreateAnnouncement[Open Create Page]
    CreateAnnouncement --> FillAnnouncement[Fill Details]
    FillAnnouncement --> SubmitAnnouncement[Submit]
    SubmitAnnouncement --> SaveAnnouncement[Save to DB]
    SaveAnnouncement --> CreateAnnounceLog[Create Audit Log]
    CreateAnnounceLog --> AnnouncementCreated[Announcement Created]
    AnnouncementCreated --> ViewAnnouncements

    Action -->|View| SelectAnnouncement[Select Announcement]
    SelectAnnouncement --> DisplayContent[Display Content]
    DisplayContent --> ViewAnnouncements

    Action -->|Update| EditAnnouncement[Edit Announcement]
    EditAnnouncement --> ModifyContent[Modify Content]
    ModifyContent --> SubmitEdit[Submit Changes]
    SubmitEdit --> UpdateAnnouncementDB[Update in DB]
    UpdateAnnouncementDB --> AnnouncementUpdated[Updated]
    AnnouncementUpdated --> CreateUpdateLogAnnounce[Create Audit Log]
    CreateUpdateLogAnnounce --> ViewAnnouncements

    Action -->|Delete| ConfirmAnnounceDelete[Confirm Delete]
    ConfirmAnnounceDelete --> DeleteAnnouncementDB[Delete from DB]
    DeleteAnnouncementDB --> AnnouncementDeleted[Deleted]
    AnnouncementDeleted --> CreateDeleteLogAnnounce[Create Audit Log]
    CreateDeleteLogAnnounce --> ViewAnnouncements
```

---

## 8. User Profile Management Flow

```
mermaid
flowchart TD
    Start([User Starts]) --> OpenProfile[Open Profile Page]
    OpenProfile --> ViewProfile[View Profile Details]
    ViewProfile --> Action{Choose Action?}

    Action -->|Edit Profile| EditProfile[Edit Profile]
    EditProfile --> ModifyProfile[Modify Details]
    ModifyProfile --> SaveProfile[Save Changes]
    SaveProfile --> UpdateProfileDB[Update in DB]
    UpdateProfileDB --> ProfileUpdated[Profile Updated]
    ProfileUpdated --> ViewProfile

    Action -->|Change Password| ChangePassword[Change Password]
    ChangePassword --> EnterCurrent[Enter Current Password]
    EnterCurrent --> EnterNew[Enter New Password]
    EnterNew --> ConfirmNew[Confirm New Password]
    ConfirmNew --> ValidatePassword{Validation Passed?}
    ValidatePassword -->|No| PasswordError[Show Error]
    PasswordError --> EnterCurrent
    ValidatePassword -->|Yes| UpdatePasswordDB[Update Password]
    UpdatePasswordDB --> PasswordChanged[Password Changed]
    PasswordChanged --> ViewProfile

    Action -->|Logout| Logout[Logout]
    Logout --> ClearTokens[Clear Tokens]
    ClearTokens --> RedirectLogin[Redirect to Login]
    RedirectLogin --> End([Logged Out])
```

---

## 9. Overall System Flow

```
mermaid
flowchart TD
    Start([System Start]) --> InitDB[Initialize Database]
    InitDB --> RunMigrations[Run Migrations]
    RunMigrations --> StartServers[Start Backend & Frontend]
    StartServers --> UserAccess[User Accesses App]

    UserAccess --> CheckAuth{User Authenticated?}
    CheckAuth -->|No| LoginPage[Redirect to Login]
    LoginPage --> Authenticate[Authenticate User]
    Authenticate --> GenerateJWT[Generate JWT Token]
    GenerateJWT --> ReturnTokens[Return Tokens]
    ReturnTokens --> CheckAuth

    CheckAuth -->|Yes| ShowDashboard[Show Dashboard]
    ShowDashboard --> FeatureChoice{Select Feature}

    FeatureChoice -->|Tours| TourFeature[Tour Management]
    TourFeature --> ViewTours

    FeatureChoice -->|Attendance| AttendanceFeature[Attendance Tracking]
    AttendanceFeature --> TrackAttendance

    FeatureChoice -->|Safety| SafetyFeature[Safety & Incidents]
    SafetyFeature --> ManageSafety

    FeatureChoice -->|Budget| BudgetFeature[Budget Management]
    BudgetFeature --> ManageBudget

    FeatureChoice -->|Announcements| AnnouncementFeature[Announcements]
    AnnouncementFeature --> ManageAnnouncements

    FeatureChoice -->|Profile| ProfileFeature[Profile Management]
    ProfileFeature --> ManageProfile

    FeatureChoice -->|Logout| LogoutUser[Logout]
    LogoutUser --> UserAccess

    ViewTours --> Continue{Continue?}
    TrackAttendance --> Continue
    ManageSafety --> Continue
    ManageBudget --> Continue
    ManageAnnouncements --> Continue
    ManageProfile --> Continue

    Continue -->|Yes| FeatureChoice
    Continue -->|No| End([End])
```

---

## 10. Complete Activity Diagram Summary

| Module               | Key Activities                                                                          |
| -------------------- | --------------------------------------------------------------------------------------- |
| **Authentication**   | Register, Login, Logout, Refresh Token, Profile Update, Password Change                 |
| **Tour Management**  | Create Tour, View Tours, Update Tour, Delete Tour, Assign Leader, Join Tour             |
| **Attendance**       | Self Check-in (with geofencing), View History, Leader Verification                      |
| **Incidents/Safety** | Report General Incident, Trigger SOS (one-click), Report Health Issue, Respond, Resolve |
| **Budget**           | Create Budget, View Budget, Add Expense, Update Budget, Delete Budget                   |
| **Announcements**    | Create Announcement, View Announcement, Update Announcement, Delete Announcement        |
| **Audit Logs**       | Automatic logging of all CRUD operations for compliance                                 |

---

## Notes

1. **Geofencing**: Attendance check-in validates user location within tour boundaries
2. **Role-based Access**: Admin, Guide, and Tourist roles determine available actions
3. **Audit Trail**: All significant actions are logged for compliance
4. **Data Immutability**: Attendance records cannot be modified after 24 hours
5. **Real-time Notifications**: SOS and incidents trigger immediate notifications to admins/guides

---

_Generated for TourSync - Tour Management System_
