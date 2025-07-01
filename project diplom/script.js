let allClients = [];
let allProducts = [];
function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.getElementById(tabId).classList.add('active');
}

function toggleForm(formId) {
  const form = document.getElementById(formId);
  form.classList.toggle('hidden');
}

document.addEventListener("DOMContentLoaded", () => {
  loadClients();
  loadProducts();
  loadOrders();
  loadRoutes();

  const routesTab = document.getElementById('routesTab');
  if (routesTab) {
    routesTab.addEventListener('click', () => {
      loadWorkingOrders().then(() => {
        const orderSelect = document.getElementById('orderSelect');
        const selectedOrderID = orderSelect?.value;
        loadRoutes(selectedOrderID);
      });
    });
  }

  const routeForm = document.getElementById('routeForm');
  if (routeForm) {
    routeForm.addEventListener('submit', event => {
      event.preventDefault();
      const orderSelect = document.getElementById('orderSelect');
      const selectedOrderID = orderSelect ? orderSelect.value : null;

      addRoute(event);

      if (selectedOrderID) {
        loadRoutes(selectedOrderID);
      } else {
        loadRoutes(); // fallback
      }
    });
  }

  const orderSelect = document.getElementById('orderSelect');
  if (orderSelect) {
    orderSelect.addEventListener('change', () => {
      const selectedOrderID = orderSelect.value;
      loadRoutes(selectedOrderID);
    });
  }
});

// === КЛИЕНТЫ ===
function addClient(event) {
  event.preventDefault();

  const formData = new FormData();
  formData.append('clientName', document.getElementById('clientName').value);
  formData.append('clientSite', document.getElementById('clientSite').value);
  formData.append('clientCharac', document.getElementById('clientCharac').value);

  fetch('add_client.php', {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        loadClients();
        event.target.reset();
        toggleForm('clientForm');
      } else {
        alert("Ошибка: " + data.error);
      }
    });
}

function loadClients() {
  fetch('get_clients.php')
    .then(res => res.json())
    .then(data => {
      allClients = data;
      renderClients(allClients);
    });
}

function renderClients(clients) {
  const tbody = document.getElementById('clientTableBody');
  tbody.innerHTML = '';

  clients.forEach(c => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${c.clientName}</td>
      <td>${c.clientSite}</td>
      <td>${c.clientCharac}</td>
      <td><button class="action-button" onclick="downloadDoneOrders(${c.clientID})">Скачать</button></td>
    `;
    tbody.appendChild(row);
  });
}

function filterClients() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allClients.filter(c =>
    c.clientName.toLowerCase().includes(query) ||
    c.clientSite.toLowerCase().includes(query) ||
    (c.clientCharac || '').toLowerCase().includes(query)
  );
  renderClients(filtered);
}

async function downloadDoneOrders(clientID) {
  try {
    const response = await fetch(`get_done_by_client.php?clientID=${clientID}`);
    const data = await response.json();

    if (!data.length) {
      alert("Нет готовых заказов для этого клиента.");
      return;
    }

    let content = "";
    data.forEach((order, index) => {
      content += `ЗАКАЗ №${index + 1}\n`;
      content += `Заказчик: ${order.clientName} (ID: ${order.clientID})\n`;
      content += `Изделие: ${order.productName} (ID: ${order.productID})\n`;
      content += `Резонатор: ${order.resonatorName} (ID: ${order.resonatorID})\n`;
      content += `Кол-во датчиков: ${order.productsNum || '-'}\n`;
      content += `Примечание: ${order.doneNote || '-'}\n\n`;
    });

    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `готовые_заказы_клиент_${clientID}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Ошибка при загрузке готовых заказов:", err);
    alert("Не удалось загрузить заказы.");
  }
}

// === ИЗДЕЛИЯ ===
function addProduct(event) {
  event.preventDefault();

  const formData = new FormData();
  formData.append('productName', document.getElementById('productName').value);
  formData.append('productCate', document.getElementById('productCate').value);
  formData.append('productAppearance', document.getElementById('productAppearance').value);

  // Берём файл из input[type=file]
  const photoInput = document.getElementById('productPhoto');
  if (photoInput.files.length > 0) {
    formData.append('productPhoto', photoInput.files[0]);
  }

  fetch('add_product.php', {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        loadProducts();
        event.target.reset();
        toggleForm('productForm');
      } else {
        alert("Ошибка: " + data.error);
      }
    });
}


function loadProducts() {
  fetch('get_products.php')
    .then(res => res.json())
    .then(data => {
      allProducts = data;  // сохраняем все изделия в глобальный массив
      renderProducts(allProducts);
    });
}

function renderProducts(products) {
  const tbody = document.getElementById('productTableBody');
  tbody.innerHTML = '';

  products.forEach(p => {
    const photoCell = p.productNote
      ? `<img src="${p.productNote}" alt="Фото изделия" style="max-width:100px; max-height:80px;" />`
      : '';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${p.productName}</td>
      <td>${p.productCATE}</td>
      <td>${p.productAppearance}</td>
      <td>${photoCell}</td>
      <td><button class="action-button" onclick="showClientsForProduct(${p.productID})">Клиенты</button></td>
    `;
    tbody.appendChild(row);
  });
}


function filterProducts() {
  const query = document.getElementById('searchProductInput').value.toLowerCase();
  const filtered = allProducts.filter(p =>
    p.productName.toLowerCase().includes(query) ||
    (p.productCATE || '').toLowerCase().includes(query) ||
    (p.productAppearance || '').toLowerCase().includes(query) ||
    (p.productNote || '').toLowerCase().includes(query)
  );
  renderProducts(filtered);
}

function showClientsForProduct(productID) {
  fetch(`get_clients_by_product.php?productID=${productID}`)
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('clientsList');
      list.innerHTML = '';

      if (data.length === 0) {
        list.innerHTML = '<li>Нет клиентов</li>';
      } else {
        data.forEach(client => {
          const li = document.createElement('li');
          li.textContent = `${client.clientName} (ID: ${client.clientID})`;
          list.appendChild(li);
        });
      }

      document.getElementById('clientsModal').classList.remove('hidden');
    })
    .catch(err => {
      console.error('Ошибка загрузки клиентов:', err);
      alert('Не удалось загрузить клиентов.');
    });
}

function closeClientsModal() {
  document.getElementById('clientsModal').classList.add('hidden');
}

// === ЗАКАЗЫ ===
function addOrder(event) {
  event.preventDefault();

  const formData = new FormData();
  formData.append('clientID', document.getElementById('clientID').value);
  formData.append('productID', document.getElementById('productID').value);
  formData.append('productsNum', document.getElementById('productsNum').value);
  formData.append('orderDateReceipt', document.getElementById('orderDateReceipt').value);
  formData.append('assignedExecutionDate', document.getElementById('assignedExecutionDate').value);

  fetch('add_order.php', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('✅ Заказ успешно добавлен!');
      loadOrders(); // ← 🔁 добавляем перезагрузку таблицы
      document.getElementById('addOrderForm').reset(); // ← 🎯 если нужна очистка формы
    } else {
      alert('❌ Ошибка: ' + data.error);
    }
  })
  .catch(error => {
    alert('❌ Ошибка запроса: ' + error.message);
  });
}

function loadOrders() {
  return fetch('get_orders.php')
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById('orderTableBody');
      tbody.innerHTML = '';

      data.forEach((o, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${o.orderID}</td>
        <td>${o.clientName}</td>
        <td>${o.productName}</td>
        <td>${o.productsNum ?? '—'}</td>
        <td>${o.assignedExecutionDate ?? '—'}</td>
        <td>
          <button class="action-button" onclick="openOrderDetails(${o.orderID})">Подробнее</button>
          <button class="action-button" onclick='openEditModal(${JSON.stringify(o)})'>Редактировать</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  });
}

function loadClientOptions() {
  fetch('get_clients.php')
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById('clientID');
      select.innerHTML = '<option disabled selected>Выберите заказчика</option>';

      data.forEach(c => {
        const option = document.createElement('option');
        option.value = c.clientID;
        option.textContent = c.clientName;
        select.appendChild(option);
      });
    });
}

function loadProductOptions() {
  fetch('get_products.php')
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById('productID');
      select.innerHTML = '<option disabled selected>Выберите изделие</option>';

      data.forEach(p => {
        const option = document.createElement('option');
        option.value = p.productID;
        option.textContent = p.productName;
        select.appendChild(option);
      });
    });
}

function openOrderDetails(orderID) {
  fetch('get_order_details.php?orderID=' + orderID)
    .then(res => res.json())
    .then(order => {
      const modalBody = document.getElementById('orderModalBody');
      modalBody.innerHTML = `
        <h3>Детали заказа №${order.orderN || order.orderID}</h3>
        <ul>
          <li><strong>Клиент:</strong> ${order.clientName}</li>
          <li><strong>Дата приёма:</strong> ${order.orderDateReceipt}</li>
          <li><strong>Назначенная дата:</strong> ${order.assignedExecutionDate}</li>
          <li><strong>Фактическая дата:</strong> ${order.actualExecutionDate || '—'}</li>
          <li><strong>Статус:</strong> ${order.orderStatus}</li>
          <li><strong>Изделие:</strong> ${order.productName}</li>
          <li><strong>Заказано:</strong> ${order.productsNum}</li>
          <li><strong>Запущено:</strong> ${order.productsNumStart ?? 0}</li>
        </ul>
        ${
          order.orderStatus === 'В работе'
            ? `<button onclick="markOrderDone(${order.orderID})">Выполнено</button>`
            : order.orderStatus === 'Готово'
              ? `<em>Заказ выполнен</em>`
              : `<button onclick="startProduction(${order.orderID})">Запустить в работу</button>`
        }
      `;
      document.getElementById('orderModal').classList.remove('hidden');
    });
}

function markOrderDone(orderID) {
  if (!confirm('Отметить заказ #' + orderID + ' как готовый?')) return;

  fetch('mark_order_done.php', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: 'orderID=' + encodeURIComponent(orderID)
  })
  .then(res => {
    if (!res.ok) throw new Error('Ошибка сети');
    return res.json();
  })
  .then(data => {
    if (data.success) {
      alert('Заказ успешно отмечен как готовый');
      closeModal();
      loadOrders();
    } else {
      throw new Error(data.message);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Ошибка: ' + error.message);
  });
}


function closeModal() {
  document.getElementById('orderModal').classList.add('hidden');
}

function openEditModal(order) {
  const role = localStorage.getItem('userRole');

  document.getElementById('editOrderID').value = order.orderID;
  document.getElementById('editProductsNum').value = order.productsNum;
  document.getElementById('editOrderDateReceipt').value = order.orderDateReceipt ?? '';
  document.getElementById('editAssignedExecutionDate').value = order.assignedExecutionDate ?? '';
  document.getElementById('editActualExecutionDate').value = order.actualExecutionDate ?? '';

  const isAdmin = role === 'admin';
  const isRestricted = !isAdmin; // manager и worker

  // Подгружаем клиентов
  fetch('get_clients.php')
    .then(res => res.json())
    .then(clients => {
      const select = document.getElementById('editClientID');
      select.innerHTML = '';
      clients.forEach(c => {
        const option = document.createElement('option');
        option.value = c.clientID;
        option.text = c.clientName;
        if (c.clientID == order.clientID) option.selected = true;
        select.appendChild(option);
      });
      select.disabled = isRestricted; // 🔒
    });

  // Подгружаем изделия
  fetch('get_products.php')
    .then(res => res.json())
    .then(products => {
      const select = document.getElementById('editProductID');
      select.innerHTML = '';
      products.forEach(p => {
        const option = document.createElement('option');
        option.value = p.productID;
        option.text = p.productName;
        if (p.productID == order.productID) option.selected = true;
        select.appendChild(option);
      });
      select.disabled = isRestricted; // 🔒
    });

  // Остальные поля
  document.getElementById('editProductsNum').disabled = isRestricted;
  document.getElementById('editOrderDateReceipt').disabled = isRestricted;
  document.getElementById('editAssignedExecutionDate').disabled = isRestricted;

  // Фактическую дату оставляем всегда доступной
  document.getElementById('editActualExecutionDate').disabled = false;

  document.getElementById('editOrderModal').classList.remove('hidden');
}

function submitEditOrder(event) {
  event.preventDefault();

  const role = localStorage.getItem('userRole');
  const isAdmin = role === 'admin';

  const form = document.getElementById('editOrderForm');
  const formData = new FormData();

  // Всегда можно редактировать actualExecutionDate
  formData.append('orderID', document.getElementById('editOrderID').value);
  formData.append('actualExecutionDate', document.getElementById('editActualExecutionDate').value);

  if (isAdmin) {
    formData.append('clientID', document.getElementById('editClientID').value);
    formData.append('productID', document.getElementById('editProductID').value);
    formData.append('productsNum', document.getElementById('editProductsNum').value);
    formData.append('orderDateReceipt', document.getElementById('editOrderDateReceipt').value);
    formData.append('assignedExecutionDate', document.getElementById('editAssignedExecutionDate').value);
  }

  fetch('update_order.php', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert('Заказ успешно обновлён');
      closeEditModal();
      loadOrders(); // перезагрузка списка
    } else {
      alert('Ошибка: ' + data.error);
    }
  })
  .catch(err => {
    alert('Ошибка отправки запроса: ' + err);
  });
}

function closeEditModal() {
  document.getElementById('editOrderModal').classList.add('hidden');
}

function startProduction(orderID) {
  if (!confirm('Вы точно хотите запустить заказ #' + orderID + ' в производство?')) {
    return;
  }

  fetch('start_order.php', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: 'orderID=' + encodeURIComponent(orderID)
  })
  .then(res => {
    if (!res.ok) throw new Error('Ошибка сети');
    return res.json();
  })
  .then(data => {
    if (data.success) {
      alert(data.message); // Показываем кастомное сообщение
      document.getElementById('orderDetails').classList.add('hidden');
      loadOrders();
    } else {
      throw new Error(data.message);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert(error.message);
  });
}

function loadWorkingOrders() {
  const select = document.getElementById('orderSelect');
  const previousValue = select?.value;

  return fetch('get_orders.php')
    .then(res => res.json())
    .then(data => {
      select.innerHTML = '';

      const workingOrders = data.filter(order => order.orderStatus === 'В работе');

      if (workingOrders.length === 0) {
        const option = document.createElement('option');
        option.text = 'Нет заказов "В работе"';
        option.disabled = true;
        option.selected = true;
        select.appendChild(option);
        return;
      }

      workingOrders.forEach(order => {
        const option = document.createElement('option');
        option.value = order.orderID;
        option.text = `#${order.orderID} (Клиент: ${order.clientID}, Изделие: ${order.productID})`;

        // восстанавливаем ранее выбранное значение
        if (order.orderID == previousValue) {
          option.selected = true;
        }

        select.appendChild(option);
      });
    });
}

// МАРШРУТЫ //
function addRoute(event) {
  const form = event.target;
  const formData = new FormData(form);

  fetch('add_route.php', {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert('Маршрут успешно добавлен');
        form.reset();
      } else {
        alert('Ошибка: ' + data.error);
      }
    });
}


function loadRoutes(orderID = null) {
  fetch('get_routes.php')
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById('routeTableBody');
      tbody.innerHTML = '';

      // Фильтрация по orderID, если задан
      const filteredRoutes = orderID 
        ? data.filter(r => r.orderID == orderID) 
        : data;

      filteredRoutes.forEach((r, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${r.orderID}</td>
          <td>${r.routeN}</td>
          <td>${r.routeDate}</td>
          <td>${r.productID}</td>
          <td>${r.productSerial}</td>
          <td>${r.routeNote}</td>
        `;
        tbody.appendChild(row);
      });
    });
}

// РЕЗОНАТОРЫ //
// Загрузка резонаторов с сервера и отображение в таблице
async function loadResonators() {
  try {
    const response = await fetch('get_resonators.php');
    const data = await response.json();
    const tbody = document.getElementById('resonatorTableBody');
    tbody.innerHTML = '';
    data.forEach(resonator => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${resonator.resonatorName}</td>
        <td>${resonator.resonatorNote || ''}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Ошибка загрузки резонаторов:', error);
  }
}

// Фильтрация таблицы резонаторов по названию
function filterResonators() {
  const input = document.getElementById('searchResonatorInput').value.toLowerCase();
  const rows = document.querySelectorAll('#resonatorTableBody tr');
  rows.forEach(row => {
    const name = row.cells[0].textContent.toLowerCase();
    row.style.display = name.includes(input) ? '' : 'none';
  });
}

// Переключение видимости формы добавления резонатора
function toggleResonatorForm() {
  const form = document.getElementById('resonatorForm');
  form.classList.toggle('hidden');
}

// Добавление нового резонатора (отправка на сервер)
async function addResonator(event) {
  event.preventDefault();
  const name = document.getElementById('resonatorName').value.trim();
  const note = document.getElementById('resonatorNote').value.trim();

  if (!name) {
    alert('Введите название резонатора');
    return;
  }

  try {
    const response = await fetch('add_resonator.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resonatorName: name, resonatorNote: note })
    });
    const result = await response.json();
    if (result.success) {
      loadResonators();
      toggleResonatorForm();
      document.getElementById('resonatorName').value = '';
      document.getElementById('resonatorNote').value = '';
    } else {
      alert('Ошибка добавления резонатора: ' + result.message);
    }
  } catch (error) {
    alert('Ошибка сети при добавлении резонатора');
  }
}

// ГОТОВЫЙ ЗАКАЗ //
// Загрузка заказов со статусом "Готово" в селект для выбора
async function loadOrdersReady() {
  try {
    const response = await fetch('get_orders_ready.php');
    const orders = await response.json();
    const select = document.getElementById('doneOrderSelect');
    select.innerHTML = '<option value="">Выберите заказ</option>';
    orders.forEach(order => {
      const option = document.createElement('option');
      option.value = order.orderID;
      option.dataset.clientName = order.clientName;
      option.dataset.productName = order.productName;
      option.dataset.clientID = order.clientID;
      option.dataset.productID = order.productID;
      option.dataset.productsNum = order.productsNum; // добавили сюда
      option.textContent = `Заказ #${order.orderID}`;
      select.appendChild(option);
    });
    updateClientProductFields(); // очистка полей
  } catch (error) {
    console.error('Ошибка загрузки готовых заказов:', error);
  }
}

// При выборе заказа показываем название клиента и изделия
function updateClientProductFields() {
  const select = document.getElementById('doneOrderSelect');
  const clientSpan = document.getElementById('doneClientName');
  const productSpan = document.getElementById('doneProductName');
  const productsNumSpan = document.getElementById('doneProductsNum'); // новое

  const selectedOption = select.options[select.selectedIndex];
  if (selectedOption && selectedOption.value) {
    clientSpan.textContent = selectedOption.dataset.clientName || '';
    productSpan.textContent = selectedOption.dataset.productName || '';
    productsNumSpan.textContent = selectedOption.dataset.productsNum || '';
  } else {
    clientSpan.textContent = '';
    productSpan.textContent = '';
    productsNumSpan.textContent = '';
  }
}

// Загрузка резонаторов для селекта в форме добавления
async function loadResonatorsForDone() {
  try {
    const response = await fetch('get_resonators.php');
    const resonators = await response.json();
    const select = document.getElementById('doneResonatorSelect');
    select.innerHTML = '<option value="">Выберите резонатор</option>';
    resonators.forEach(resonator => {
      const option = document.createElement('option');
      option.value = resonator.resonatorID;
      option.textContent = resonator.resonatorName;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Ошибка загрузки резонаторов:', error);
  }
}

// Добавление записи в таблицу done
async function addDone(event) {
  event.preventDefault();

  const orderSelect = document.getElementById('doneOrderSelect');
  const resonatorSelect = document.getElementById('doneResonatorSelect');
  const doneNote = document.getElementById('doneNote');
  const fileInput = document.getElementById('doneFiles');

  const orderID = orderSelect.value;
  const resonatorID = resonatorSelect.value;
  const note = doneNote.value.trim();
  const files = fileInput.files;

  if (!orderID || !resonatorID) {
    alert('Выберите заказ и резонатор');
    return;
  }

  if (files.length > 10) {
    alert('Можно загрузить не более 10 файлов');
    return;
  }

  const selectedOrder = orderSelect.options[orderSelect.selectedIndex];
  const clientID = selectedOrder.dataset.clientID;
  const productID = selectedOrder.dataset.productID;
  const productsNum = selectedOrder.dataset.productsNum || 0;

  const formData = new FormData();
  formData.append('orderID', orderID);
  formData.append('clientID', clientID);
  formData.append('productID', productID);
  formData.append('resonatorID', resonatorID);
  formData.append('doneNote', note);
  formData.append('productsNum', productsNum);

  for (let i = 0; i < files.length; i++) {
    formData.append('doneFiles[]', files[i]);
  }

  try {
    const response = await fetch('add_done.php', {
      method: 'POST',
      body: formData
    });
    const result = await response.json();
    if (result.success) {
      alert('Готовый заказ успешно добавлен');
      loadDone();
      loadOrdersReady();
      toggleForm('doneForm');
      orderSelect.value = '';
      resonatorSelect.value = '';
      doneNote.value = '';
      fileInput.value = '';
      updateClientProductFields();
    } else {
      alert('Ошибка: ' + result.message);
    }
  } catch (error) {
    alert('Ошибка сети при добавлении готового заказа');
  }
}

// Загрузка всех записей done и отображение в таблице
async function loadDone() {
  try {
    const response = await fetch('get_done.php');
    const doneRecords = await response.json();
    const tbody = document.getElementById('doneTableBody');
    tbody.innerHTML = '';
    doneRecords.forEach(record => {
      const tr = document.createElement('tr');
      const userRole = localStorage.getItem('userRole');
      const editButton = (userRole === 'admin')
        ? `<button class="action-button" onclick="editDone(${record.doneID}, '${record.doneNote || ''}', '${record.productsNum || ''}')">✏️</button>`
        : '';

      tr.innerHTML = `
      <td>${record.clientName}</td>
      <td>${record.productName}</td>
      <td>Заказ #${record.orderID}</td>
      <td>${record.resonatorName}</td>
      <td>${record.doneNote || ''}</td>
      <td>${record.productsNum || ''}</td>
      <td>
        ${
          record.files && record.files.length > 0
            ? record.files.map(f => {
                return `<a href="${f.filePath}" target="_blank">📎 ${f.originalName}</a>`;
              }).join('<br>')
            : ''
        }
      </td>
    `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Ошибка загрузки готовых заказов:', error);
  }
}

function editDone(doneID, currentNote, currentNum) {
  const newNote = prompt('Измените примечание:', currentNote);
  if (newNote === null) return;

  const newNum = prompt('Измените количество:', currentNum);
  if (newNum === null) return;

  fetch('edit_done.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doneID, doneNote: newNote.trim(), productsNum: newNum.trim() })
  })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        alert('Данные обновлены');
        loadDone(); // обновляем таблицу
      } else {
        alert('Ошибка: ' + result.message);
      }
    })
    .catch(() => alert('Сетевая ошибка при редактировании'));
}
