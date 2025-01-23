document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get form values
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    // Send POST request to the login API
    const response = await fetch("https://localhost:7152/api/User/Login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    // Handle the response
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.token); // Save the token
      window.location.href = "profile.html"; // Redirect to profile page
    } else {
      const errorData = await response.json();
      alert(`Login failed: ${errorData.message || "Invalid credentials"}`);
    }
  } catch (error) {
    console.error("Error during login:", error);
    alert("An error occurred. Please try again.");
  }
});
