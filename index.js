// almost identical build to the guided practice

const API =
  "https://fsa-crud-2aa9294fe819.herokuapp.com/api/2504-FTB-ET-WEB-FT/events";

// State
let parties = [];
let selectedParty;
let guests = [];
let rsvps = [];

//updates state with all parties from the API
async function getParties() {
  try {
    const response = await fetch(API);
    const json = await response.json();
    parties = json.data;
    render();
  } catch (error) {
    console.error("Failed to fetch parties:", error);
  }
}

//EXTRA CREDIT TO GRAB GUESTS AND RSVPs
async function getGuests() {
  try {
    const response = await fetch(
      "https://fsa-crud-2aa9294fe819.herokuapp.com/api/2504-FTB-ET-WEB-FT/guests"
    );
    const json = await response.json();
    guests = json.data;
  } catch (err) {
    console.error("Failed to fetch guests", err);
  }
}

//Updates state with a single party from the API
async function getParty(id) {
  try {
    const response = await fetch(`${API}/${id}`);
    const json = await response.json();
    selectedParty = json.data;

    await getGuests();
    await getRSVPs();

    render(); // re-render to show everything
  } catch (err) {
    console.error("Failed to fetch party", err);
  }
}

async function getRSVPs() {
  try {
    const response = await fetch(
      "https://fsa-crud-2aa9294fe819.herokuapp.com/api/2504-FTB-ET-WEB-FT/rsvps"
    );
    const json = await response.json();
    rsvps = json.data;
  } catch (err) {
    console.error("Failed to fetch RSVPs", err);
  }
}

//adding the new party form function to add more parties
function NewPartyForm() {
  const form = document.createElement("form");
  form.classList.add("new-party-form");

  const fields = ["name", "description", "date", "location"];
  const inputs = {};

  fields.forEach((field) => {
    const label = document.createElement("label");
    label.textContent = `${field[0].toUpperCase() + field.slice(1)}: `;

    const input = document.createElement("input");
    input.name = field;
    input.required = true;

    if (field === "date") input.type = "date";
    else input.type = "text";

    inputs[field] = input;

    label.appendChild(input);
    form.appendChild(label);
  });

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Add Party";
  form.appendChild(submitBtn);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newParty = {
      name: inputs.name.value,
      description: inputs.description.value,
      date: new Date(inputs.date.value).toISOString(),
      location: inputs.location.value,
    };

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newParty),
      });

      if (!response.ok) throw new Error("Failed to create party");

      await getParties(); // re-fetch and re-render
      form.reset();
    } catch (err) {
      console.error(err);
    }
  });

  return form;
}

//Components

//party name that shows the name, ID, date, description, and location of selected party

function PartyListItem(party) {
  const li = document.createElement("li");
  const a = document.createElement("a");
  a.href = "#selected";
  a.textContent = party.name;

  a.addEventListener("click", () => {
    getParty(party.id);
  });

  li.appendChild(a);
  return li;
}

//A list of names of all the Parties

function PartyList() {
  const ul = document.createElement("ul");
  ul.classList.add("party-list");

  parties.forEach((party) => {
    const li = PartyListItem(party);
    ul.appendChild(li);
  });

  return ul;
}
// Detailed information about the selected party

function PartyDetails() {
  if (!selectedParty) {
    const p = document.createElement("p");
    p.textContent = "Please select a party to view details.";
    return p;
  }

  const section = document.createElement("section");
  section.classList.add("party");

  const heading = document.createElement("h3");
  heading.textContent = `${selectedParty.name}`;

  const id = document.createElement("p");
  id.textContent = `ID: ${selectedParty.id}`;

  const date = document.createElement("p");
  date.textContent = `Date: ${new Date(selectedParty.date).toLocaleString()}`;

  const description = document.createElement("p");
  description.textContent = selectedParty.description;

  const location = document.createElement("p");
  location.textContent = `Location: ${selectedParty.location}`;

  //here is the added delete button
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete Party";
  deleteButton.style.marginTop = "1em";

  deleteButton.addEventListener("click", async () => {
    if (confirm("Are you sure you want to delete this party?")) {
      try {
        await fetch(`${API}/${selectedParty.id}`, {
          method: "DELETE",
        });
        selectedParty = null; // clear selected party from state
        await getParties(); // refresh the party list
      } catch (err) {
        console.error("Failed to delete party", err);
      }
    }
  });

  const rsvpList = document.createElement("ul");
  rsvpList.textContent = "Guests:";

  const partyRSVPs = rsvps.filter(
    (rsvp) => Number(rsvp.eventId) === Number(selectedParty.id)
  );

  const guestList = guests.filter((guest) =>
    partyRSVPs.some((rsvp) => Number(rsvp.guestId) === Number(guest.id))
  );

  guestList.forEach((guest) => {
    const li = document.createElement("li");
    li.textContent = `${guest.name} (${guest.email})`;
    rsvpList.appendChild(li);
  });

  section.appendChild(heading);
  section.appendChild(id);
  section.appendChild(date);
  section.appendChild(description);
  section.appendChild(location);
  section.appendChild(rsvpList);
  section.appendChild(deleteButton);

  return section;
}

//render the above functions
function render() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const title = document.createElement("h1");
  title.textContent = "Party Planner";
  app.appendChild(title);

  // Add form to create a new party
  const form = NewPartyForm();
  app.appendChild(form);

  const listHeader = document.createElement("h2");
  listHeader.textContent = "Upcoming Parties";
  app.appendChild(listHeader);

  const ul = PartyList();
  app.appendChild(ul);

  const detailHeader = document.createElement("h2");
  detailHeader.textContent = "Party Details";
  app.appendChild(detailHeader);

  const details = PartyDetails();
  app.appendChild(details);
}
async function init() {
  await getRSVPs();
  await getGuests();
  await getParties();
}

init();
