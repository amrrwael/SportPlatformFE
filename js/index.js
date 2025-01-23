document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const roomList = document.getElementById("room-list");
  const createRoomButton = document.getElementById("create-room-button");
  const filterForm = document.getElementById("filter-form");
  const sportIdDropdown = document.getElementById("sportId");

  // Function to check if the user has joined a room
  const hasUserJoinedRoom = (roomId) => {
    const joinedRooms = JSON.parse(localStorage.getItem("joinedRooms") || "[]");
    return joinedRooms.includes(roomId);
  };

  // Function to add a room to the user's joined rooms
  const addJoinedRoom = (roomId) => {
    const joinedRooms = JSON.parse(localStorage.getItem("joinedRooms") || "[]");
    if (!joinedRooms.includes(roomId)) {
      joinedRooms.push(roomId);
      localStorage.setItem("joinedRooms", JSON.stringify(joinedRooms));
    }
  };

  // Fetch and populate sports dropdown
  const fetchSports = async () => {
    try {
      const response = await fetch("https://localhost:7152/api/Sport", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const sports = await response.json();
        sports.forEach((sport) => {
          const option = document.createElement("option");
          option.value = sport.id;
          option.textContent = sport.name;
          sportIdDropdown.appendChild(option);
        });
      } else {
        const errorData = await response.json();
        console.error(
          "Failed to fetch sports:",
          errorData.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error fetching sports:", error);
    }
  };

  // Fetch sports on page load
  fetchSports();

  // Redirect to Create Room page
  createRoomButton.addEventListener("click", () => {
    window.location.href = "create-room.html";
  });

  // Fetch rooms with filters
  const fetchRooms = async (filters = {}) => {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(
        `https://localhost:7152/api/Room/all?${queryParams}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const rooms = await response.json();
        roomList.innerHTML = ""; // Clear existing rooms

        if (rooms.length > 0) {
          rooms.forEach((room) => {
            const roomCard = document.createElement("div");
            roomCard.className = "room-card";

            // Check if the user has joined the room
            const isUserInRoom = hasUserJoinedRoom(room.id);

            // Calculate price per person
            const pricePerPerson = (
              room.stadium.price / room.maxPlayers
            ).toFixed(2);

            roomCard.innerHTML = `
              <h3>${room.name}</h3>
              <p>${room.description}</p>
              <p><strong>City:</strong> ${room.city}</p>
              <p><strong>Sport:</strong> ${room.sport.name}</p>
              <p><strong>Stadium:</strong> ${room.stadium.name} (${
              room.stadium.location
            })</p>
              <p><strong>Max Players:</strong> ${room.maxPlayers}</p>
              <p><strong>Event Start:</strong> ${new Date(
                room.eventStart
              ).toLocaleString()}</p>
              <p class="players-joined"><strong>Players Joined:</strong> <span>${
                room.playerIds.length
              }</span>/${room.maxPlayers}</p>
              <p><strong>Host:</strong> ${room.hostUserName}</p>
              <div class="room-buttons">
                ${
                  isUserInRoom
                    ? '<p class="room-joined">Room Joined</p>'
                    : `<button onclick="joinRoom(${room.id})"><i class="fas fa-user-plus"></i> Join Room</button>`
                }
                <a href="room.html?id=${
                  room.id
                }" class="button-primary"><i class="fas fa-info-circle"></i> View Details</a>
              </div>
            `;
            roomList.appendChild(roomCard);
          });
        } else {
          roomList.innerHTML = "<p>No rooms available.</p>";
        }
      } else {
        const errorData = await response.json();
        alert(`Failed to fetch rooms: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      alert("An error occurred. Please try again.");
    }
  };

  // Initial fetch without filters
  fetchRooms();

  // Apply filters when the form is submitted
  filterForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const filters = {
      city: document.getElementById("city").value,
      sportId: document.getElementById("sportId").value,
    };

    fetchRooms(filters);
  });
});

// Function to join a room
async function joinRoom(roomId) {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(
      `https://localhost:7152/api/Room/Join/${roomId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      alert("Successfully joined the room!");
      addJoinedRoom(roomId); // Add the room to the user's joined rooms
      window.location.reload(); // Refresh the page to update the room list
    } else {
      const errorData = await response.json();
      alert(`Failed to join room: ${errorData.message || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Error joining room:", error);
    alert("An error occurred. Please try again.");
  }
}