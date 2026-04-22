const taskForm = document.querySelector('#taskForm');
const refreshButton = document.querySelector('#refreshButton');
const taskList = document.querySelector('#taskList');
const statsGrid = document.querySelector('#statsGrid');
const taskCount = document.querySelector('#taskCount');
const systemStatus = document.querySelector('#systemStatus');

const labels = {
  todo: 'Por hacer',
  in_progress: 'En progreso',
  done: 'Hecha',
  low: 'Prioridad baja',
  medium: 'Prioridad media',
  high: 'Prioridad alta'
};

async function request(url, options) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || 'No fue posible completar la operacion');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function renderStats(stats) {
  const values = [
    ['Total', stats.total],
    ['Por hacer', stats.todo],
    ['En progreso', stats.inProgress],
    ['Hechas', stats.done]
  ];

  statsGrid.innerHTML = values
    .map(
      ([label, value]) => `
        <article class="stat-card">
          <span class="stat-label">${label}</span>
          <strong class="stat-value">${value}</strong>
        </article>
      `
    )
    .join('');
}

function renderTasks(tasks) {
  taskCount.textContent = `${tasks.length} tareas`;

  if (tasks.length === 0) {
    taskList.innerHTML = '<div class="empty-state">Aun no hay tareas registradas.</div>';
    return;
  }

  taskList.innerHTML = tasks
    .map(
      (task) => `
        <article class="task-card" data-id="${task.id}" data-title="${task.title}" data-description="${task.description || ''}" data-status="${task.status}">
          <header>
            <div>
              <h3>${task.title}</h3>
              <p>${task.description || 'Sin descripcion'}</p>
            </div>
            <span class="tag">#${task.id}</span>
          </header>
          <div class="task-meta">
            <span class="tag">${labels[task.status]}</span>
            <span class="tag">${labels[task.priority]}</span>
            <span class="tag">Actualizada: ${new Date(task.updatedAt).toLocaleString()}</span>
          </div>
          <div class="task-actions">
            <button data-action="advance" data-id="${task.id}">Cambiar estado</button>
            <button data-action="delete" data-id="${task.id}">Eliminar</button>
          </div>
        </article>
      `
    )
    .join('');
}

function nextStatus(currentStatus) {
  if (currentStatus === 'todo') {
    return 'in_progress';
  }

  if (currentStatus === 'in_progress') {
    return 'done';
  }

  return 'todo';
}

async function loadBoard() {
  const [health, taskPayload] = await Promise.all([
    request('/api/health'),
    request('/api/tasks')
  ]);

  systemStatus.textContent = health.status === 'ok' ? 'Sistema operativo' : 'Sistema degradado';
  renderStats(health.stats);
  renderTasks(taskPayload.items);
}

taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(taskForm);

  try {
    await request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });

    taskForm.reset();
    await loadBoard();
  } catch (error) {
    alert(error.message);
  }
});

refreshButton.addEventListener('click', () => {
  loadBoard().catch((error) => alert(error.message));
});

taskList.addEventListener('click', async (event) => {
  const button = event.target.closest('button');

  if (!button) {
    return;
  }

  const taskCard = button.closest('.task-card');
  const title = taskCard?.dataset.title;
  const description = taskCard?.dataset.description;
  const status = taskCard?.dataset.status;

  try {
    if (button.dataset.action === 'delete') {
      await request(`/api/tasks/${button.dataset.id}`, { method: 'DELETE' });
      await loadBoard();
      return;
    }

    const next = nextStatus(status || 'todo');

    await request(`/api/tasks/${button.dataset.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title,
        description,
        status: next
      })
    });

    await loadBoard();
  } catch (error) {
    alert(error.message);
  }
});

loadBoard().catch((error) => {
  systemStatus.textContent = 'Sin conexion';
  taskList.innerHTML = `<div class="empty-state">${error.message}</div>`;
});
