document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (document.getElementById('accountSection')) {
    showUserInfo();
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      try {
        const response = await fetch('login.php', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
          const text = await response.text();
          console.error('Ошибка сервера:', response.status, text);
          alert('Ошибка сервера: ' + response.status);
          return;
        }

        const result = await response.json();
        console.log('Ответ сервера:', result);
        alert(result.message);

        if (result.success === true || result.success === 'true') {
          localStorage.setItem('userEmail', email);

          // Сохраняем ФИО как было
          if (result.lastname && result.firstname && result.middlename) {
            const fio = `${result.lastname} ${result.firstname[0]}. ${result.middlename[0]}.`;
            localStorage.setItem('userFIO', fio);
          } else {
            localStorage.setItem('userFIO', email);
          }

          // Сохраняем роль ТОЛЬКО если её нет в localStorage
          if (!localStorage.getItem('userRole')) {
            localStorage.setItem('userRole', result.role || 'worker');
          }

          window.location.href = 'clients.html';
        }

      } catch (error) {
        alert('Ошибка при входе. Попробуйте позже.');
        console.error('Ошибка fetch:', error);
      }
    });
  }

  if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const lastname = document.getElementById('registerLastname').value.trim();
    const firstname = document.getElementById('registerFirstname').value.trim();
    const middlename = document.getElementById('registerMiddlename').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!lastname || !firstname || !middlename || !email || !password || !confirmPassword) {
      alert('Пожалуйста, заполните все поля.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }

    try {
      const response = await fetch('register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastname, firstname, middlename, email, password })
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Ошибка сервера:', response.status, text);
        alert('Ошибка сервера: ' + response.status);
        return;
      }

      const result = await response.json();
      console.log('Ответ сервера:', result);
      alert(result.message);

      if (result.success === true || result.success === 'true') {

        if (result.role) {
          localStorage.setItem('userRole', result.role);
        } else {
          localStorage.setItem('userRole', 'worker'); // если по какой-то причине роль не пришла
        }

        localStorage.setItem('userEmail', email);
        const fio = `${lastname} ${firstname[0]}. ${middlename[0]}.`;
        localStorage.setItem('userFIO', fio);
        window.location.href = 'clients.html';
      }
    } catch (error) {
      alert('Ошибка при регистрации. Попробуйте позже.');
      console.error('Ошибка fetch:', error);
    }
  });
  }
})


function logout() {
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userRole');
  window.location.href = 'index.html';
}

function checkAuth() {
  const email = localStorage.getItem('userEmail');
  if (!email) {
    window.location.href = 'index.html';
    return null;
  }
  return email;
}

function showUserInfo() {
  const email = localStorage.getItem('userEmail');
  if (email) {
    const accountSection = document.getElementById('accountSection');
    const userEmailSpan = document.getElementById('userFio');
    if (accountSection && userEmailSpan) {
      const fio = localStorage.getItem('userFIO') || email;
      userEmailSpan.textContent = fio;
      accountSection.style.display = 'flex';
    }
  }
}

function getUserRole() {
  return localStorage.getItem('userRole') || 'worker';
}

function isAdmin() {
  return getUserRole() === 'admin';
}

function isManager() {
  return getUserRole() === 'manager';
}

function isWorker() {
  return getUserRole() === 'worker';
}

/**
 * Скрывает элемент по id, если роль пользователя не входит в список разрешённых
 * @param {string} elementId - ID HTML-элемента
 * @param {string[]} allowedRoles - Массив ролей, которым элемент доступен
 */
function hideIfNotAllowed(elementId, allowedRoles) {
  const role = getUserRole();
  if (!allowedRoles.includes(role)) {
    const el = document.getElementById(elementId);
    if (el) el.style.display = 'none';
  }
}
