const API_URL = 'https://store-rs7g.onrender.com/api/items';
const SOLD_ITEMS_URL = 'https://store-rs7g.onrender.com/api/sold-items';

document.addEventListener('DOMContentLoaded', () => {
    const addItemForm = document.getElementById('add-item-form');
    const sellItemForm = document.getElementById('sell-item-form');
    const availableItemsTable = document.getElementById('available-items').getElementsByTagName('tbody')[0];
    const soldItemsTable = document.getElementById('sold-items').getElementsByTagName('tbody')[0];
    const depletedItemsList = document.getElementById('depleted-items');
    const totalAvailableSpan = document.getElementById('total-available');
    const totalSoldSpan = document.getElementById('total-sold');
    const totalDailySalesSpan = document.getElementById('total-daily-sales');
    const cashSalesSpan = document.getElementById('cash-sales');
    const mpesaSalesSpan = document.getElementById('mpesa-sales');
    const lipaCashSalesSpan = document.getElementById('lipacash-sales');
    const lipaMpesaSalesSpan = document.getElementById('lipampesa-sales');
    const searchInput = document.getElementById('search-input');

    let availableItems = [];
    let soldItems = [];
    let totalAvailable = 0;
    let totalSold = 0;
    let dailySales = 0;
    let cashDailySales = 0;
    let lipaMdogoDailyCashSales = 0;
    let lipaMdogoDailyMpesaSales = 0;
    let mpesaDailySales = 0;

    let defaultSellerName = "";

    const quizQuestion1 = "login as owner(enter admin password)";
    const quizQuestion2 = "login as Sharon(enter  password)";
    const quizQuestion3 = "login as Julius(enter  password)";
    const correctAnswer1 = "9089";
    const correctAnswer2 = "Sharon89";
    const correctAnswer3 = "Julius90";

    function promptQuiz() {
        const questions = [
            { question: quizQuestion1, answer: correctAnswer1, role: "owner" },
            { question: quizQuestion2, answer: correctAnswer2, role: "Sharon" },
            { question: quizQuestion3, answer: correctAnswer3, role: "Julius" }
        ];
        
        const selectedQuestion = questions[Math.floor(Math.random() * questions.length)];
        const userAnswer = prompt(selectedQuestion.question);

        if (userAnswer === selectedQuestion.answer) {
            if (selectedQuestion.role === "owner") {
                totalAvailableSpan.style.display = 'inline';
                totalSoldSpan.style.display = 'inline';
                totalDailySalesSpan.style.display = 'inline';
            } else {
                totalAvailableSpan.style.display = 'none';
                totalSoldSpan.style.display = 'none';
                totalDailySalesSpan.style.display = 'inline';
            }
            defaultSellerName = selectedQuestion.role;
        } else {
            alert('Incorrect password.');
            promptQuiz();
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
        cashDailySales = 0;
        mpesaDailySales = 0;
        lipaMdogoDailyCashSales = 0;
        lipaMdogoDailyMpesaSales = 0;

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
                        style: 'currency',
                        currency: 'KES'
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
                    style: 'currency',
                    currency: 'KES'
                })}</td>
                <td>${item.seller}</td>
                <td>${item.time}</td>
                <td>${item.paymentMode}</td>
            `;
            soldItemsTable.appendChild(row);
            totalSoldValue += item.quantity * item.price;
            let soldItemDate = item.time.split("T")[0];
            if (soldItemDate === today) {
                if (item.paymentMode === "cash") {
                    cashDailySales += item.quantity * item.price;
                } else if (item.paymentMode === "mpesa") {
                    mpesaDailySales += item.quantity * item.price;
                } else if (item.paymentMode === "lipa mdogomdogo(cash)") {
                    lipaMdogoDailyCashSales += item.quantity * item.price;
                } else if (item.paymentMode === "lipa mdogomdogo(mpesa)") {
                    lipaMdogoDailyMpesaSales += item.quantity * item.price;
                }
                totalDailySalesValue += item.quantity * item.price;
            }
        });

        // Update totals
        totalAvailableSpan.textContent = totalAvailableValue.toLocaleString('en-US', {
            style: 'currency',
            currency: 'KES'
        });
        totalSoldSpan.textContent = totalSoldValue.toLocaleString('en-US', {
            style: 'currency',
            currency: 'KES'
        });
        totalDailySalesSpan.textContent = totalDailySalesValue.toLocaleString('en-US', {
            style: 'currency',
            currency: 'KES'
        });
        cashSalesSpan.textContent = cashDailySales.toLocaleString('en-US', {
            style: 'currency',
            currency: 'KES'
        });
        mpesaSalesSpan.textContent = mpesaDailySales.toLocaleString('en-US', {
            style: 'currency',
            currency: 'KES'
        });
        lipaCashSalesSpan.textContent = lipaMdogoDailyCashSales.toLocaleString('en-US', {
            style: 'currency',
            currency: 'KES'
        });
        lipaMpesaSalesSpan.textContent = lipaMdogoDailyMpesaSales.toLocaleString('en-US', {
            style: 'currency',
            currency: 'KES'
        });
    }

    addItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addItemForm);
        const newItem = {
            name: formData.get('name'),
            quantity: parseInt(formData.get('quantity')),
            price: parseFloat(formData.get('price')),
            picture: formData.get('picture')
        };

        await addItem(newItem);
        renderItems();
        addItemForm.reset();
    });

    sellItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const sellName = e.target['sell-name'].value;
        const sellQuantity = parseInt(e.target['sell-quantity'].value);
        const sellPrice = parseFloat(e.target['sell-price'].value);
        const sellerName = defaultSellerName;
        const timeSold = new Date().toISOString();
        const paymentMode = e.target['payment-mode'].value;

        if (!sellName || !sellQuantity || !sellPrice || !sellerName || !timeSold || !paymentMode) {
            alert('All fields are required.');
            return;
        }

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

    window.deleteItemHandler = async function (id) {
        await deleteItem(id);
        renderItems();
    };

    window.copyToClipboard = function (text) {
        navigator.clipboard.writeText(text).then(() => {
            alert('URL copied to clipboard!');
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    };

    window.sellItemHandler = async function (id, name, quantity, price) {
        const sellName = prompt("Enter the name of the item to sell:", name);
        const sellQuantity = parseInt(prompt("Enter the quantity to sell:", quantity), 10);
        const sellPrice = parseFloat(prompt("Enter the selling price:", price));
        const sellerName = defaultSellerName;
        const timeSold = new Date().toISOString();
        const paymentMode = prompt("Enter the payment mode (cash, mpesa, lipa mdogomdogo):");

        if (!sellName || !sellQuantity || !sellPrice || !sellerName || !timeSold || !paymentMode) {
            alert('All fields are required.');
            return;
        }

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
                        style: 'currency',
                        currency: 'KES'
                    })}</td>
                    <td><button onclick="deleteItemHandler('${item._id}')">Delete</button></td>
                </tr>
            `;
        });
    });

    promptQuiz();
    renderItems();
});
