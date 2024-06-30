const API_URL = 'https://store-rs7g.onrender.com/api/items';
const SOLD_ITEMS_URL = 'https://store-rs7g.onrender.com/api/sold-items';

// const API_URL = 'http://localhost:5000/api/items';
// const SOLD_ITEMS_URL = 'http://localhost:5000/api/sold-items';

document.addEventListener('DOMContentLoaded', () => {
    const addItemForm = document.getElementById('add-item-form');
    const sellItemForm = document.getElementById('sell-item-form');
    const availableItemsTable = document.getElementById('available-items').getElementsByTagName('tbody')[0];
    const soldItemsTable = document.getElementById('sold-items').getElementsByTagName('tbody')[0];
    const depletedItemsList = document.getElementById('depleted-items');
    const totalAvailableSpan = document.getElementById('total-available');
    const totalSoldSpan = document.getElementById('total-sold');
    const totalDailySalesSpan = document.getElementById('total-daily-sales');
    const searchInput = document.getElementById('search-input');
    const cash = document.getElementById('cash');
    const mpesa = document.getElementById('mpesa');
    const lipaCash = document.getElementById('lipacash');
    const lipampesa = document.getElementById('lipampesa');



    let availableItems = [];
    let soldItems = [];
    let totalAvailable = 0;
    let totalSold = 0;
    let dailySales = 0;
    let cashDailySales = 0;
    let lipamdogoDailyCashSales = 0;
    let lipamdogoDailyMpesaSales = 0;
    let mpesaDailySales = 0;

    const quizQuestion1 = "login as owner(enter admin password)";
    const quizQuestion2 = "login as user(enter user password)";
    const correctAnswer1 = "9089";
    const correctAnswer2 = "1234";

    function promptQuiz() {
        const question = Math.random() < 0.5 ? quizQuestion1 : quizQuestion2;
        const userAnswer = prompt(question);

        if (question === quizQuestion1 && userAnswer === correctAnswer1) {
            totalAvailableSpan.style.display = 'inline';
            totalSoldSpan.style.display = 'inline';
            totalDailySalesSpan.style.display = 'inline';
        } else if (question === quizQuestion2 && userAnswer === correctAnswer2) {
            totalAvailableSpan.style.display = 'none';
            totalSoldSpan.style.display = 'none';
            totalDailySalesSpan.style.display = 'none';
        }
    }

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

    async function deleteItem(id) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    }

    async function sellItem(id, soldItemData) {
        const response = await fetch(`${API_URL}/${id}/sell`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(soldItemData)
        });
        return response.json();
    }

    async function renderItems() {
        availableItems = await fetchItems();
        soldItems = await fetchSoldItems();
        availableItemsTable.innerHTML = '';
        soldItemsTable.innerHTML = '';
        depletedItemsList.innerHTML = '';

        let totalAvailableValue = 0;
        let totalSoldValue = 0;
        const today = new Date().toISOString().split('T')[0];
        let totalDailySalesValue = 0;

        availableItems.forEach(item => {
            if (item.quantity > 0) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <img src="${item.picture}" alt="${item.name}" width="50">
                    </td>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price.toLocaleString('en-US', {
                        style:'currency',
                        currency:'KES'
                    })}</td>
                    <td>
                        <button class="sold" onclick="sellItemHandler('${item._id}', '${item.name}', ${item.quantity}, ${item.price})">Sell</button>
                        <button class="delete" onclick="deleteItemHandler('${item._id}')">Delete</button>
                    </td>
                `;
                availableItemsTable.appendChild(row);
                totalAvailableValue += item.quantity * item.price;
            } else {
                const depletedItem = document.createElement('li');
                depletedItem.textContent = `${item.name}`;
                depletedItemsList.appendChild(depletedItem);
            }
        });

        soldItems.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${item.picture}" alt="${item.name}" width="50"></td>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.price.toLocaleString('en-US', {
                    style:'currency',
                    currency:'KES'
                })}</td>
                <td>${item.seller}</td>
                <td>${item.time}</td>
                <td>${item.paymentMode}</td>
            `;
            soldItemsTable.appendChild(row);
            totalSoldValue += item.quantity * item.price;
            let currentdate = new Date().toLocaleString("en-US", { timeZone: "Africa/Nairobi" })
            let soldItemDate =  (item.time).split(",")[0];
            let currentDate = currentdate.split(",")[0];
            if (soldItemDate === currentDate) {
                // console.log(cash.textContent);
                // console.log(mpesa.textContent);
    
                if (item.paymentMode === "cash"){
                    cashDailySales += item.quantity * item.price;
                }else if(item.paymentMode === "mpesa"){
                    mpesaDailySales += item.quantity * item.price;
                }else if (item.paymentMode === "lipa mdogomdogo(cash)"){
                    lipamdogoDailyCashSales += item.quantity * item.price;
                }else if(item.paymentMode === "lipa mdogomdogo(mpesa)"){
                    lipamdogoDailyMpesaSales += item.quantity * item.price;
                }
                totalDailySalesValue += item.quantity * item.price;
            }
        });

        // Update totals

        totalAvailableSpan.textContent = totalAvailableValue.toLocaleString('en-US', {
            style:'currency',
            currency:'KES'
        });
        totalSoldSpan.textContent = totalSoldValue.toLocaleString('en-US', {
            style:'currency',
            currency:'KES'
        });
        totalDailySalesSpan.textContent = totalDailySalesValue.toLocaleString('en-US', {
            style:'currency',
            currency:'KES'
        });
        cash.textContent = cashDailySales.toLocaleString('en-US', {
            style:'currency',
            currency:'KES'
        });
        mpesa.textContent = mpesaDailySales.toLocaleString('en-US', {
            style:'currency',
            currency:'KES'
        });
        lipaCash.textContent = lipamdogoDailyCashSales.toLocaleString('en-US', {
            style:'currency',
            currency:'KES'
        });
        lipampesa.textContent = lipamdogoDailyMpesaSales.toLocaleString('en-US', {
            style:'currency',
            currency:'KES'
        });
    }

    addItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newItem = {
            picture: e.target.picture.value,
            name: e.target.name.value,
            quantity: parseInt(e.target.quantity.value, 10),
            price: parseFloat(e.target.price.value)
        };
        // Remove item from depleted list if it exists there or been added to available items
        const depletedItemIndex = Array.from(depletedItemsList.getElementsByTagName('li')).findIndex(li => li.textContent === newItem.name);
        if (depletedItemIndex !== -1) {
            depletedItemsList.removeChild(depletedItemsList.getElementsByTagName('li')[depletedItemIndex]);
        }

        await addItem(newItem);
        renderItems();
        addItemForm.reset();
    });

    sellItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const sellName = e.target['sell-name'].value;
        const sellQuantity = parseInt(e.target['sell-quantity'].value, 10);
        const sellPrice = parseFloat(e.target['sell-price'].value);
        const sellerName = e.target['seller-name'].value;
        const timeSold = e.target['time-sold'].value;
        const paymentMode = e.target['payment-mode'].value;

        const itemIndex = availableItems.findIndex(item => item.name === sellName);
        if (itemIndex === -1) {
            alert('Item not available.');
            return;
        }

        if (availableItems[itemIndex].quantity >= sellQuantity) {
            const soldItemData = {
                picture: availableItems[itemIndex].picture,
                name: sellName,
                quantity: sellQuantity,
                price: sellPrice,
                seller: sellerName,
                time: timeSold,
                paymentMode: paymentMode
            };

            await sellItem(availableItems[itemIndex]._id, soldItemData);
            console.log("cash text: ",cash.textContent);
            console.log("mpesa text: ", mpesa.textContent);
            console.log(cashDailySales);
            console.log(mpesaDailySales);
            availableItems[itemIndex].quantity -= sellQuantity;
            if (availableItems[itemIndex].quantity === 0) {
                depletedItemsList.innerHTML += `<li>${sellName}</li>`;
                availableItems.splice(itemIndex, 1);
            }
            renderItems();
            sellItemForm.reset();
        } else {
            alert('Insufficient quantity.');
        }
    });

    window.deleteItemHandler = async function(id) {
        await deleteItem(id);
        renderItems();
    };

    window.copyToClipboard = function(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert('URL copied to clipboard!');
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    };

    window.sellItemHandler = async function(id, name, quantity, price) {
       
        const sellName = prompt("Enter the name of the item to sell:", name);
        const sellQuantity = parseInt(prompt("Enter the quantity to sell:", quantity), 10);
        const sellPrice = parseFloat(prompt("Enter the selling price:", price));
        const sellerName = prompt("Enter the seller's name:");
        const timeSold = new Date().toISOString();
        const paymentMode = prompt("Enter the payment mode (cash, mpesa, lipa mdogomdogo):");
       
        if (sellQuantity > quantity) {
            alert('Insufficient quantity.');
            return;
        }

        const soldItemData = {
            picture: availableItems.find(item => item._id === id).picture,
            name: sellName,
            quantity: sellQuantity,
            price: sellPrice,
            seller: sellerName,
            time: timeSold,
            paymentMode: paymentMode
        };
        
        await sellItem(id, soldItemData);
        renderItems();
    };

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const filteredItems = availableItems.filter(item => item.name.toLowerCase().includes(query));
        availableItemsTable.innerHTML = '';
        filteredItems.forEach(item => {
            availableItemsTable.innerHTML += `
                <tr>
                    <td>
                        <img src="${item.picture}" alt="${item.name}" width="50">
                        <button onclick="copyToClipboard('${item.picture}')">Copy URL</button>
                    </td>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price.toLocaleString('en-US', {
                        style:'currency',
                        currency:'KES'
                    })}</td>
                    <td><button onclick="deleteItemHandler('${item._id}')">Delete</button></td>
                </tr>
            `;
        });
    });

    promptQuiz();
    renderItems();
});
