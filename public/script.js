const API_URL = 'https://store-rs7g.onrender.com/api/items';
const SOLD_ITEMS_URL = 'https://store-rs7g.onrender.com/api/sold-items';

async function fetchItems() {
    const response = await fetch(API_URL);
    return response.json();
}

async function fetchSoldItems() {
    const response = await fetch(SOLD_ITEMS_URL);
    return response.json();
}

async function addItem(item) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
    });
    return response.json();
}

async function updateItem(id, item) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
    });
    return response.json();
}

async function deleteItem(id) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
}

async function sellItem(id) {
    const response = await fetch(`${API_URL}/${id}/sell`, { method: 'POST' });
    return response.json();
}

async function renderItems() {
    const items = await fetchItems();
    const soldItems = await fetchSoldItems();
    const availableTableBody = document.querySelector('#available-items tbody');
    const soldTableBody = document.querySelector('#sold-items tbody');
    const depletedList = document.querySelector('#depleted-items');

    availableTableBody.innerHTML = '';
    soldTableBody.innerHTML = '';
    depletedList.innerHTML = '';

    let totalAvailableValue = 0;
    let totalSoldValue = 0;

    items.forEach(item => {
        if (item.quantity > 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td class="actions">
                    <button class="sold" onclick="sellItemHandler('${item._id}')">Sell</button>
                    <button class="delete" onclick="deleteItemHandler('${item._id}')">Delete</button>
                </td>
            `;
            availableTableBody.appendChild(row);
            totalAvailableValue += item.quantity * item.price;
        } else {
            const depletedItem = document.createElement('li');
            depletedItem.textContent = `${item.name}`;
            depletedList.appendChild(depletedItem);
        }
    });

    soldItems.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>$${item.price.toFixed(2)}</td>
        `;
        soldTableBody.appendChild(row);
        totalSoldValue += item.quantity * item.price;
    });

    // Update totals
    document.getElementById('total-available').textContent = totalAvailableValue.toFixed(2);
    document.getElementById('total-sold').textContent = totalSoldValue.toFixed(2);
}

async function sellItemHandler(id) {
    await sellItem(id);
    renderItems();
}

async function deleteItemHandler(id) {
    await deleteItem(id);
    renderItems();
}

// Handle form submission
document.getElementById('add-item-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const price = parseFloat(document.getElementById('price').value);

    const newItem = { name, quantity, price };
    await addItem(newItem);
    renderItems();

    // Reset form
    document.getElementById('add-item-form').reset();
});

// Initial render
renderItems();
