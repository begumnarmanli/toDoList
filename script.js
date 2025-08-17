

document.addEventListener("DOMContentLoaded", () => {
  const newTaskBtn = document.getElementById("newTaskBtn");
  const taskModal = document.getElementById("taskModal");
  const taskForm = document.getElementById("taskForm");
  const taskList = document.getElementById("taskList");
  const closeTaskModal = document.querySelector(".close");
  const detailModal = document.getElementById("detailModal");
  const closeDetailBtn = document.getElementById("closeDetailBtn");
  const addTodoBtn = document.getElementById("addTodoBtn");
  const newTodoInput = document.getElementById("newTodo");
  const closeDetailSpan = document.querySelector(".closeDetail");
  const todoListInModal = document.getElementById("todoList");
  

  const confirmModal = document.getElementById("confirmModal");
  const confirmMessage = document.getElementById("confirmMessage");
  const confirmYesBtn = document.getElementById("confirmDeleteBtn");
  const confirmCancelBtn = document.getElementById("confirmCancelBtn");

  // Yeni eklenen düzenleme modalı ve elemanları
  const editTaskModal = document.getElementById("editTaskModal");
  const closeEditModal = document.querySelector(".closeEdit");
  const editTaskForm = document.getElementById("editTaskForm");
  const editCustomerInput = document.getElementById("editCustomer");
  const editProjectInput = document.getElementById("editProject");
  const editPriorityInput = document.getElementById("editPriority");
     const editDeadlineInput = document.getElementById("editDeadline");
   const editPriceInput = document.getElementById("editPrice");
  let currentEditIndex = null;

  // DOM elementlerinin yüklenip yüklenmediğini kontrol et
  console.log("DOM elementleri kontrol ediliyor:");
  console.log("editTaskModal:", editTaskModal);
  console.log("closeEditModal:", closeEditModal);
  console.log("editTaskForm:", editTaskForm);
  console.log("editCustomerInput:", editCustomerInput);
  console.log("editProjectInput:", editProjectInput);
  console.log("editPriorityInput:", editPriorityInput);
     console.log("editDeadlineInput:", editDeadlineInput);
   console.log("editPriceInput:", editPriceInput);

  let customers = [];
  let currentTaskCard = null;

  

  loadCustomers();

  

  

  // Mobil cihazlar için güçlendirilmiş event listener'lar
  function openNewTaskModal() {
    console.log("Modal açılıyor...");
    taskModal.style.display = "block";
  }

  // Click event
  newTaskBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Yeni görev butonuna tıklandı");
    openNewTaskModal();
  });
  
  // Touch events
  newTaskBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    console.log("Yeni görev butonuna dokunuldu");
    openNewTaskModal();
  });

  // Mouse events (mobil tarayıcılar için)
  newTaskBtn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    console.log("Yeni görev butonuna mouse down");
    openNewTaskModal();
  });

  // Pointer events (modern tarayıcılar için)
  newTaskBtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    console.log("Yeni görev butonuna pointer down");
    openNewTaskModal();
  });
  // Modal kapatma butonları için mobil optimizasyon
  closeTaskModal.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Modal kapatma butonuna tıklandı");
    taskModal.style.display = "none";
  });
  
  closeTaskModal.addEventListener("touchstart", (e) => {
    e.preventDefault();
    console.log("Modal kapatma butonuna dokunuldu");
    taskModal.style.display = "none";
  });

  // Düzenleme modalı kapatma butonu dinleyicisi
  if (closeEditModal) {
    closeEditModal.addEventListener("click", () => {
      editTaskModal.style.display = "none";
    });
  }

  window.addEventListener("click", (event) => {
    if (event.target == taskModal) {
      taskModal.style.display = "none";
    }
    if (event.target == detailModal) {
      detailModal.style.display = "none";
    }
    if (event.target == confirmModal) {
      confirmModal.style.display = "none";
    }
    // Düzenleme modalını da kapatacak dinleyici
    if (event.target == editTaskModal) {
      editTaskModal.style.display = "none";
    }
  });

  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("Form submit edildi");
    
    const customerName = document.getElementById("customer").value;
    const projectType = document.getElementById("project").value;
    const priority = document.getElementById("priority").value;
         const deadline = document.getElementById("deadline").value;
     const price = document.getElementById("price").value;

         console.log("Form değerleri:", { customerName, projectType, priority, deadline, price });

    if (!projectType || !priority) {
      alert("Lütfen proje türü ve aciliyet seçiniz.");
      return;
    }

         const newCustomer = {
       name: customerName,
       project: projectType,
       priority: priority,
       deadline: deadline,
       price: price,
       todos: [],
     };
    customers.push(newCustomer);
    saveCustomers();
    renderCustomers();
    taskModal.style.display = "none";
    taskForm.reset();

    document.querySelectorAll(".custom-select-trigger").forEach((trigger) => {
      if (trigger.dataset.type === "project") {
        trigger.textContent = "Proje Türü Seçin";
        document.getElementById("project").value = "";
      } else if (trigger.dataset.type === "priority") {
        trigger.textContent = "Aciliyet";
        document.getElementById("priority").value = "";
      }
    });
  });

  // Yeni eklenen düzenleme formunun submit olayı
  editTaskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const customer = customers[currentEditIndex];
    customer.name = editCustomerInput.value;
    customer.project = editProjectInput.value;
    customer.priority = editPriorityInput.value;
         customer.deadline = editDeadlineInput.value;
     customer.price = editPriceInput.value;

    saveCustomers();
    renderCustomers();
    editTaskModal.style.display = "none";
  });

  function renderCustomers() {
    taskList.innerHTML = "";
    customers.forEach((customer, index) => {
             const taskCard = createTaskCardElement(customer, index);
       taskList.appendChild(taskCard);
    });
  }

  function createTaskCardElement(customer, index) {
    const taskCard = document.createElement("div");
    taskCard.classList.add("task-card");
    taskCard.dataset.index = index;
    let priorityClass = "";
    if (customer.priority === "Yüksek") priorityClass = "priority-high";
    else if (customer.priority === "Orta") priorityClass = "priority-medium";
    else if (customer.priority === "Düşük") priorityClass = "priority-low";

    

    // "Düzenle" butonu eklenmiş hali
    taskCard.innerHTML = `
            <div class="task-card-header">
                <h3 class="editable customer-name">${customer.name}</h3>
                <div>
                    <button class="edit-task-btn">Düzenle</button>
                    <button class="delete-task-btn">Görevi sil</button>
                </div>
            </div>
            <p>Proje: <span class="editable project-type">${customer.project}</span></p>
            <p>Aciliyet: <span class="editable priority ${priorityClass}">${customer.priority}</span></p>
                         <p>Son Teslim Tarihi: <span class="editable deadline">${customer.deadline}</span></p>
             <p>Fiyat: <span class="editable price">${customer.price}</span></p>
            <ul class="todo-list"></ul>
        `;

    taskCard.querySelectorAll(".editable").forEach((span) => {
      span.addEventListener("click", () => {
        const existingValue = span.textContent;
        const fieldName = span.classList.contains("customer-name")
          ? "name"
          : span.classList.contains("project-type")
          ? "project"
          : span.classList.contains("priority")
          ? "priority"
          : span.classList.contains("deadline")
          ? "deadline"
          : "price";

        span.style.display = "none";

        let editInput;
        if (fieldName === "priority") {
          editInput = document.createElement("select");
          editInput.classList.add("edit-todo-input");
          ["Yüksek", "Orta", "Düşük"].forEach((p) => {
            const option = document.createElement("option");
            option.value = p;
            option.textContent = p;
            if (p === existingValue) option.selected = true;
            editInput.appendChild(option);
          });
        } else if (fieldName === "deadline") {
          editInput = document.createElement("input");
          editInput.type = "date";
          editInput.value = existingValue;
          editInput.classList.add("edit-todo-input");
        } else if (fieldName === "price") {
          editInput = document.createElement("input");
          editInput.type = "number";
          editInput.value = existingValue;
          editInput.classList.add("edit-todo-input");
        } else {
          editInput = document.createElement("input");
          editInput.type = "text";
          editInput.value = existingValue;
          editInput.classList.add("edit-todo-input");
        }

        span.parentNode.insertBefore(editInput, span);
        editInput.focus();

        const saveEdit = () => {
          const newValue = editInput.value.trim();
          if (newValue) {
            customers[index][fieldName] = newValue;
            saveCustomers();
            renderCustomers();
          }
          editInput.remove();
          span.style.display = "block";
        };

        editInput.addEventListener("blur", saveEdit);
        editInput.addEventListener("keyup", (e) => {
          if (e.key === "Enter") {
            saveEdit();
          }
        });
      });
    });

    const todoListInCard = taskCard.querySelector(".todo-list");
    customer.todos.forEach((todo, todoIndex) => {
      const todoItem = createTodoItemElement(todo, index, todoIndex, "card");
      todoListInCard.appendChild(todoItem);
    });

    // "Düzenle" butonu için olay dinleyicisi - Event delegation kullanarak
    const editTaskBtn = taskCard.querySelector(".edit-task-btn");
    if (editTaskBtn) {
      editTaskBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log("Düzenle butonuna tıklandı, index:", index);
        try {
          openEditModal(index);
        } catch (error) {
          console.error("Düzenle butonu hatası:", error);
        }
      });
    } else {
      console.error("Düzenle butonu bulunamadı!");
    }

    const deleteTaskBtn = taskCard.querySelector(".delete-task-btn");
    deleteTaskBtn.addEventListener("click", () => {
      showConfirmModal(
        "Bu görevi silmek istediğinizden emin misiniz?",
        () => {
          customers.splice(index, 1);
          saveCustomers();
          renderCustomers();
        },
        "Bu görevi sil"
      );
    });

    taskCard.addEventListener("click", (e) => {
      if (e.target.closest(".delete-task-btn")) {
        return;
      }
      // Düzenle butonuna tıklandığında detay modalını açmasını engeller
      if (e.target.closest(".edit-task-btn")) {
        console.log("Düzenle butonu tıklandı, detay modalı açılmayacak");
        return;
      }
      if (!e.target.closest(".todo-list") && !e.target.closest(".editable")) {
        openDetailModal(customer.name, taskCard);
      }
    });

    return taskCard;
  }

  // Yeni eklenen openEditModal fonksiyonu
  function openEditModal(index) {
    try {
      console.log("openEditModal çağrıldı, index:", index);
      const customer = customers[index];
      console.log("Customer:", customer);

      if (!customer) {
        console.error("Customer bulunamadı!");
        return;
      }

      currentEditIndex = index;

      // Modal başlığını güncelle
      const editModalTitle = document.getElementById("editModalTitle");
      if (editModalTitle) {
        editModalTitle.textContent = `${customer.name} - Düzenle`;
      }

      // Form alanlarını doldur
      if (editCustomerInput) editCustomerInput.value = customer.name || "";
      if (editProjectInput) editProjectInput.value = customer.project || "";
      if (editPriorityInput) editPriorityInput.value = customer.priority || "";
      if (editDeadlineInput) editDeadlineInput.value = customer.deadline || "";
             if (editPriceInput) editPriceInput.value = customer.price || "";

      // Custom select trigger'ları güncelle
      const editProjectTrigger = document.querySelector(
        '.custom-select-trigger[data-type="editProject"]'
      );
      if (editProjectTrigger)
        editProjectTrigger.textContent = customer.project || "Proje Türü Seçin";

      const editPriorityTrigger = document.querySelector(
        '.custom-select-trigger[data-type="editPriority"]'
      );
      if (editPriorityTrigger)
        editPriorityTrigger.textContent = customer.priority || "Aciliyet";

      // Modalı aç
      if (editTaskModal) {
        console.log("Modal açılıyor...");
        editTaskModal.style.display = "block";
        console.log("Modal display:", editTaskModal.style.display);
      } else {
        console.error("editTaskModal bulunamadı!");
      }
    } catch (error) {
      console.error("openEditModal hatası:", error);
    }
  }

  function openDetailModal(customerName, taskCard) {
    currentTaskCard = taskCard;
    const customerIndex = taskCard.dataset.index;
    const customer = customers[customerIndex];
    document.getElementById(
      "detailTitle"
    ).textContent = `${customerName} - Yapılacaklar`;
    todoListInModal.innerHTML = "";
    customer.todos.forEach((todo, todoIndex) => {
      const todoItem = createTodoItemElement(
        todo,
        customerIndex,
        todoIndex,
        "modal"
      );
      todoListInModal.appendChild(todoItem);
    });
    detailModal.style.display = "block";
  }

  addTodoBtn.addEventListener("click", () => {
    const todoText = newTodoInput.value.trim();
    if (todoText && currentTaskCard) {
      const customerIndex = currentTaskCard.dataset.index;
      const customer = customers[customerIndex];
      const newTodo = { name: todoText, completed: false };
      customer.todos.push(newTodo);
      saveCustomers();
      renderCustomers();
      const newTodoItemInModal = createTodoItemElement(
        newTodo,
        customerIndex,
        customer.todos.length - 1,
        "modal"
      );
      todoListInModal.appendChild(newTodoItemInModal);
      newTodoInput.value = "";
    }
  });

  function createTodoItemElement(todo, customerIndex, todoIndex, location) {
    const li = document.createElement("li");
    li.classList.add("todo-item");
    if (todo.completed) {
      li.classList.add("completed");
    }

    if (location === "card") {
      li.innerHTML = `
                <input type="checkbox" ${todo.completed ? "checked" : ""}>
                <span>${todo.name}</span>
                <button class="delete-btn">Sil</button>
            `;
      li.querySelector('input[type="checkbox"]').addEventListener(
        "change",
        (e) => {
          const isChecked = e.target.checked;
          customers[customerIndex].todos[todoIndex].completed = isChecked;
          saveCustomers();
          if (isChecked) {
            li.classList.add("completed");
          } else {
            li.classList.remove("completed");
          }
          checkAllTodosCompleted();
        }
      );
    } else if (location === "modal") {
      li.innerHTML = `
                <span>${todo.name}</span>
                <button class="delete-btn">Sil</button>
            `;
      const todoSpan = li.querySelector("span");

      todoSpan.addEventListener("click", () => {
        const existingText = todoSpan.textContent;
        todoSpan.style.display = "none";

        const editInput = document.createElement("input");
        editInput.type = "text";
        editInput.value = existingText;
        editInput.classList.add("edit-todo-input");
        li.insertBefore(editInput, todoSpan);
        editInput.focus();

        const saveEdit = () => {
          const newText = editInput.value.trim();
          if (newText) {
            customers[customerIndex].todos[todoIndex].name = newText;
            todoSpan.textContent = newText;
            saveCustomers();
            renderCustomers();
          }
          editInput.remove();
          todoSpan.style.display = "block";
        };

        editInput.addEventListener("blur", saveEdit);
        editInput.addEventListener("keyup", (e) => {
          if (e.key === "Enter") {
            saveEdit();
          }
        });
      });
    }

    li.querySelector(".delete-btn").addEventListener("click", () => {
      showConfirmModal(
        "Bu görevi silmek istediğinizden emin misiniz?",
        () => {
          customers[customerIndex].todos.splice(todoIndex, 1);
          saveCustomers();
          renderCustomers();
          if (detailModal.style.display === "block") {
            openDetailModal(
              customers[customerIndex].name,
              document.querySelector(
                `.task-card[data-index='${customerIndex}']`
              )
            );
          }
          checkAllTodosCompleted();
        },
        "Bu görevi sil"
      );
    });

    return li;
  }

  function showConfirmModal(message, onConfirm, title = "Onay Gerekli") {
    document.getElementById("confirmTitle").textContent = title;
    confirmMessage.textContent = message;
    confirmModal.style.display = "block";

    confirmYesBtn.onclick = () => {
      onConfirm();
      confirmModal.style.display = "none";
    };
    confirmCancelBtn.onclick = () => {
      confirmModal.style.display = "none";
    };
  }

  closeDetailBtn.addEventListener("click", () => {
    detailModal.style.display = "none";
  });
  closeDetailSpan.addEventListener("click", () => {
    detailModal.style.display = "none";
  });

  function saveCustomers() {
    localStorage.setItem("customers", JSON.stringify(customers));
  }

  function loadCustomers() {
    const storedCustomers = localStorage.getItem("customers");
    if (storedCustomers) {
      customers = JSON.parse(storedCustomers);
      renderCustomers();
    }
  }

  function checkAllTodosCompleted() {
    let allCompleted = true;
    if (customers.length === 0) {
      allCompleted = false;
    } else {
      for (const customer of customers) {
        if (customer.todos.length === 0) {
          allCompleted = false;
          break;
        }
        for (const todo of customer.todos) {
          if (!todo.completed) {
            allCompleted = false;
            break;
          }
        }
        if (!allCompleted) break;
      }
    }
    if (allCompleted) {
      const confettiSettings = { target: "confetti-canvas" };
      const confetti = new ConfettiGenerator(confettiSettings);
      const body = document.body;

      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.top = 0;
      overlay.style.left = 0;
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      overlay.style.zIndex = "998";
      body.appendChild(overlay);

      document.getElementById("confetti-canvas").style.zIndex = "999";

      confetti.render();

      setTimeout(() => {
        confetti.clear();
        overlay.remove();
        document.getElementById("confetti-canvas").style.zIndex = "auto";
      }, 5000);
    }
  }

  

  document.querySelectorAll(".custom-select-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const options = trigger.parentNode.querySelector(".custom-options");
      trigger.classList.toggle("active");
      options.classList.toggle("active");
    });
  });

  document.querySelectorAll(".custom-options li").forEach((option) => {
    option.addEventListener("click", (e) => {
      const parentContainer = e.target.closest(".custom-select-container");
      const trigger = parentContainer.querySelector(".custom-select-trigger");
      const hiddenInput = parentContainer.querySelector(
        `#${trigger.dataset.type}`
      );

      trigger.textContent = e.target.textContent;
      hiddenInput.value = e.target.dataset.value;

      trigger.classList.remove("active");
      parentContainer
        .querySelector(".custom-options")
        .classList.remove("active");
    });
  });

  window.addEventListener("click", (e) => {
    if (!e.target.closest(".custom-select-container")) {
      document.querySelectorAll(".custom-options.active").forEach((options) => {
        options.classList.remove("active");
        options.parentNode
          .querySelector(".custom-select-trigger")
          .classList.remove("active");
      });
    }
  });

  // Düzenleme modalındaki custom select'ler için event listener'lar
  document.addEventListener("click", (e) => {
    if (
      e.target.closest('.custom-select-trigger[data-type="editProject"]') ||
      e.target.closest('.custom-select-trigger[data-type="editPriority"]')
    ) {
      const trigger = e.target.closest(".custom-select-trigger");
      const options = trigger.parentNode.querySelector(".custom-options");
      trigger.classList.toggle("active");
      options.classList.toggle("active");
    }
  });

  document.addEventListener("click", (e) => {
    if (
      e.target.closest('.custom-options[data-type="editProject"] li') ||
      e.target.closest('.custom-options[data-type="editPriority"] li')
    ) {
      const option = e.target;
      const parentContainer = option.closest(".custom-select-container");
      const trigger = parentContainer.querySelector(".custom-select-trigger");
      const hiddenInput = parentContainer.querySelector(
        `#${trigger.dataset.type.replace("edit", "").toLowerCase()}`
      );

      trigger.textContent = option.textContent;
      hiddenInput.value = option.dataset.value;

      trigger.classList.remove("active");
      parentContainer
        .querySelector(".custom-options")
        .classList.remove("active");
    }
  });
});
