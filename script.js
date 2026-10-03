// RRR - Rent Reuse Return
// Simple frontend prototype

const defaultItems = [
    {
        id: 1,
        name: "Engineering Mathematics Book",
        category: "Books",
        type: "Rent",
        price: 10,
        deposit: 100,
        location: "College Library",
        description: "Useful engineering mathematics textbook in good condition."
    },

    {
        id: 2,
        name: "Scientific Calculator",
        category: "Electronics",
        type: "Borrow",
        price: 0,
        deposit: 200,
        location: "Hostel Block A",
        description: "Scientific calculator available for students during exams."
    },

    {
        id: 3,
        name: "Football",
        category: "Sports",
        type: "Borrow",
        price: 0,
        deposit: 100,
        location: "College Ground",
        description: "Good condition football for campus games."
    },

    {
        id: 4,
        name: "Study Table",
        category: "Furniture",
        type: "Rent",
        price: 30,
        deposit: 300,
        location: "Hostel Block B",
        description: "Compact study table suitable for hostel rooms."
    },

    {
        id: 5,
        name: "Drawing Kit",
        category: "Stationery",
        type: "Rent",
        price: 15,
        deposit: 100,
        location: "Main Campus",
        description: "Engineering drawing instruments for students."
    }
];


let items = JSON.parse(localStorage.getItem("rrrItems"));

if (!items || items.length === 0) {
    items = defaultItems;
    saveItems();
}

let saved = JSON.parse(localStorage.getItem("rrrSaved")) || [];

let selectedItem = null;


// NAVIGATION

function showSection(sectionName) {

    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
    });

    const section = document.getElementById(sectionName);

    if (section) {
        section.classList.add("active");
    }

    if (sectionName === "browse") {
        displayItems();
    }

    if (sectionName === "dashboard") {
        displayMyItems();
        updateStats();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// SAVE ITEMS

function saveItems() {
    localStorage.setItem("rrrItems", JSON.stringify(items));
}


// DISPLAY ITEMS

function displayItems() {

    const grid = document.getElementById("itemsGrid");

    if (!grid) return;

    const search =
        document.getElementById("searchInput")?.value
        .toLowerCase() || "";

    const category =
        document.getElementById("categoryFilter")?.value || "All";

    const filtered = items.filter(item => {

        const matchesSearch =
            item.name.toLowerCase().includes(search) ||
            item.description.toLowerCase().includes(search) ||
            item.category.toLowerCase().includes(search);

        const matchesCategory =
            category === "All" ||
            item.category === category;

        return matchesSearch && matchesCategory;
    });


    if (filtered.length === 0) {

        grid.innerHTML = `
            <div class="empty">
                <h3>No items found</h3>
                <p>Try another search or category.</p>
            </div>
        `;

        return;
    }


    grid.innerHTML = filtered.map(item => createItemCard(item)).join("");
}


// ITEM CARD

function createItemCard(item) {

    const icon = getIcon(item.category);

    const isSaved = saved.includes(item.id);

    return `
        <div class="item-card">

            <div class="item-icon">${icon}</div>

            <span class="badge">${item.category}</span>

            <h3>${escapeHTML(item.name)}</h3>

            <p>${escapeHTML(item.description)}</p>

            <div class="item-meta">
                <span>📍 ${escapeHTML(item.location)}</span>

                <span class="price">
                    ${
                        item.price == 0
                        ? "FREE"
                        : "₹" + item.price + "/day"
                    }
                </span>
            </div>

            <div class="card-buttons">

                <button
                    class="view-btn"
                    onclick="openItem(${item.id})">
                    View
                </button>

                <button
                    class="save-btn"
                    onclick="toggleSave(${item.id})">
                    ${isSaved ? "❤️ Saved" : "♡ Save"}
                </button>

            </div>

        </div>
    `;
}


// ICONS

function getIcon(category) {

    const icons = {
        Books: "📚",
        Electronics: "💻",
        Furniture: "🪑",
        Sports: "⚽",
        Stationery: "✏️",
        Other: "📦"
    };

    return icons[category] || "📦";
}


// OPEN ITEM

function openItem(id) {

    selectedItem = items.find(item => item.id === id);

    if (!selectedItem) return;

    document.getElementById("modalIcon").textContent =
        getIcon(selectedItem.category);

    document.getElementById("modalCategory").textContent =
        selectedItem.category;

    document.getElementById("modalName").textContent =
        selectedItem.name;

    document.getElementById("modalDescription").textContent =
        selectedItem.description;

    document.getElementById("modalType").textContent =
        selectedItem.type;

    document.getElementById("modalPrice").textContent =
        selectedItem.price == 0
        ? "Free"
        : "₹" + selectedItem.price + "/day";

    document.getElementById("modalDeposit").textContent =
        "₹" + selectedItem.deposit;

    document.getElementById("modalLocation").textContent =
        selectedItem.location;

    document.getElementById("itemModal").classList.add("show");
}


// CLOSE MODAL

function closeModal() {

    document.getElementById("itemModal")
        .classList.remove("show");
}


// REQUEST

function requestItem() {

    if (!selectedItem) return;

    closeModal();

    showToast(
        "Request sent for " + selectedItem.name + " 🎉"
    );
}


// SAVE ITEM

function toggleSave(id) {

    if (saved.includes(id)) {

        saved = saved.filter(itemId => itemId !== id);

        showToast("Removed from saved items");

    } else {

        saved.push(id);

        showToast("Item saved ❤️");
    }

    localStorage.setItem(
        "rrrSaved",
        JSON.stringify(saved)
    );

    displayItems();
    updateStats();
}


// ADD ITEM

document.getElementById("itemForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const newItem = {

            id: Date.now(),

            name:
                document.getElementById("itemName").value,

            category:
                document.getElementById("itemCategory").value,

            type:
                document.getElementById("itemType").value,

            price:
                Number(
                    document.getElementById("itemPrice").value
                ),

            deposit:
                Number(
                    document.getElementById("itemDeposit").value
                ),

            location:
                document.getElementById("itemLocation").value,

            description:
                document.getElementById("itemDescription").value
        };


        items.unshift(newItem);

        saveItems();

        this.reset();

        showToast("🎉 Item listed successfully!");

        showSection("browse");

        displayItems();

        updateStats();
    });


// MY ITEMS

function displayMyItems() {

    const container =
        document.getElementById("myItems");

    if (!container) return;

    // Demo: display recently added items.
    const myItems = items.slice(0, 3);

    if (myItems.length === 0) {

        container.innerHTML =
            "<p>No listings yet.</p>";

        return;
    }

    container.innerHTML =
        myItems.map(item => createItemCard(item)).join("");
}


// CATEGORY FILTER

function filterCategory(category) {

    showSection("browse");

    const filter =
        document.getElementById("categoryFilter");

    if (filter) {
        filter.value = category;
    }

    displayItems();
}


// STATS

function updateStats() {

    const total =
        document.getElementById("totalItems");

    const savedCount =
        document.getElementById("savedItems");

    const heroItems =
        document.getElementById("heroItems");

    if (total) {
        total.textContent = items.length;
    }

    if (savedCount) {
        savedCount.textContent = saved.length;
    }

    if (heroItems) {
        heroItems.textContent = items.length;
    }
}


// TOAST

function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


// BASIC HTML SAFETY

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// INITIALIZE

displayItems();
updateStats();
