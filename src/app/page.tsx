export default function Home() {
  return (
    <div className = "home">
      <h1 className = "title">ACEI Dashboard</h1>
      <div className = "login-form">
        <input placeholder="Username" className = "login"></input>
        <input placeholder="Password" type="password" className = "login"></input>
        <button className = "login">Login</button>
      </div>
    </div>
  );
}
