document
  .getElementById("register-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form values
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const name = document.getElementById("register-name").value;
    const phoneNumber = document.getElementById("register-phone").value;
    const photoFile = document.getElementById("register-photo").files[0];

    try {
      // Step 1: Register the user
      const registerResponse = await fetch(
        "https://localhost:7152/api/User/Register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, name, phoneNumber }),
        }
      );

      // Check if the response is JSON
      const contentType = registerResponse.headers.get("content-type");
      if (!registerResponse.ok || !contentType?.includes("application/json")) {
        const errorText = await registerResponse.text(); // Read the response as text
        throw new Error(`Registration failed: ${errorText}`);
      }

      const registerData = await registerResponse.json();
      const userId = registerData.userId; // Assuming the response contains the user ID

      // Step 2: Upload the profile photo (if provided)
      if (photoFile) {
        const formData = new FormData();
        formData.append("file", photoFile);

        const uploadResponse = await fetch(
          `https://localhost:7152/api/User/UploadProfilePicture`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${registerData.token}`, // Include the token if required
            },
            body: formData, // Send FormData directly (do NOT set Content-Type header manually)
          }
        );

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(
            `Profile photo upload failed: ${
              errorData.message || "Unknown error"
            }`
          );
        }
      }

      // If both steps succeed
      alert("Registration and profile photo upload successful!");
      window.location.href = "login.html"; // Redirect to login page
    } catch (error) {
      console.error("Error during registration:", error);
      alert(error.message || "An error occurred. Please try again.");
    }
  });
