document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token"); // Retrieve the token from localStorage
  const createdRoomsList = document.getElementById("created-rooms-list");

  try {
    // Send GET request to fetch created rooms
    const response = await fetch(
      "https://localhost:7152/api/User/Rooms/Created",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request
        },
      }
    );

    // Handle the response
    if (response.ok) {
      const rooms = await response.json();
      alert(`Fetched created rooms: ${JSON.stringify(rooms)}`); // Show response in alert
      if (rooms.length > 0) {
        rooms.forEach((room) => {
          const roomItem = document.createElement("div");
          roomItem.className = "room-item";
          roomItem.innerHTML = `
            <h3>${room.name}</h3>
            <p>${room.description}</p>
          `;
          createdRoomsList.appendChild(roomItem);
        });
      } else {
        createdRoomsList.innerHTML = "<p>No rooms created yet.</p>";
      }
    } else {
      const errorData = await response.json();
      alert(
        `Failed to fetch created rooms: ${errorData.message || "Unknown error"}`
      );
    }
  } catch (error) {
    console.error("Error fetching created rooms:", error);
    alert("An error occurred. Please try again.");
  }
});
