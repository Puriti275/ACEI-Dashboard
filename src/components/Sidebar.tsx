"use client"

export default function Sidebar() {
    return (<div className = "sidebar">
        <img src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCZWs7bVbwi3UnEJONkeYwOBMozf93bU5l0w&s"></img>
        <ul>
            <li className = "sidebar-item">Profile</li>
            <li className = "sidebar-item">Settings</li>
            <li className = "sidebar-item">Events & Competitions</li>
            <li className = "sidebar-item">Student Profiles</li>
            <li className = "sidebar-item">Startup Coaching</li>
            <li className = "sidebar-item">Ambassador Tracking</li>
        </ul>
        <div className = "sidebar-bottom">
            <ul>
                <li className = "sidebar-item">Logout</li>
            </ul>
        </div>
    </div>)
}

